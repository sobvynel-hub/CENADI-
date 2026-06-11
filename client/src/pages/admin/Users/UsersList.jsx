import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Upload, Pencil, Trash2, Eye, Filter, X, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/ui/Table';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import { usersApi } from '../../../api/users';
import { divisionsApi } from '../../../api/divisions';
import { exportCSV } from '../../../utils/helpers';
import UserForm from './UserForm';
import { useAuth } from '../../../hooks/useAuth';

// ✅ Divisions officielles CENADI
const OFFICIAL_DIVISIONS = [
  { value: 'DAAF', label: 'DAAF - Division des Affaires Administratives et Financières' },
  { value: 'DEL', label: 'DEL - Division de l\'Exploitation et des Logiciels' },
  { value: 'DEP', label: 'DEP - Division des Etudes et des Projets' },
  { value: 'DIRE', label: 'DIRE - Division de l\'Informatique appliquée à la Recherche et à l\'Enseignement' },
  { value: 'DSI', label: 'DSI - Division du Système d\'Information (MINFI)' },
  { value: 'DTB', label: 'DTB - Division de la Télématique et de la Bureautique' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'Tous les rôles' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'Personnel' },
];

export default function UsersList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, divisionsData] = await Promise.all([
        usersApi.getAll(),
        divisionsApi.getAll()
      ]);
      
      const usersArray = usersResponse?.data || (Array.isArray(usersResponse) ? usersResponse : []);
      const divisionsArray = divisionsData?.data || (Array.isArray(divisionsData) ? divisionsData : []);
      
      setUsers(usersArray);
      setDivisions(divisionsArray);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des données');
      setUsers([]);
      setDivisions([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filtered = useMemo(() => {
    let result = [...users];
    
    // Filtre par recherche
    if (search) {
      result = result.filter(u => 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filtre par rôle
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }
    
    // Filtre par division
    if (divisionFilter) {
      result = result.filter(u => u.division === divisionFilter);
    }
    
    return result;
  }, [users, search, roleFilter, divisionFilter]);

  // Compter les filtres actifs
  const activeFiltersCount = [search, roleFilter, divisionFilter].filter(Boolean).length;

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setDivisionFilter('');
  };

  const handleDelete = async () => {
    try {
      await usersApi.delete(deleteId);
      toast.success('Personnel supprimé');
      loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await usersApi.importCSV(file);
      toast.success('Import réussi');
      loadData();
    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de l\'import');
    }
  };

  const getRoleBadgeClasses = (role) => {
    if (role === 'super_admin') {
      return 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    }
    if (role === 'admin') {
      return 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    }
    return 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300';
  };

  const getRoleLabel = (role) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    return 'Personnel';
  };

  const getDivisionLabel = (divisionCode) => {
    const division = OFFICIAL_DIVISIONS.find(d => d.value === divisionCode);
    return division ? division.label : divisionCode || 'Non assignée';
  };

  const columns = [
    { 
      key: 'firstName', 
      label: 'Nom complet',
      render: (val, row) => (
        <div>
          <div className="text-slate-800 dark:text-white font-medium">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{row.email}</div>
        </div>
      )
    },
    { 
      key: 'division', 
      label: 'Division',
      render: (val) => (
        <div className="text-slate-600 dark:text-slate-300 text-sm">
          {getDivisionLabel(val)}
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Rôle', 
      render: (val) => (
        <span className={getRoleBadgeClasses(val)}>
          {getRoleLabel(val)}
        </span>
      )
    },
    {
      key: '_id', 
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <Link 
            to={`/admin/users/${row._id}`} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" 
            title="Voir"
          >
            <Eye size={15} />
          </Link>
          
          {isSuperAdmin && (
            <button 
              onClick={() => { setEditUser(row); setShowForm(true); }} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Modifier"
            >
              <Pencil size={15} />
            </button>
          )}
          
          {isSuperAdmin && row._id !== currentUser?._id && (
            <button 
              onClick={() => setDeleteId(row._id)} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Personnel</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{filtered.length} personnel</p>
        </div>
        
        {isSuperAdmin && (
          <div className="flex gap-2">
            <label className="btn-secondary cursor-pointer">
              <Upload size={15} /> Import CSV
              <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={() => exportCSV(users, 'personnel.csv')} className="btn-secondary">
              <Download size={15} /> Export
            </button>
            <button onClick={() => { setEditUser(null); setShowForm(true); }} className="btn-primary">
              <Plus size={15} /> Nouveau
            </button>
          </div>
        )}
      </div>
      
      {/* Barre de recherche avec bouton filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            onClear={() => setSearch('')} 
            placeholder="Rechercher par nom, prénom ou email..." 
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
              Filtres
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Réinitialiser tous
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Filtre par rôle */}
            <Select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              options={ROLE_OPTIONS}
              placeholder="Rôle"
              className="w-full"
            />
            
            {/* Filtre par division */}
            <Select
              value={divisionFilter}
              onChange={e => setDivisionFilter(e.target.value)}
              options={[
                { value: '', label: 'Toutes les divisions' },
                ...OFFICIAL_DIVISIONS.map(d => ({ value: d.value, label: d.label }))
              ]}
              placeholder="Division"
              className="w-full"
            />
          </div>
        </div>
      )}
      
      {/* Compteur de résultats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-white">{filtered.length}</span> 
          personnel{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <Table columns={columns} data={filtered} />
      </div>
      
      {/* Modals */}
      {isSuperAdmin && (
        <UserForm 
          open={showForm} 
          onClose={() => { setShowForm(false); setEditUser(null); }} 
          onSave={loadData} 
          initial={editUser} 
          divisions={OFFICIAL_DIVISIONS.map(d => ({ _id: d.value, name: d.label }))}
        />
      )}
      
      <Modal 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        title="Confirmer la suppression"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Annuler</button>
            <button onClick={handleDelete} className="btn-danger">Supprimer</button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">Êtes-vous sûr de vouloir supprimer ce personnel ?</p>
      </Modal>
    </div>
  );
}