import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Shield, Search, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/ui/Table';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import { adminApi } from '../../../api/admin';
import AdminForm from './AdminForm';
import { useAuth } from '../../../hooks/useAuth';

export default function AdminsList() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAdmins();
      const adminsArray = response?.data || (Array.isArray(response) ? response : []);
      setAdmins(adminsArray);
    } catch (error) {
      console.error('Erreur chargement admins:', error);
      toast.error('Erreur lors du chargement');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editAdmin) {
        await adminApi.updateAdmin(editAdmin._id, data);
        toast.success('Administrateur modifié avec succès');
      } else {
        await adminApi.createAdmin(data);
        toast.success('Administrateur créé avec succès');
      }
      loadAdmins();
      setShowForm(false);
      setEditAdmin(null);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteAdmin(deleteId);
      toast.success('Administrateur supprimé avec succès');
      loadAdmins();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredAdmins = useMemo(() => {
    if (!searchTerm.trim()) return admins;
    const term = searchTerm.toLowerCase().trim();
    return admins.filter(admin => 
      admin.firstName?.toLowerCase().includes(term) ||
      admin.lastName?.toLowerCase().includes(term) ||
      admin.email?.toLowerCase().includes(term) ||
      admin.role?.toLowerCase().includes(term)
    );
  }, [admins, searchTerm]);

  const columns = [
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Rôle', 
      render: (val) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          val === 'super_admin' 
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          <Shield size={12} /> 
          {val === 'super_admin' ? 'Super Admin' : 'Admin'}
        </span>
      ) 
    },
    { 
      key: '_id', 
      label: 'Actions', 
      render: (_, row) => (
        <div className="flex gap-1">
          <button 
            onClick={() => { setEditAdmin(row); setShowForm(true); }} 
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Voir/Modifier"
          >
            <Eye size={15} />
          </button>
          
          {isSuperAdmin && (
            <button 
              onClick={() => setDeleteId(row._id)} 
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ) 
    },
  ];

  const tableData = Array.isArray(filteredAdmins) ? filteredAdmins : [];

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // ✅ Fonction pour ouvrir le modal d'ajout
  const handleOpenAddForm = () => {
    console.log('🔵 Ouverture du formulaire d\'ajout');
    setEditAdmin(null);
    setShowForm(true);
  };

  // ✅ Fonction pour fermer le modal
  const handleCloseForm = () => {
    console.log('🔴 Fermeture du formulaire');
    setShowForm(false);
    setEditAdmin(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Administrateurs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez les administrateurs de la plateforme
          </p>
        </div>
        
        {isSuperAdmin && (
          <button 
            onClick={handleOpenAddForm}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={15} /> Nouvel administrateur
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, prénom, email ou rôle..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <Table 
          columns={columns} 
          data={tableData} 
          emptyText={searchTerm ? `Aucun administrateur trouvé pour "${searchTerm}"` : "Aucun administrateur trouvé"} 
        />
        
        {tableData.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
            {tableData.length} administrateur(s) trouvé(s)
            {searchTerm && ` pour "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      <AdminForm 
        open={showForm} 
        onClose={handleCloseForm} 
        onSave={handleSave} 
        initial={editAdmin} 
      />

      {/* Modal Suppression */}
      <Modal 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        title="Confirmer la suppression"
        size="md"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Annuler</button>
            <button onClick={handleDelete} className="btn-danger">Supprimer</button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Êtes-vous sûr de vouloir supprimer cet administrateur ?
        </p>
        <p className="text-sm text-red-500 mt-2">
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}