// client/src/pages/admin/Reports/FormationReport.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, Printer, Download,
  Loader as LoaderIcon, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reportsApi }    from '../../../api/reports';
import { formationsApi } from '../../../api/formations';
import Loader            from '../../../components/common/Loader';

const STATUS_COLORS = {
  upcoming:  'bg-blue-100  text-blue-700',
  ongoing:   'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100   text-red-700',
};
const STATUS_LABELS = {
  upcoming:  'À venir',
  ongoing:   'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export default function FormationReport() {
  const { id } = useParams();

  const [formation,  setFormation]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState(null);

  // ── Chargement ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        /**
         * ✅ FIX : on utilise getByIdAdmin au lieu de getById.
         *
         * getById → route publique GET /:id → retourne 404 si isPublic=false
         * getByIdAdmin → route admin  GET /:id/admin → retourne toujours la formation
         */
        const res = await formationsApi.getByIdAdmin(id);

        // La réponse Axios encapsule dans res.data
        // Le serveur répond { status, data: formation }
        const formation = res?.data?.data ?? res?.data ?? res;

        if (!formation?._id) throw new Error('Formation introuvable');

        setFormation(formation);
      } catch (err) {
        console.error('[FormationReport] load error:', err);
        setError('Impossible de charger la formation.');
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  // ── Helpers export ─────────────────────────────────────────────────────────
  const triggerDownload = (blob) => {
    const safeName = (formation?.title || 'formation')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .substring(0, 60);
    const filename = `rapport_${safeName}_${new Date().toISOString().split('T')[0]}.html`;
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Ouvrir + imprimer ──────────────────────────────────────────────────────
  const handleOpenAndPrint = async () => {
    setGenerating(true);
    const toastId = 'open-report';
    toast.loading('Génération du rapport…', { id: toastId });
    try {
      const response = await reportsApi.getFormationReport(id);
      const blob = new Blob([response.data], { type: 'text/html; charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const win  = window.open(url, '_blank');
      if (win) {
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        toast.success(
          'Rapport ouvert — utilisez Ctrl+P pour imprimer ou sauvegarder en PDF',
          { id: toastId, duration: 6000 }
        );
      } else {
        triggerDownload(blob);
        toast.success('Rapport téléchargé (popup bloqué par le navigateur)', { id: toastId });
      }
    } catch (err) {
      console.error('[FormationReport] open error:', err);
      toast.error('Erreur lors de la génération du rapport', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  // ── Télécharger ────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    setGenerating(true);
    const toastId = 'dl-report';
    toast.loading('Téléchargement en cours…', { id: toastId });
    try {
      const response = await reportsApi.getFormationReport(id);
      const blob = new Blob([response.data], { type: 'text/html; charset=utf-8' });
      triggerDownload(blob);
      toast.success('Rapport téléchargé avec succès', { id: toastId });
    } catch (err) {
      console.error('[FormationReport] download error:', err);
      toast.error('Erreur lors du téléchargement', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  // ── États de chargement / erreur ───────────────────────────────────────────
  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <AlertCircle className="text-red-500" size={40} />
        <p className="text-red-600 font-medium">{error}</p>
        <Link to="/admin/formations" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={14} /> Retour aux formations
        </Link>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Navigation */}
        <Link
          to="/admin/formations"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Retour
        </Link>

        {/* Conteneur principal */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg overflow-hidden">

          {/* ── Bandeau header ── */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600" />
            <div className="relative px-8 sm:px-10 py-10 sm:py-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-md">
                  <FileText size={28} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-emerald-100 uppercase tracking-widest mb-1">
                    Rapport de Formation
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {formation?.title}
                  </h1>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                {formation?.status && (
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold w-fit ${STATUS_COLORS[formation.status]}`}>
                    {STATUS_LABELS[formation.status]}
                  </span>
                )}
                <p className="text-sm text-emerald-50">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* ── Corps ── */}
          <div className="px-8 sm:px-10 py-10 sm:py-12 space-y-12">

            {/* Section helper */}
            {[
              {
                title: 'Informations générales',
                content: (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                      { label: 'Formateur', value: formation?.trainer   || '—' },
                      { label: 'Lieu',      value: formation?.location  || '—' },
                      {
                        label: 'Début',
                        value: formation?.startDate
                          ? new Date(formation.startDate).toLocaleDateString('fr-FR')
                          : '—',
                      },
                      {
                        label: 'Fin',
                        value: formation?.endDate
                          ? new Date(formation.endDate).toLocaleDateString('fr-FR')
                          : '—',
                      },
                      { label: 'Durée',    value: formation?.duration ? `${formation.duration}h` : '—' },
                      { label: 'Capacité', value: formation?.maxCapacity || '—' },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-5 border border-emerald-100 dark:border-slate-600 hover:shadow-md transition-shadow"
                      >
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                          {label}
                        </p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: 'Objectifs pédagogiques',
                content: (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-7 border border-emerald-100 dark:border-slate-600">
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      {formation?.objectives || 'Aucun objectif défini.'}
                    </p>
                  </div>
                ),
              },
              {
                title: 'Programme de la formation',
                content: (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-7 border border-emerald-100 dark:border-slate-600">
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {formation?.program || 'Aucun programme détaillé.'}
                    </p>
                  </div>
                ),
              },
              {
                title: 'Prérequis',
                content: (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-7 border border-emerald-100 dark:border-slate-600">
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      {Array.isArray(formation?.prerequisites)
                        ? formation.prerequisites.join(', ') || 'Aucun prérequis.'
                        : formation?.prerequisites || 'Aucun prérequis spécifique.'}
                    </p>
                  </div>
                ),
              },
              {
                title: 'Méthodes pédagogiques',
                content: (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-7 border border-emerald-100 dark:border-slate-600">
                    <ul className="space-y-3">
                      {[
                        'Cours théoriques en présentiel ou à distance',
                        'Ateliers pratiques et études de cas',
                        'Évaluations continues et finales',
                        'Support de cours et ressources numériques',
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-600 mt-2" />
                          <span className="text-slate-700 dark:text-slate-200">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
            ].map(({ title, content }) => (
              <div key={title}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-8 bg-emerald-600 rounded-full" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
                </div>
                {content}
              </div>
            ))}

            {/* Boutons d'action */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleOpenAndPrint}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {generating
                    ? <LoaderIcon size={18} className="animate-spin" />
                    : <Printer size={18} />}
                  Afficher et imprimer
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-3 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating
                    ? <LoaderIcon size={18} className="animate-spin" />
                    : <Download size={18} />}
                  Télécharger
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                Utilisez{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[11px] font-mono border border-slate-200 dark:border-slate-600">
                  Ctrl+P
                </kbd>{' '}
                pour imprimer ou sauvegarder en PDF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}