import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Eye, Search, Filter, X, SlidersHorizontal, 
  Globe, GlobeLock, RefreshCw, TrendingUp, Calendar, 
  Building2, Lightbulb, MessageCircle, Newspaper, Sparkles,
  BarChart3, Rocket, Zap, Brain, Crown, Target, Users,
  Clock, EyeOff, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blogApi } from '../../../api/blog';
import AIGeneratorPanel from '../../../components/blog/AIGeneratorPanel';
import Table from '../../../components/ui/Table';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/ui/Pagination';
import Loader from '../../../components/common/Loader';
import { formatDate } from '../../../utils/helpers';

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'published', label: 'Publié' },
  { value: 'draft', label: 'Brouillon' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'trending', label: 'Tendances' },
  { value: 'upcoming', label: 'À venir' },
  { value: 'external', label: 'Externe' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'feedback', label: 'Retours' },
  { value: 'news', label: 'Actualités' },
];

const CATEGORY_CONFIG = {
  trending: { icon: TrendingUp, label: 'Tendances', gradient: 'from-orange-500 to-red-500', bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30', text: 'text-orange-600', border: 'border-orange-200 dark:border-orange-800' },
  upcoming: { icon: Calendar, label: 'À venir', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30', text: 'text-blue-600', border: 'border-blue-200 dark:border-blue-800' },
  external: { icon: Building2, label: 'Externe', gradient: 'from-purple-500 to-pink-500', bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30', text: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800' },
  suggestion: { icon: Lightbulb, label: 'Suggestion', gradient: 'from-amber-500 to-yellow-500', bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30', text: 'text-amber-600', border: 'border-amber-200 dark:border-amber-800' },
  feedback: { icon: MessageCircle, label: 'Retour', gradient: 'from-green-500 to-emerald-500', bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', text: 'text-green-600', border: 'border-green-200 dark:border-green-800' },
  news: { icon: Newspaper, label: 'Actualité', gradient: 'from-cyan-500 to-teal-500', bg: 'bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30', text: 'text-cyan-600', border: 'border-cyan-200 dark:border-cyan-800' },
};

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { loadPosts(); }, [statusFilter, categoryFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const response = await blogApi.getAllAdmin(params);
      setPosts(response?.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!search) return posts;
    const searchLower = search.toLowerCase();
    return posts.filter(p => p.title?.toLowerCase().includes(searchLower) || p.slug?.toLowerCase().includes(searchLower));
  }, [posts, search]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const activeFiltersCount = [search, statusFilter, categoryFilter].filter(Boolean).length;

  const resetFilters = () => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); setPage(1); };

  const handleDelete = async () => {
    try {
      await blogApi.delete(deleteId);
      toast.success('Article supprimé');
      loadPosts();
    } catch (error) { toast.error('Erreur lors de la suppression'); }
    finally { setDeleteId(null); }
  };

  const handlePublish = async (post) => {
    try {
      await blogApi.update(post._id, { status: 'published', publishedAt: new Date() });
      toast.success('Article publié');
      loadPosts();
    } catch (error) { toast.error('Erreur lors de la publication'); }
  };

  const handleUnpublish = async (post) => {
    try {
      await blogApi.update(post._id, { status: 'draft' });
      toast.success('Article dépublié');
      loadPosts();
    } catch (error) { toast.error('Erreur lors de la dépublication'); }
  };

  const getCategoryBadge = (category) => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.news;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles size={24} className="text-primary-500" />
            Blog - Articles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gérez les articles du blog formations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadPosts} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={15} /> Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-slate-500">Total articles</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-3 border border-green-100 dark:border-green-800">
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          <p className="text-xs text-slate-500">Publiés</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
          <p className="text-2xl font-bold text-amber-600">{stats.draft}</p>
          <p className="text-xs text-slate-500">Brouillons</p>
        </div>
      </div>

      <AIGeneratorPanel onSuccess={loadPosts} />

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Rechercher par titre ou slug..." className="flex-1" />
          <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${showAdvancedFilters || activeFiltersCount > 0 ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
            <SlidersHorizontal size={14} /> Filtres
            {activeFiltersCount > 0 && <span className="bg-white text-primary-600 rounded-full w-5 h-5 text-xs">{activeFiltersCount}</span>}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Filter size={16} className="text-primary-500" /> Filtres avancés</h3>
            <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-primary-500">Réinitialiser</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} placeholder="Statut" className="w-full" />
            <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} options={CATEGORY_OPTIONS} placeholder="Catégorie" className="w-full" />
          </div>
        </div>
      )}

      {/* Results Counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-white">{filtered.length}</span> article{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Titre / Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Vues</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Créé le</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">Aucun article trouvé</td></tr>
              ) : (
                paginated.map((row) => {
                  const config = CATEGORY_CONFIG[row.category] || CATEGORY_CONFIG.news;
                  const Icon = config.icon;
                  return (
                    <tr key={row._id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                          <Icon size={14} className={config.text} />
                          {row.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">/{row.slug}</p>
                      </td>
                      <td className="px-4 py-3">{getCategoryBadge(row.category)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`} />
                          {row.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Eye size={12} /> {row.views || 0}
                        </span>
                       </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => window.open(`/blog/${row.slug}`, '_blank')} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all" title="Voir"><Eye size={15} /></button>
                          {row.status === 'published' ? (
                            <button onClick={() => handleUnpublish(row)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-all" title="Dépublier"><GlobeLock size={15} /></button>
                          ) : (
                            <button onClick={() => handlePublish(row)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-all" title="Publier"><Globe size={15} /></button>
                          )}
                          <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Supprimer"><Trash2 size={15} /></button>
                        </div>
                       </td>
                     </tr>
                  );
                })
              )}
            </tbody>
           </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} perPage={PER_PAGE} />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmer la suppression" size="md" footer={<><button onClick={() => setDeleteId(null)} className="btn-secondary">Annuler</button><button onClick={handleDelete} className="btn-danger">Supprimer</button></>}>
        <p className="text-slate-600 dark:text-slate-400">Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.</p>
      </Modal>
    </div>
  );
}