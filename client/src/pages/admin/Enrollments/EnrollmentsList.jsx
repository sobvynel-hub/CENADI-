import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Download, Pencil, Trash2, Eye, Search, UserPlus, 
  BookOpen, Clipboard, CheckCircle, XCircle, Upload, FileSpreadsheet,
  Award, X, Filter, SlidersHorizontal, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/ui/Pagination';
import Loader from '../../../components/common/Loader';
import { enrollmentsApi } from '../../../api/enrollments';
import { usersApi } from '../../../api/users';
import { formationsApi } from '../../../api/formations';
import { divisionsApi } from '../../../api/divisions';
import { attendancesApi } from '../../../api/attendances';
import { formatDate, exportCSV } from '../../../utils/helpers';

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'failed', label: 'Échoué' },
  { value: 'passed', label: 'Réussi' },
];

const RESULT_OPTIONS = [
  { value: '', label: 'Tous les résultats' },
  { value: 'passed', label: ' Réussi' },
  { value: 'failed', label: ' Échoué' },
  { value: 'pending', label: ' En attente' },
];

// Divisions officielles CENADI
const OFFICIAL_DIVISIONS = [
  { value: '', label: 'Toutes les divisions' },
  { value: 'DAAF', label: 'DAAF - Division des Affaires Administratives et Financières' },
  { value: 'DEL', label: 'DEL - Division de l\'Exploitation et des Logiciels' },
  { value: 'DEP', label: 'DEP - Division des Etudes et des Projets' },
  { value: 'DIRE', label: 'DIRE - Division de l\'Informatique appliquée à la Recherche et à l\'Enseignement' },
  { value: 'DSI', label: 'DSI - Division du Système d\'Information (MINFI)' },
  { value: 'DTB', label: 'DTB - Division de la Télématique et de la Bureautique' },
];

// Générer les années pour le filtre
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return [{ value: '', label: 'Toutes les années' }, ...years];
};

