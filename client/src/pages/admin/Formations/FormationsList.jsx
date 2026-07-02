// client/src/pages/admin/Formations/FormationsList.jsx
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Download, Pencil, Trash2, Eye, Globe, GlobeLock,
  CheckCircle, XCircle, Upload, Filter, X, SlidersHorizontal,
  DollarSign, FileSpreadsheet, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

import Table               from '../../../components/ui/Table';
import Badge               from '../../../components/ui/Badge';
import SearchBar           from '../../../components/ui/SearchBar';
import Select              from '../../../components/ui/Select';
import Modal               from '../../../components/common/Modal';
import Pagination          from '../../../components/ui/Pagination';
import Loader              from '../../../components/common/Loader';
import { formationsApi }   from '../../../api/formations';
import { formatDate, exportCSV } from '../../../utils/helpers';
import FormationForm        from './FormationForm';
import FormationImportModal from '../../../components/forms/FormationImportModal';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

const STATUS_LABELS = {
  upcoming:  'À venir',
  ongoing:   'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const STATUS_OPTIONS = [
  { value: '',          label: 'Tous les statuts' },
  { value: 'upcoming',  label: 'À venir' },
  { value: 'ongoing',   label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
];

const LEVEL_OPTIONS = [
  { value: '',              label: 'Tous les niveaux' },
  { value: 'Débutant',      label: 'Débutant' },
  { value: 'Intermédiaire', label: 'Intermédiaire' },
  { value: 'Avancé',        label: 'Avancé' },
  { value: 'Expert',        label: 'Expert' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant RowActions — reçoit TOUJOURS les props fraîches
// → élimine toute stale closure sur `row`
// ─────────────────────────────────────────────────────────────────────────────
function RowActions({ row, onEdit, onDeleteRequest, onTogglePublish, onChangeStatus }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">

      {/* Voir */}
      <Link
        to={`/admin/formations/${row._id}`}
        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        title="Voir le détail"
      >
        <Eye size={15} />
      </Link>

      {/* Modifier */}
      <button
        type="button"
        onClick={() => onEdit(row)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        title="Modifier"
      >
        <Pencil size={15} />
      </button>

      {/* Mémoire de dépenses */}
      <Link
        to={`/admin/expense-memo/${row._id}`}
        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        title="Mémoire de dépenses"
      >
        <DollarSign size={15} />
      </Link>

      {/* Rapport */}
      <Link
        to={`/admin/reports/formation/${row._id}`}
        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
        title="Générer le rapport"
      >
        <FileText size={15} />
      </Link>

      {/* Publier / Dépublier — lit row.isPublic frais à chaque render */}
      {row.isPublic ? (
        <button
          type="button"
          onClick={() => onTogglePublish(row)}
          className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          title="Dépublier (retirer de l'accueil)"
        >
          <GlobeLock size={15} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onTogglePublish(row)}
          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          title="Publier sur l'accueil"
        >
          <Globe size={15} />
        </button>
      )}

      {/* Changer le statut — lit row.status frais */}
      <select
        value={row.status}
        onChange={(e) => onChangeStatus(row, e.target.value)}
        className="text-xs border rounded px-2 py-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        <option value="upcoming">À venir</option>
        <option value="ongoing">En cours</option>
        <option value="completed">Terminé</option>
        <option value="cancelled">Annulé</option>
      </select>

      {/* Supprimer */}
      <button
        type="button"
        onClick={() => onDeleteRequest(row._id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Supprimer"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────
export default function FormationsList() {
  // ── Filtres & pagination ────────────────────────────────────────────────────
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [levelFilter,    setLevelFilter]    = useState('');
  const [trainerFilter,  setTrainerFilter]  = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateRange,      setDateRange]      = useState({ start: '', end: '' });
  const [showAdvanced,   setShowAdvanced]   = useState(false);
  const [page,           setPage]           = useState(1);

  // ── Données ─────────────────────────────────────────────────────────────────
  const [formations,     setFormations]     = useState([]);
  const [trainers,       setTrainers]       = useState([]);
  const [locations,      setLocations]      = useState([]);
  const [loading,        setLoading]        = useState(true);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [showForm,        setShowForm]        = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editFormation,   setEditFormation]   = useState(null);
  const [deleteId,        setDeleteId]        = useState(null);

  // Ref pour éviter les appels concurrents à loadFormations
  const loadingRef = useRef(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Chargement des données
  // ─────────────────────────────────────────────────────────────────────────
  const loadFormations = useCallback(async () => {
    // Guard contre les appels concurrents
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      const response = await formationsApi.getAll();

      /**
       * formationsApi.getAll() renvoie la réponse Axios complète.
       * Le serveur répond avec paginatedResponse → { data: [...], total, page, limit }
       * Axios encapsule cela dans response.data
       * Donc :
       *   response.data       → { data: [...], total, page, limit }
       *   response.data.data  → le tableau de formations
       */
      const payload = response?.data;
      const data =
        Array.isArray(payload)       ? payload       :  // réponse brute tableau
        Array.isArray(payload?.data) ? payload.data  :  // format paginé { data: [...] }
        [];

      setFormations(data);
      setTrainers( [...new Set(data.map((f) => f.trainer).filter(Boolean))]);
      setLocations([...new Set(data.map((f) => f.location).filter(Boolean))]);
    } catch (error) {
      console.error('[loadFormations]', error);
      toast.error('Erreur lors du chargement des formations');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => { loadFormations(); }, [loadFormations]);

  // ─────────────────────────────────────────────────────────────────────────
  // Filtrage local (le tri et la pagination serveur ne sont pas utilisés)
  // ─────────────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...formations];
    if (search)          result = result.filter((f) => f.title?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter)    result = result.filter((f) => f.status   === statusFilter);
    if (levelFilter)     result = result.filter((f) => f.level    === levelFilter);
    if (trainerFilter)   result = result.filter((f) => f.trainer  === trainerFilter);
    if (locationFilter)  result = result.filter((f) => f.location === locationFilter);
    if (dateRange.start) result = result.filter((f) => new Date(f.startDate) >= new Date(dateRange.start));
    if (dateRange.end)   result = result.filter((f) => new Date(f.startDate) <= new Date(dateRange.end));
    return result;
  }, [formations, search, statusFilter, levelFilter, trainerFilter, locationFilter, dateRange]);

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const activeFiltersCount = [
    search, statusFilter, levelFilter, trainerFilter, locationFilter,
    dateRange.start, dateRange.end,
  ].filter(Boolean).length;

  const resetFilters = useCallback(() => {
    setSearch(''); setStatusFilter(''); setLevelFilter('');
    setTrainerFilter(''); setLocationFilter('');
    setDateRange({ start: '', end: '' }); setPage(1);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers — tous stables via useCallback
  // ─────────────────────────────────────────────────────────────────────────

  const handleEdit = useCallback((row) => {
    setEditFormation(row);
    setShowForm(true);
  }, []);

  const handleDeleteRequest = useCallback((id) => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = async () => {
    try {
      await formationsApi.delete(deleteId);
      toast.success('Formation supprimée');
      await loadFormations();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editFormation) {
        await formationsApi.update(editFormation._id, data);
        toast.success('Formation mise à jour');
      } else {
        await formationsApi.create(data);
        toast.success('Formation créée');
      }
      await loadFormations();
      setShowForm(false);
      setEditFormation(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleImportFormation = async (formationData) => {
    await formationsApi.create(formationData);
  };

  /**
   * Publier / Dépublier
   *
   * Stratégie : mise à jour optimiste immédiate du state local
   * → l'UI reste réactive sans attendre la réponse serveur.
   * En cas d'erreur API, on effectue un rollback.
   */
  const handleTogglePublish = useCallback(async (formation) => {
    const newValue   = !formation.isPublic;
    const actionText = newValue ? 'publiée' : 'dépubliée';

    // ① Mise à jour optimiste
    setFormations((prev) =>
      prev.map((f) => f._id === formation._id ? { ...f, isPublic: newValue } : f)
    );

    try {
      await formationsApi.togglePublish(formation._id, newValue);
      toast.success(`"${formation.title}" a été ${actionText}`);
      // ② Resync avec le serveur pour garantir la cohérence
      await loadFormations();
    } catch (error) {
      // ③ Rollback en cas d'erreur
      setFormations((prev) =>
        prev.map((f) => f._id === formation._id ? { ...f, isPublic: formation.isPublic } : f)
      );
      toast.error(error.response?.data?.message || `Erreur lors de la ${actionText}`);
    }
  }, [loadFormations]);

  /**
   * Changer le statut
   * Même stratégie optimiste que handleTogglePublish.
   */
  const handleChangeStatus = useCallback(async (formation, newStatus) => {
    // ① Mise à jour optimiste
    setFormations((prev) =>
      prev.map((f) => f._id === formation._id ? { ...f, status: newStatus } : f)
    );

    try {
      await formationsApi.updateStatus(formation._id, newStatus);
      toast.success(`Statut modifié : ${STATUS_LABELS[newStatus]}`);
      // ② Resync
      await loadFormations();
    } catch (error) {
      // ③ Rollback
      setFormations((prev) =>
        prev.map((f) => f._id === formation._id ? { ...f, status: formation.status } : f)
      );
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  }, [loadFormations]);

  // ─────────────────────────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────────────────────────

  const handleExportExcel = () => {
    const rows = filtered.map((f, i) => ({
      'N°':                    i + 1,
      'Titre':                 f.title       || '',
      'Description':           f.description || '',
      'Formateur':             f.trainer     || '',
      'Niveau':                f.level       || '',
      'Date de début':         formatDate(f.startDate),
      'Date de fin':           formatDate(f.endDate),
      'Lieu':                  f.location    || '',
      'Statut':                STATUS_LABELS[f.status] || f.status,
      'Publiée':               f.isPublic ? 'Oui' : 'Non',
      'Capacité max':          f.maxCapacity    || 'Illimitée',
      'Inscrits actuels':      f.currentEnrolled || 0,
      'Coût prévisionnel':     f.cost ? `${f.cost.toLocaleString()} FCFA` : '0 FCFA',
      'Créé le':               formatDate(f.createdAt),
      'Dernière modification': formatDate(f.updatedAt),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 },{ wch: 40 },{ wch: 50 },{ wch: 25 },{ wch: 15 },
      { wch: 15 },{ wch: 15 },{ wch: 20 },{ wch: 12 },{ wch: 10 },
      { wch: 15 },{ wch: 15 },{ wch: 20 },{ wch: 15 },{ wch: 15 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Formations CENADI');
    XLSX.writeFile(wb, `formations_cenadi_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export Excel réussi');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Colonnes du tableau
  // Les handlers sont stables (useCallback) → useMemo est fiable
  // ─────────────────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      key: 'title',
      label: 'Formation',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-white text-sm">{val}</p>
          <p className="text-xs text-slate-400">{row.location || 'Lieu non défini'}</p>
          {row.trainer && <p className="text-xs text-slate-400 mt-0.5">{row.trainer}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'startDate',
      label: 'Début',
      render: (val) => formatDate(val),
    },
    {
      key: 'isPublic',
      label: 'Publiée',
      render: (val) => (
        <div className="flex items-center gap-1">
          {val
            ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={13} /> Oui</span>
            : <span className="flex items-center gap-1 text-red-500  text-xs font-medium"><XCircle     size={13} /> Non</span>}
        </div>
      ),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => (
        <RowActions
          row={row}
          onEdit={handleEdit}
          onDeleteRequest={handleDeleteRequest}
          onTogglePublish={handleTogglePublish}
          onChangeStatus={handleChangeStatus}
        />
      ),
    },
  ], [handleEdit, handleDeleteRequest, handleTogglePublish, handleChangeStatus]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return <Loader />;

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Formations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez les formations CENADI
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => setShowImportModal(true)} className="btn-secondary">
            <Upload size={15} /> Importer Excel
          </button>
          <button type="button" onClick={handleExportExcel} className="btn-secondary">
            <FileSpreadsheet size={15} /> Export Excel
          </button>
          <button
            type="button"
            onClick={() => { setEditFormation(null); setShowForm(true); }}
            className="btn-primary"
          >
            <Plus size={15} /> Nouvelle formation
          </button>
        </div>
      </div>

      {/* ── Barre de recherche ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search} onChange={setSearch} onClear={() => setSearch('')}
            placeholder="Rechercher par titre…" className="flex-1"
          />
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              showAdvanced || activeFiltersCount > 0
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-white text-primary-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Filtres avancés ──────────────────────────────────────────────── */}
      {showAdvanced && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Filter size={16} className="text-primary-500" /> Filtres avancés
            </h3>
            <button
              type="button" onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-1"
            >
              <X size={12} /> Réinitialiser tous
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={statusFilter}   onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_OPTIONS} placeholder="Statut" className="w-full" />
            <Select value={levelFilter}    onChange={(e) => setLevelFilter(e.target.value)}
              options={LEVEL_OPTIONS}  placeholder="Niveau" className="w-full" />
            <Select value={trainerFilter}  onChange={(e) => setTrainerFilter(e.target.value)}
              options={[{ value: '', label: 'Tous les formateurs' }, ...trainers.map((t) => ({ value: t, label: t }))]}
              placeholder="Formateur" className="w-full" />
            <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
              options={[{ value: '', label: 'Tous les lieux' }, ...locations.map((l) => ({ value: l, label: l }))]}
              placeholder="Lieu" className="w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date de début (après)</label>
              <input type="date" value={dateRange.start}
                onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date de début (avant)</label>
              <input type="date" value={dateRange.end}
                onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
            </div>
          </div>
        </div>
      )}

      {/* ── Compteur ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-white">{filtered.length}</span>
          {' '}formation{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
          {activeFiltersCount > 0 && (
            <button type="button" onClick={resetFilters} className="ml-3 text-xs text-primary-500 underline hover:no-underline">
              Effacer tous les filtres
            </button>
          )}
        </p>
      </div>

      {/* ── Tableau ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <Table columns={columns} data={paginated} emptyText="Aucune formation trouvée" />
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <Pagination
              page={page} totalPages={totalPages} onPage={setPage}
              total={filtered.length} perPage={PER_PAGE}
            />
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <FormationForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditFormation(null); }}
        onSave={handleSave}
        initial={editFormation}
      />
      <FormationImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportFormation}
        formations={formations}
      />
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirmer la suppression"
        size="md"
        footer={
          <>
            <button type="button" onClick={() => setDeleteId(null)} className="btn-secondary">
              Annuler
            </button>
            <button type="button" onClick={handleDeleteConfirm} className="btn-danger">
              Supprimer
            </button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}