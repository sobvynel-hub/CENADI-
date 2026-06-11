import { useState, useEffect, useMemo } from 'react';
import { Eye, Trash2, Search, Filter, X, SlidersHorizontal, CheckCircle, XCircle, Clock, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { suggestionsApi } from '../../../api/suggestions';
import Table from '../../../components/ui/Table';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/ui/Pagination';
import Loader from '../../../components/common/Loader';
import Badge from '../../../components/ui/Badge';
import { formatDate } from '../../../utils/helpers';

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'reviewed', label: 'Examiné' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Rejeté' },
  { value: 'implemented', label: 'Implémenté' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'Toutes priorités' },
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'urgent', label: 'Urgente' },
];

export default function SuggestionsManager() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [viewSuggestion, setViewSuggestion] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, id: null, newStatus: '', comment: '' });

  useEffect(() => {
    loadSuggestions();
  }, [statusFilter, priorityFilter]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const response = await suggestionsApi.getAll(params);
      const suggestionsData = response?.data || (Array.isArray(response) ? response : []);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return suggestions;
    const searchLower = search.toLowerCase();
    return suggestions.filter(s => 
      s.title?.toLowerCase().includes(searchLower) ||
      s.description?.toLowerCase().includes(searchLower) ||
      s.suggestedByName?.toLowerCase().includes(searchLower)
    );
  }, [suggestions, search]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const activeFiltersCount = [search, statusFilter, priorityFilter].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  const handleDelete = async () => {
    try {
      await suggestionsApi.delete(deleteId);
      toast.success('Suggestion supprimée');
      loadSuggestions();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await suggestionsApi.updateStatus(statusModal.id, {
        status: statusModal.newStatus,
        adminComment: statusModal.comment
      });
      toast.success('Statut mis à jour');
      loadSuggestions();
      setStatusModal({ open: false, id: null, newStatus: '', comment: '' });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority] || styles.medium}`}>{priority}</span>;
  };

  const columns = [
    { key: 'title', label: 'Titre', render: (val, row) => (
      <div><p className="font-semibold text-slate-800 dark:text-white">{val}</p><p className="text-xs text-slate-400">Par {row.suggestedByName}</p></div>
    )},
    { key: 'category', label: 'Catégorie', render: (val) => <Badge status={val} /> },
    { key: 'priority', label: 'Priorité', render: (val) => getPriorityBadge(val) },
    { key: 'votes', label: 'Votes', render: (val) => <span className="flex items-center gap-1"><ThumbsUp size={12} /> {val || 0}</span> },
    { key: 'status', label: 'Statut', render: (val) => <Badge status={val} /> },
    { key: 'createdAt', label: 'Suggéré le', render: (val) => formatDate(val) },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <button onClick={() => setViewSuggestion(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50" title="Voir">
            <Eye size={15} />
          </button>
          <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Supprimer">
            <Trash2 size={15} />
          </button>
        </div>
      )
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Suggestions formations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Idées de formations proposées par les employés</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Rechercher..." className="flex-1" />
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <SlidersHorizontal size={14} /> Filtres
            {activeFiltersCount > 0 && <span className="bg-white text-primary-600 rounded-full w-5 h-5 text-xs">{activeFiltersCount}</span>}
          </button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Filter size={16} className="text-primary-500" /> Filtres avancés</h3>
            <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-primary-500 flex items-center gap-1"><X size={12} /> Réinitialiser</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} placeholder="Statut" />
            <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} options={PRIORITY_OPTIONS} placeholder="Priorité" />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <Table columns={columns} data={paginated} emptyText="Aucune suggestion trouvée" />
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} perPage={PER_PAGE} />
          </div>
        )}
      </div>

      {/* Modal visualisation */}
      <Modal open={!!viewSuggestion} onClose={() => setViewSuggestion(null)} title="Détails de la suggestion" size="lg">
        {viewSuggestion && (
          <div className="space-y-4">
            <div><p className="text-xs text-slate-400">Titre</p><p className="font-semibold">{viewSuggestion.title}</p></div>
            <div><p className="text-xs text-slate-400">Description</p><p className="text-sm">{viewSuggestion.description}</p></div>
            <div><p className="text-xs text-slate-400">Raison</p><p className="text-sm">{viewSuggestion.reason}</p></div>
            {viewSuggestion.expectedBenefits && <div><p className="text-xs text-slate-400">Bénéfices attendus</p><p className="text-sm">{viewSuggestion.expectedBenefits}</p></div>}
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400">Catégorie</p><Badge status={viewSuggestion.category} /></div>
              <div><p className="text-xs text-slate-400">Priorité</p>{getPriorityBadge(viewSuggestion.priority)}</div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <button onClick={() => { setStatusModal({ open: true, id: viewSuggestion._id, newStatus: 'approved', comment: '' }); setViewSuggestion(null); }} className="flex-1 btn-success">Approuver</button>
              <button onClick={() => { setStatusModal({ open: true, id: viewSuggestion._id, newStatus: 'rejected', comment: '' }); setViewSuggestion(null); }} className="flex-1 btn-danger">Rejeter</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal changement statut */}
      <Modal open={statusModal.open} onClose={() => setStatusModal({ open: false, id: null, newStatus: '', comment: '' })} title={statusModal.newStatus === 'approved' ? 'Approuver la suggestion' : 'Rejeter la suggestion'} footer={
        <div className="flex justify-end gap-3">
          <button onClick={() => setStatusModal({ open: false, id: null, newStatus: '', comment: '' })} className="btn-secondary">Annuler</button>
          <button onClick={handleUpdateStatus} className={statusModal.newStatus === 'approved' ? 'btn-success' : 'btn-danger'}>Confirmer</button>
        </div>
      }>
        <textarea value={statusModal.comment} onChange={e => setStatusModal({ ...statusModal, comment: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder={statusModal.newStatus === 'approved' ? "Ajouter un commentaire (optionnel)" : "Raison du rejet (optionnel)"} />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmer la suppression" footer={
        <><button onClick={() => setDeleteId(null)} className="btn-secondary">Annuler</button><button onClick={handleDelete} className="btn-danger">Supprimer</button></>
      }>
        <p>Êtes-vous sûr de vouloir supprimer cette suggestion ?</p>
      </Modal>
    </div>
  );
}