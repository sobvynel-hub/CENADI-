import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Download, Pencil, Trash2, Eye, Search, UserPlus, Briefcase, FileText,
  X, Filter, SlidersHorizontal, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/ui/Pagination';
import Loader from '../../../components/common/Loader';
import { personalTrainingsApi } from '../../../api/personalTrainings';
import { usersApi } from '../../../api/users';
import { divisionsApi } from '../../../api/divisions';
import { formatDate, exportCSV } from '../../../utils/helpers';

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Rejeté' },
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

export default function PersonalTrainingsList() {
  const [trainings, setTrainings] = useState([]);
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États de recherche et filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  
  const [showForm, setShowForm] = useState(false);
  const [editTraining, setEditTraining] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewTraining, setViewTraining] = useState(null);
  
  const [userSearch, setUserSearch] = useState('');
  
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
    trainingName: '',
    provider: '',
    startDate: '',
    endDate: '',
    duration: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trainingsRes, usersRes, divisionsRes] = await Promise.all([
        personalTrainingsApi.getAll({ limit: 1000 }),
        usersApi.getAll(),
        divisionsApi.getAll(),
      ]);
      
      setTrainings(trainingsRes?.data || (Array.isArray(trainingsRes) ? trainingsRes : []));
      setUsers(usersRes?.data || (Array.isArray(usersRes) ? usersRes : []));
      setDivisions(divisionsRes?.data || (Array.isArray(divisionsRes) ? divisionsRes : []));
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les déclarations
  const filtered = useMemo(() => {
    let result = [...trainings];
    
    // Filtre par recherche (personnel, formation, prestataire)
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t => 
        `${t.userId?.firstName || ''} ${t.userId?.lastName || ''}`.toLowerCase().includes(searchLower) ||
        (t.trainingName || '').toLowerCase().includes(searchLower) ||
        (t.provider || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Filtre par statut
    if (statusFilter) {
      result = result.filter(t => t.status === statusFilter);
    }
    
    // Filtre par division
    if (divisionFilter) {
      result = result.filter(t => t.userId?.division === divisionFilter);
    }
    
    // Filtre par année
    if (yearFilter) {
      result = result.filter(t => {
        const date = t.createdAt ? new Date(t.createdAt) : new Date();
        return date.getFullYear().toString() === yearFilter;
      });
    }
    
    return result;
  }, [trainings, search, statusFilter, divisionFilter, yearFilter]);

  // Compter les filtres actifs
  const activeFiltersCount = [search, statusFilter, divisionFilter, yearFilter].filter(Boolean).length;

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDivisionFilter('');
    setYearFilter('');
    setPage(1);
  };

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const searchTerm = userSearch.toLowerCase();
    return fullName.includes(searchTerm) || email.includes(searchTerm);
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

  const handleCreateUser = async () => {
    if (!newUser.firstName.trim()) {
      toast.error('Le prénom est requis');
      return;
    }
    if (!newUser.lastName.trim()) {
      toast.error('Le nom est requis');
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

  const handleSave = async () => {
    if (!form.userId) {
      toast.error('Veuillez sélectionner un personnel');
      return;
    }
    if (!form.trainingName.trim()) {
      toast.error('Veuillez saisir le nom de la formation');
      return;
    }
    if (!form.provider.trim()) {
      toast.error('Veuillez saisir le prestataire');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Veuillez saisir les dates');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        userId: form.userId,
        trainingName: form.trainingName.trim(),
        provider: form.provider.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        duration: parseInt(form.duration) || 0,
        description: form.description,
      };
      
      if (editTraining) {
        await personalTrainingsApi.update(editTraining._id, data);
        toast.success('Déclaration modifiée');
      } else {
        await personalTrainingsApi.create(data);
        toast.success('Déclaration ajoutée');
      }
      
      setShowForm(false);
      setEditTraining(null);
      setForm({
        userId: '',
        userName: '',
        userEmail: '',
        userDivision: '',
        userPhone: '',
        userPosition: '',
        trainingName: '',
        provider: '',
        startDate: '',
        endDate: '',
        duration: '',
        description: '',
      });
      setUserSearch('');
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
      await personalTrainingsApi.delete(deleteId);
      toast.success('Déclaration supprimée');
      loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  const openEditModal = (training) => {
    setEditTraining(training);
    setForm({
      userId: training.userId?._id || '',
      userName: `${training.userId?.firstName || ''} ${training.userId?.lastName || ''}`,
      userEmail: training.userId?.email || '',
      userDivision: training.userId?.division || 'Non spécifiée',
      userPhone: training.userId?.phone || '',
      userPosition: training.userId?.position || '',
      trainingName: training.trainingName || '',
      provider: training.provider || '',
      startDate: training.startDate ? training.startDate.split('T')[0] : '',
      endDate: training.endDate ? training.endDate.split('T')[0] : '',
      duration: training.duration || '',
      description: training.description || '',
    });
    setShowForm(true);
  };

  const openViewModal = (training) => {
    setViewTraining(training);
  };

  const columns = [
    { key: 'user', label: 'Personnel', render: (_, row) => `${row.userId?.firstName || ''} ${row.userId?.lastName || ''}` },
    { key: 'division', label: 'Division', render: (_, row) => row.userId?.division || '-' },
    { key: 'trainingName', label: 'Formation', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'provider', label: 'Prestataire' },
    { key: 'duration', label: 'Durée', render: (val) => `${val || 0}h` },
    { key: 'period', label: 'Période', render: (_, row) => `${formatDate(row.startDate)} → ${formatDate(row.endDate)}` },
    { key: 'status', label: 'Statut', render: (val) => <Badge status={val} /> },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <button onClick={() => openViewModal(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Voir">
            <Eye size={15} />
          </button>
          <button onClick={() => openEditModal(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Modifier">
            <Pencil size={15} />
          </button>
          <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Supprimer">
            <Trash2 size={15} />
          </button>
        </div>
      )
    },
  ];

  const handleExport = () => {
    const exportData = filtered.map(t => ({
      Personnel: `${t.userId?.firstName || ''} ${t.userId?.lastName || ''}`,
      Division: t.userId?.division || '',
      Formation: t.trainingName,
      Prestataire: t.provider,
      'Date début': formatDate(t.startDate),
      'Date fin': formatDate(t.endDate),
      Durée: `${t.duration || 0}h`,
      Statut: t.status === 'pending' ? 'En attente' : t.status === 'approved' ? 'Approuvé' : 'Rejeté',
    }));
    exportCSV(exportData, 'declarations_personnelles.csv');
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Formations Personnelles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Formations suivies par le personnel à titre personnel (stages, certifications externes)
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => { setEditTraining(null); setShowForm(true); }} className="btn-primary">
            <Plus size={15} /> Nouvelle déclaration
          </button>
        </div>
      </div>

      {/* Barre de recherche avec bouton filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            onClear={() => setSearch('')} 
            placeholder="Rechercher par personnel, formation ou prestataire..." 
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
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Réinitialiser tous
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtre par statut */}
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={STATUS_OPTIONS}
              placeholder="Statut"
              className="w-full"
            />
            
            {/* Filtre par division */}
            <Select
              value={divisionFilter}
              onChange={e => setDivisionFilter(e.target.value)}
              options={OFFICIAL_DIVISIONS}
              placeholder="Division"
              className="w-full"
            />
            
            {/* Filtre par année */}
            <Select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              options={getYearOptions()}
              placeholder="Année"
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-white">{filtered.length}</span> 
          déclaration{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="ml-3 text-xs text-primary-500 hover:text-primary-600 underline"
            >
              Effacer tous les filtres
            </button>
          )}
        </p>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <Table columns={columns} data={paginated} emptyText="Aucune déclaration trouvée" />
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} perPage={PER_PAGE} />
          </div>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditTraining(null); setUserSearch(''); }}
        title={editTraining ? 'Modifier la déclaration' : 'Nouvelle déclaration personnelle'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            <button onClick={handleSave} disabled={submitting} className="btn-primary">
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
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

          {/* Informations formation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de la formation *</label>
              <input
                type="text"
                value={form.trainingName}
                onChange={(e) => setForm({ ...form, trainingName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                placeholder="Ex: React Avancé, Certification AWS, etc."
                required
              />
              <p className="text-xs text-slate-400 mt-1">Formation externe (non référencée dans le catalogue)</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prestataire / Organisme *</label>
              <input
                type="text"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                placeholder="Ex: OpenClassrooms, Udemy, Coursera"
                required
              />
            </div>
          </div>

          {/* Dates et durée */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date début *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date fin *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Durée (heures)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                placeholder="40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description / Compétences acquises</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg resize-none dark:bg-slate-800 dark:border-slate-600"
              placeholder="Décrivez la formation, les compétences acquises..."
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>ℹ️ Information :</strong> Cette déclaration concerne une formation suivie à titre personnel.
              Vous pouvez modifier les informations à tout moment.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal création personnel */}
      <Modal
        open={showNewUserModal}
        onClose={() => { setShowNewUserModal(false); setNewUser({ employeeId: '', firstName: '', lastName: '', email: '', password: 'Temp123456!', division: '', phone: '', position: '' }); }}
        title="Créer un nouveau personnel"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowNewUserModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={handleCreateUser} disabled={creatingUser} className="btn-primary">
              {creatingUser ? 'Création...' : 'Créer le personnel'}
            </button>
          </div>
        }
      >
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

      {/* Modal visualisation */}
      <Modal open={!!viewTraining} onClose={() => setViewTraining(null)} title="Détails de la déclaration" size="lg">
        {viewTraining && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <UserPlus size={18} /> Informations personnel
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><p className="text-xs text-slate-400">Nom complet</p><p className="font-medium">{viewTraining.userId?.firstName} {viewTraining.userId?.lastName}</p></div>
                <div><p className="text-xs text-slate-400">Email</p><p className="font-medium">{viewTraining.userId?.email}</p></div>
                <div><p className="text-xs text-slate-400">Division</p><p className="font-medium">{viewTraining.userId?.division || '-'}</p></div>
                <div><p className="text-xs text-slate-400">Poste</p><p className="font-medium">{viewTraining.userId?.position || '-'}</p></div>
              </div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase size={18} /> Formation externe
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-400">Formation</p><p className="font-medium">{viewTraining.trainingName}</p></div>
                <div><p className="text-xs text-slate-400">Prestataire</p><p className="font-medium">{viewTraining.provider}</p></div>
                <div><p className="text-xs text-slate-400">Période</p><p className="font-medium">{formatDate(viewTraining.startDate)} → {formatDate(viewTraining.endDate)}</p></div>
                <div><p className="text-xs text-slate-400">Durée</p><p className="font-medium">{viewTraining.duration || 0} heures</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-400">Description</p><p className="text-sm">{viewTraining.description || 'Aucune description'}</p></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={18} /> Informations de la déclaration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-400">Statut</p><Badge status={viewTraining.status} /></div>
                <div><p className="text-xs text-slate-400">Soumise le</p><p className="font-medium">{formatDate(viewTraining.createdAt)}</p></div>
                <div className="col-span-2"><p className="text-xs text-slate-400">Commentaire</p><p className="text-sm">{viewTraining.validationComment || 'Aucun commentaire'}</p></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal suppression */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmer la suppression" footer={
        <><button onClick={() => setDeleteId(null)} className="btn-secondary">Annuler</button><button onClick={handleDelete} className="btn-danger">Supprimer</button></>
      }>
        <p className="text-slate-600 dark:text-slate-400">Êtes-vous sûr de vouloir supprimer cette déclaration ? Cette action est irréversible.</p>
      </Modal>
    </div>
  );
}