export default function EnrollmentsList() {
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États de recherche et filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [formationFilter, setFormationFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  
  const [showForm, setShowForm] = useState(false);
  const [editEnrollment, setEditEnrollment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewEnrollment, setViewEnrollment] = useState(null);
  
  const [userSearch, setUserSearch] = useState('');
  const [formationSearch, setFormationSearch] = useState('');
  
  // États pour l'import Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [selectedFormationForImport, setSelectedFormationForImport] = useState('');
  
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: 'Temp123456!',
    division: '',
    phone: '',
    position: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  
  const [form, setForm] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    userDivision: '',
    userPhone: '',
    userPosition: '',
    formationId: '',
    formationTitle: '',
    status: 'confirmed',
    result: 'pending',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, usersRes, formationsRes, divisionsRes] = await Promise.all([
        enrollmentsApi.getAll(),
        usersApi.getAll(),
        formationsApi.getAll(),
        divisionsApi.getAll(),
      ]);
      
      setEnrollments(enrollmentsRes?.data || (Array.isArray(enrollmentsRes) ? enrollmentsRes : []));
      setUsers(usersRes?.data || (Array.isArray(usersRes) ? usersRes : []));
      setFormations(formationsRes?.data || (Array.isArray(formationsRes) ? formationsRes : []));
      setDivisions(divisionsRes?.data || (Array.isArray(divisionsRes) ? divisionsRes : []));
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les inscriptions
  const filtered = useMemo(() => {
    let result = [...enrollments];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(e => 
        `${e.userId?.firstName || ''} ${e.userId?.lastName || ''}`.toLowerCase().includes(searchLower) ||
        e.userId?.email?.toLowerCase().includes(searchLower) ||
        e.formationId?.title?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter) result = result.filter(e => e.status === statusFilter);
    if (resultFilter) result = result.filter(e => e.result === resultFilter);
    if (divisionFilter) result = result.filter(e => e.userId?.division === divisionFilter);
    if (formationFilter) result = result.filter(e => e.formationId?._id === formationFilter);
    if (yearFilter) {
      result = result.filter(e => {
        const date = e.registrationDate ? new Date(e.registrationDate) : new Date(e.createdAt);
        return date.getFullYear().toString() === yearFilter;
      });
    }
    
    return result;
  }, [enrollments, search, statusFilter, resultFilter, divisionFilter, formationFilter, yearFilter]);

  const activeFiltersCount = [search, statusFilter, resultFilter, divisionFilter, formationFilter, yearFilter].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setResultFilter('');
    setDivisionFilter('');
    setFormationFilter('');
    setYearFilter('');
    setPage(1);
  };

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const normalizedData = jsonData.map(row => {
        const getValue = (keys) => {
          for (const key of keys) {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
              return row[key];
            }
          }
          return '';
        };

        return {
          firstName: getValue(['Prénom', 'prenom', 'firstName', 'firstname']),
          lastName: getValue(['Nom', 'nom', 'lastName', 'lastname']),
          email: getValue(['Email', 'email', 'EMAIL']),
          division: getValue(['Division', 'division']),
          formationTitle: getValue(['Formation', 'formation', 'Titre formation']),
          status: normalizeStatus(getValue(['Statut', 'status'])),
          presence: normalizeBoolean(getValue(['Présence', 'presence'])),
          result: normalizeResult(getValue(['Réussite', 'reussite', 'result'])),
          registrationDate: parseDateValue(getValue(['Date', 'date', 'Date inscription'])),
          notes: getValue(['Notes', 'notes']),
        };
      }).filter(row => row.email && (row.firstName || row.lastName));

      if (normalizedData.length === 0) {
        toast.error('Aucune donnée valide trouvée');
        return;
      }

      setImportData(normalizedData);
      setShowImportModal(true);
      toast.success(`${normalizedData.length} inscription(s) trouvée(s) dans le fichier`);
    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de la lecture du fichier');
    } finally {
      event.target.value = '';
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return 'confirmed';
    const s = String(status).toLowerCase().trim();
    if (s === 'confirmé' || s === 'confirme' || s === 'confirmed') return 'confirmed';
    if (s === 'en attente' || s === 'pending') return 'pending';
    if (s === 'annulé' || s === 'annule' || s === 'cancelled') return 'cancelled';
    if (s === 'échoué' || s === 'echoue' || s === 'failed') return 'failed';
    if (s === 'réussi' || s === 'reussi' || s === 'passed') return 'passed';
    return 'confirmed';
  };

  const normalizeResult = (result) => {
    if (!result) return 'pending';
    const r = String(result).toLowerCase().trim();
    if (r === 'oui' || r === 'yes' || r === 'true' || r === 'réussi' || r === 'reussi' || r === 'passed') return 'passed';
    if (r === 'non' || r === 'no' || r === 'false' || r === 'échoué' || r === 'echoue' || r === 'failed') return 'failed';
    return 'pending';
  };

  const normalizeBoolean = (value) => {
    if (!value) return false;
    const v = String(value).toLowerCase().trim();
    return v === 'oui' || v === 'yes' || v === 'true' || v === '1' || v === 'présent' || v === 'present';
  };

  const parseDateValue = (dateValue) => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'number') {
      return new Date((dateValue - 25569) * 86400 * 1000);
    }
    if (typeof dateValue === 'string') {
      let parts;
      if (dateValue.includes('/')) parts = dateValue.split('/');
      else if (dateValue.includes('-')) parts = dateValue.split('-');
      else return new Date(dateValue);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
    return new Date();
  };

  const processImport = async () => {
    if (!selectedFormationForImport) {
      toast.error('Veuillez sélectionner une formation');
      return;
    }

    setImporting(true);
    let successCount = 0;
    let errorCount = 0;
    let createdUsersCount = 0;

    for (let i = 0; i < importData.length; i++) {
      setImportProgress({ current: i + 1, total: importData.length });
      const person = importData[i];

      try {
        let user = users.find(u => u.email?.toLowerCase() === person.email?.toLowerCase());
        
        if (!user) {
          const newUserData = {
            employeeId: `EMP-${Date.now()}-${i}`,
            firstName: person.firstName,
            lastName: person.lastName,
            email: person.email,
            password: 'Temp123456!',
            division: person.division || null,
          };
          const response = await usersApi.create(newUserData);
          user = response?.data || response;
          createdUsersCount++;
          setUsers(prev => [...prev, user]);
        }

        const existingEnrollment = enrollments.find(
          e => e.userId?._id === user._id && e.formationId?._id === selectedFormationForImport
        );

        if (!existingEnrollment) {
          const enrollmentData = {
            userId: user._id,
            formationId: selectedFormationForImport,
            status: person.status,
            notes: person.notes || '',
          };
          await enrollmentsApi.create(enrollmentData);
          
          if (person.presence) {
            await attendancesApi.markAttendanceDirect({
              userId: user._id,
              formationId: selectedFormationForImport,
              status: 'present'
            });
          }
          
          if (person.result && person.result !== 'pending') {
            await enrollmentsApi.update(enrollmentData.userId, { result: person.result });
          }
          
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Erreur pour ${person.email}:`, error);
        errorCount++;
      }
    }

    await loadData();
    setShowImportModal(false);
    setImportData([]);
    setSelectedFormationForImport('');
    setImportProgress({ current: 0, total: 0 });
    
    toast.success(
      `${successCount} inscriptions créées, ${createdUsersCount} nouveaux personnel créés, ${errorCount} déjà inscrits ou en erreur`
    );
    setImporting(false);
  };

  const markAttendance = async (enrollment, status) => {
    try {
      await attendancesApi.markAttendanceDirect({
        userId: enrollment.userId?._id,
        formationId: enrollment.formationId?._id,
        status: status
      });
      
      // Mettre à jour l'état local
      setEnrollments(prevEnrollments => 
        prevEnrollments.map(e => {
          if (e._id === enrollment._id) {
            return { ...e, attended: status === 'present' };
          }
          return e;
        })
      );
      
      toast.success(`Présence marquée : ${status === 'present' ? 'Présent' : 'Absent'}`);
    } catch (error) {
      console.error('Erreur marquage présence:', error);
      toast.error('Erreur lors du marquage de présence');
      loadData();
    }
  };

  const updateResult = async (enrollment, result) => {
    try {
      await enrollmentsApi.update(enrollment._id, { result });
      setEnrollments(prevEnrollments =>
        prevEnrollments.map(e => {
          if (e._id === enrollment._id) {
            return { ...e, result };
          }
          return e;
        })
      );
      toast.success(`Résultat mis à jour : ${result === 'passed' ? 'Réussi' : result === 'failed' ? 'Échoué' : 'En attente'}`);
    } catch (error) {
      console.error('Erreur mise à jour résultat:', error);
      toast.error('Erreur lors de la mise à jour du résultat');
      loadData();
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName.trim()) {
      toast.error('Le prénom est requis');
      return;
    }
    if (!newUser.lastName.trim()) {
      toast.error('Le nom is requis');
      return;
    }
    if (!newUser.email.trim()) {
      toast.error('L\'email est requis');
      return;
    }
    if (!newUser.email.includes('@')) {
      toast.error('Email invalide (doit contenir @)');
      return;
    }

    setCreatingUser(true);
    try {
      const response = await usersApi.create({
        employeeId: newUser.employeeId || `EMP-${Date.now()}`,
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        division: newUser.division || null,
        phone: newUser.phone || '',
        position: newUser.position || '',
      });
      
      const newUserData = response?.data || response;
      toast.success('Personnel créé avec succès');
      
      const usersRes = await usersApi.getAll();
      setUsers(usersRes?.data || (Array.isArray(usersRes) ? usersRes : []));
      
      setForm({
        ...form,
        userId: newUserData._id,
        userName: `${newUserData.firstName} ${newUserData.lastName}`,
        userEmail: newUserData.email,
        userDivision: newUserData.division || 'Non spécifiée',
        userPhone: newUserData.phone || '',
        userPosition: newUserData.position || '',
      });
      
      setShowNewUserModal(false);
      setNewUser({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        password: 'Temp123456!',
        division: '',
        phone: '',
        position: '',
      });
    } catch (error) {
      console.error('Erreur création personnel:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const searchTerm = userSearch.toLowerCase();
    return fullName.includes(searchTerm) || email.includes(searchTerm);
  });

  const filteredFormations = formations.filter(formation => {
    const title = (formation.title || '').toLowerCase();
    const searchTerm = formationSearch.toLowerCase();
    return title.includes(searchTerm);
  });

  const handleSelectUser = (user) => {
    setForm({
      ...form,
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      userDivision: user.division || 'Non spécifiée',
      userPhone: user.phone || '',
      userPosition: user.position || '',
    });
    setUserSearch('');
  };

  const handleSelectFormation = (formation) => {
    setForm({
      ...form,
      formationId: formation._id,
      formationTitle: formation.title,
    });
    setFormationSearch('');
  };

  const handleSave = async () => {
    if (!form.userId) {
      toast.error('Veuillez sélectionner un personnel');
      return;
    }
    if (!form.formationId) {
      toast.error('Veuillez sélectionner une formation');
      return;
    }

    setSubmitting(true);
    try {
      if (editEnrollment) {
        await enrollmentsApi.update(editEnrollment._id, {
          status: form.status,
          result: form.result,
          notes: form.notes,
        });
        toast.success('Inscription modifiée');
      } else {
        await enrollmentsApi.create({
          userId: form.userId,
          formationId: form.formationId,
          status: form.status,
          notes: form.notes,
        });
        toast.success('Inscription créée');
      }
      setShowForm(false);
      setEditEnrollment(null);
      setForm({
        userId: '',
        userName: '',
        userEmail: '',
        userDivision: '',
        userPhone: '',
        userPosition: '',
        formationId: '',
        formationTitle: '',
        status: 'confirmed',
        result: 'pending',
        notes: '',
      });
      setUserSearch('');
      setFormationSearch('');
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await enrollmentsApi.delete(deleteId);
      toast.success('Inscription supprimée');
      loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  const openEditModal = (enrollment) => {
    setEditEnrollment(enrollment);
    setForm({
      userId: enrollment.userId?._id || '',
      userName: `${enrollment.userId?.firstName || ''} ${enrollment.userId?.lastName || ''}`,
      userEmail: enrollment.userId?.email || '',
      userDivision: enrollment.userId?.division || 'Non spécifiée',
      userPhone: enrollment.userId?.phone || '',
      userPosition: enrollment.userId?.position || '',
      formationId: enrollment.formationId?._id || '',
      formationTitle: enrollment.formationId?.title || '',
      status: enrollment.status || 'confirmed',
      result: enrollment.result || 'pending',
      notes: enrollment.notes || '',
    });
    setShowForm(true);
  };

  const openViewModal = (enrollment) => {
    setViewEnrollment(enrollment);
  };

  const getResultBadge = (result) => {
    if (result === 'passed') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"> Réussi</span>;
    }
    if (result === 'failed') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"> Échoué</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"> En attente</span>;
  };

  const columns = [
    { key: 'user', label: 'Personnel', render: (_, row) => `${row.userId?.firstName || ''} ${row.userId?.lastName || ''}` },
    { key: 'division', label: 'Division', render: (_, row) => row.userId?.division || '-' },
    { key: 'formation', label: 'Formation', render: (_, row) => row.formationId?.title || '-' },
    { key: 'registrationDate', label: 'Date', render: (val) => formatDate(val) },
    { key: 'status', label: 'Statut', render: (val) => <Badge status={val} /> },
    { key: 'result', label: 'Résultat', render: (val) => getResultBadge(val) },
    { 
      key: 'attended', 
      label: 'Présence', 
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => markAttendance(row, 'present')}
            className={`p-1.5 rounded-lg transition-colors ${
              row.attended === true 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : 'text-slate-400 dark:text-slate-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
            }`}
            title="Marquer présent"
          >
            <CheckCircle size={16} />
          </button>
          <button
            onClick={() => markAttendance(row, 'absent')}
            className={`p-1.5 rounded-lg transition-colors ${
              row.attended === false 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                : 'text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
            }`}
            title="Marquer absent"
          >
            <XCircle size={16} />
          </button>
        </div>
      )
    },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <button onClick={() => openViewModal(row)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Voir">
            <Eye size={15} />
          </button>
          <button onClick={() => openEditModal(row)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Modifier">
            <Pencil size={15} />
          </button>
          <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Supprimer">
            <Trash2 size={15} />
          </button>
        </div>
      )
    },
  ];

  const handleExport = () => {
    const exportData = filtered.map(e => ({
      Personnel: `${e.userId?.firstName || ''} ${e.userId?.lastName || ''}`,
      Division: e.userId?.division || '',
      Formation: e.formationId?.title || '',
      Date: formatDate(e.registrationDate),
      Statut: e.status,
      Présence: e.attended ? 'Présent' : 'Absent',
      Résultat: e.result === 'passed' ? 'Réussi' : e.result === 'failed' ? 'Échoué' : 'En attente',
      Notes: e.notes || '',
    }));
    exportCSV(exportData, 'inscriptions.csv');
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Inscriptions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gérez les inscriptions, présences et résultats</p>
        </div>
        <div className="flex gap-2">
          <label className="btn-secondary cursor-pointer">
            <FileSpreadsheet size={15} /> Importer Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} className="hidden" />
          </label>
          <button onClick={handleExport} className="btn-secondary"><Download size={15} /> Export CSV</button>
          <button onClick={() => { setEditEnrollment(null); setShowForm(true); }} className="btn-primary"><Plus size={15} /> Nouvelle inscription</button>
        </div>
      </div>

      {/* Barre de recherche avec bouton filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            onClear={() => setSearch('')} 
            placeholder="Rechercher par nom, email ou formation..." 
            className="flex-1" 
          />
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-white text-primary-600 rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Filter size={16} className="text-primary-500" />
              Filtres avancés
            </h3>
            <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-1">
              <X size={12} /> Réinitialiser tous
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} placeholder="Statut" className="w-full" />
            <Select value={resultFilter} onChange={e => setResultFilter(e.target.value)} options={RESULT_OPTIONS} placeholder="Résultat" className="w-full" />
            <Select value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)} options={OFFICIAL_DIVISIONS} placeholder="Division" className="w-full" />
            <Select value={formationFilter} onChange={e => setFormationFilter(e.target.value)} options={[{ value: '', label: 'Toutes les formations' }, ...formations.map(f => ({ value: f._id, label: f.title }))]} placeholder="Formation" className="w-full" />
          </div>
          
          <div className="mt-4">
            <Select value={yearFilter} onChange={e => setYearFilter(e.target.value)} options={getYearOptions()} placeholder="Année" className="w-full sm:w-64" />
          </div>
        </div>
      )}

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-white">{filtered.length}</span> 
          inscription{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
          {activeFiltersCount > 0 && (
            <button onClick={resetFilters} className="ml-3 text-xs text-primary-500 hover:text-primary-600 underline">
              Effacer tous les filtres
            </button>
          )}
        </p>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <Table columns={columns} data={paginated} emptyText="Aucune inscription trouvée" />
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} perPage={PER_PAGE} />
          </div>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditEnrollment(null); setUserSearch(''); setFormationSearch(''); }} title={editEnrollment ? 'Modifier l\'inscription' : 'Nouvelle inscription'} size="lg" footer={
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
          <button onClick={handleSave} disabled={submitting} className="btn-primary">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      }>
        <div className="space-y-5">
          {/* Sélection personnel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Personnel *</label>
              <button type="button" onClick={() => setShowNewUserModal(true)} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <UserPlus size={14} /> Créer un nouveau personnel
              </button>
            </div>
            {form.userId ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">{form.userName}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">{form.userEmail}</p>
                  <p className="text-xs text-green-500">{form.userDivision}</p>
                </div>
                <button onClick={() => { setForm({ ...form, userId: '', userName: '', userEmail: '', userDivision: '', userPhone: '', userPosition: '' }); setUserSearch(''); }} className="text-red-500 hover:text-red-700 text-sm">Changer</button>
              </div>
            ) : (
              <div>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Rechercher par nom ou email..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
                </div>
                {userSearch && filteredUsers.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto dark:border-slate-600">
                    {filteredUsers.map((user) => (
                      <button key={user._id} onClick={() => handleSelectUser(user)} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 border-b last:border-b-0 dark:border-slate-700">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500">{user.email} - {user.division || 'Sans division'}</p>
                      </button>
                    ))}
                  </div>
                )}
                {userSearch && filteredUsers.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">Aucun personnel trouvé. <button type="button" onClick={() => setShowNewUserModal(true)} className="text-primary-600">Créer un nouveau personnel</button></p>
                )}
              </div>
            )}
          </div>

          {/* Sélection formation */}
          <div>
            <label className="block text-sm font-medium mb-1">Formation *</label>
            {form.formationId ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div><p className="font-medium text-blue-800 dark:text-blue-300">{form.formationTitle}</p></div>
                <button onClick={() => { setForm({ ...form, formationId: '', formationTitle: '' }); setFormationSearch(''); }} className="text-red-500 hover:text-red-700 text-sm">Changer</button>
              </div>
            ) : (
              <div>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={formationSearch} onChange={(e) => setFormationSearch(e.target.value)} placeholder="Rechercher une formation..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
                </div>
                {formationSearch && filteredFormations.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto dark:border-slate-600">
                    {filteredFormations.map((formation) => (
                      <button key={formation._id} onClick={() => handleSelectFormation(formation)} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 border-b last:border-b-0 dark:border-slate-700">
                        <p className="font-medium">{formation.title}</p>
                        <p className="text-xs text-slate-500">{formation.trainer || 'Formateur non défini'}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statut et résultat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                <option value="confirmed">Confirmé</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulé</option>
                <option value="failed">Échoué</option>
                <option value="passed">Réussi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Résultat</label>
              <select value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                <option value="pending"> En attente</option>
                <option value="passed"> Réussi</option>
                <option value="failed"> Échoué</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" placeholder="Informations complémentaires..." />
          </div>
        </div>
      </Modal>

      {/* Modal création personnel */}
      <Modal open={showNewUserModal} onClose={() => { setShowNewUserModal(false); setNewUser({ employeeId: '', firstName: '', lastName: '', email: '', password: 'Temp123456!', division: '', phone: '', position: '' }); }} title="Créer un nouveau personnel" size="md" footer={
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowNewUserModal(false)} className="btn-secondary">Annuler</button>
          <button onClick={handleCreateUser} disabled={creatingUser} className="btn-primary">{creatingUser ? 'Création...' : 'Créer le personnel'}</button>
        </div>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Prénom *</label><input type="text" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" required /></div>
            <div><label className="block text-sm font-medium mb-1">Nom *</label><input type="text" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" placeholder="exemple@cenadi.cm" required /></div>
          <div><label className="block text-sm font-medium mb-1">Matricule</label><input type="text" value={newUser.employeeId} onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" placeholder="Auto-généré si vide" /></div>
          <div><label className="block text-sm font-medium mb-1">Division</label><select value={newUser.division} onChange={(e) => setNewUser({ ...newUser, division: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
            <option value="">Sélectionner une division</option>
            {OFFICIAL_DIVISIONS.filter(d => d.value).map(div => <option key={div.value} value={div.value}>{div.label}</option>)}
          </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Poste</label><input type="text" value={newUser.position} onChange={(e) => setNewUser({ ...newUser, position: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" /></div>
            <div><label className="block text-sm font-medium mb-1">Téléphone</label><input type="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" /></div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400"><strong>ℹ️ Information :</strong> Un mot de passe temporaire sera généré pour ce personnel.</p>
          </div>
        </div>
      </Modal>

      {/* Modal Import Excel */}
      <Modal open={showImportModal} onClose={() => { setShowImportModal(false); setImportData([]); setSelectedFormationForImport(''); }} title="Importer des inscriptions depuis Excel" size="lg" footer={
        <div className="flex justify-end gap-3">
          <button onClick={() => { setShowImportModal(false); setImportData([]); }} className="btn-secondary">Annuler</button>
          <button onClick={processImport} disabled={importing || !selectedFormationForImport} className="btn-primary">
            {importing ? 'Import en cours...' : `Importer ${importData.length} inscription(s)`}
          </button>
        </div>
      }>
        <div className="space-y-5">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
            <FileSpreadsheet size={48} className="text-primary-500 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Fichier chargé : <span className="font-medium">{importData.length} ligne(s)</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sélectionner la formation *</label>
            <select value={selectedFormationForImport} onChange={(e) => setSelectedFormationForImport(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
              <option value="">-- Choisir une formation --</option>
              {formations.map(formation => <option key={formation._id} value={formation._id}>{formation.title} - {formatDate(formation.startDate)}</option>)}
            </select>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Aperçu ({importData.length} ligne(s))</h3>
            <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto dark:border-slate-600">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                  <tr><th className="px-3 py-2">Prénom</th><th className="px-3 py-2">Nom</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Présence</th><th className="px-3 py-2">Résultat</th></tr>
                </thead>
                <tbody>
                  {importData.slice(0, 10).map((person, idx) => (
                    <tr key={idx} className="border-t dark:border-slate-700">
                      <td className="px-3 py-2">{person.firstName}</td>
                      <td className="px-3 py-2">{person.lastName}</td>
                      <td className="px-3 py-2">{person.email}</td>
                      <td className="px-3 py-2">{person.presence ? ' Présent' : ' Absent'}</td>
                      <td className="px-3 py-2">{person.result === 'passed' ? ' Réussi' : person.result === 'failed' ? ' Échoué' : ' En attente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {importing && (
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Import en cours...</span><span>{importProgress.current} / {importProgress.total}</span></div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }} /></div>
            </div>
          )}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400"><strong>Format du fichier Excel :</strong><br />Colonnes : Prénom, Nom, Email, Division, Formation, Statut, Présence (oui/non), Réussite (oui/non), Date, Notes</p>
          </div>
        </div>
      </Modal>

      {/* Modal visualisation */}
      <Modal open={!!viewEnrollment} onClose={() => setViewEnrollment(null)} title="Détails complets" size="lg">
        {viewEnrollment && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserPlus size={18} /> Informations personnel</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><p className="text-xs text-slate-400">Nom complet</p><p className="font-medium">{viewEnrollment.userId?.firstName} {viewEnrollment.userId?.lastName}</p></div>
                <div><p className="text-xs text-slate-400">Email</p><p className="font-medium">{viewEnrollment.userId?.email}</p></div>
                <div><p className="text-xs text-slate-400">Matricule</p><p className="font-medium">{viewEnrollment.userId?.employeeId || '-'}</p></div>
                <div><p className="text-xs text-slate-400">Division</p><p className="font-medium">{viewEnrollment.userId?.division || '-'}</p></div>
                <div><p className="text-xs text-slate-400">Poste</p><p className="font-medium">{viewEnrollment.userId?.position || '-'}</p></div>
                <div><p className="text-xs text-slate-400">Téléphone</p><p className="font-medium">{viewEnrollment.userId?.phone || '-'}</p></div>
              </div>
            </div>
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen size={18} /> Informations formation</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><p className="text-xs text-slate-400">Formation</p><p className="font-medium">{viewEnrollment.formationId?.title}</p></div>
                <div><p className="text-xs text-slate-400">Formateur</p><p className="font-medium">{viewEnrollment.formationId?.trainer || '-'}</p></div>
                <div><p className="text-xs text-slate-400">Dates</p><p className="font-medium">{formatDate(viewEnrollment.formationId?.startDate)} → {formatDate(viewEnrollment.formationId?.endDate)}</p></div>
                <div><p className="text-xs text-slate-400">Lieu</p><p className="font-medium">{viewEnrollment.formationId?.location || '-'}</p></div>
                <div><p className="text-xs text-slate-400">Capacité</p><p className="font-medium">{viewEnrollment.formationId?.currentEnrolled || 0}/{viewEnrollment.formationId?.maxCapacity || '∞'}</p></div>
                <div><p className="text-xs text-slate-400">Statut formation</p><Badge status={viewEnrollment.formationId?.status} /></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clipboard size={18} /> Détails de l'inscription</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><p className="text-xs text-slate-400">Date d'inscription</p><p className="font-medium">{formatDate(viewEnrollment.registrationDate)}</p></div>
                <div><p className="text-xs text-slate-400">Statut</p><Badge status={viewEnrollment.status} /></div>
                <div><p className="text-xs text-slate-400">Résultat</p>{getResultBadge(viewEnrollment.result)}</div>
                <div><p className="text-xs text-slate-400">Présence</p><p className="font-medium">{viewEnrollment.attended ? '✅ Présent' : '❌ Non présent'}</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-400">Notes</p><p className="text-sm">{viewEnrollment.notes || 'Aucune note'}</p></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal suppression */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmer la suppression" footer={
        <>
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Annuler</button>
          <button onClick={handleDelete} className="btn-danger">Supprimer</button>
        </>
      }>
        <p className="text-slate-600 dark:text-slate-400">Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action est irréversible.</p>
      </Modal>
    </div>
  );
}