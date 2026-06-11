// client/src/pages/admin/ExpenseMemo/ExpenseMemoPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle,
  FileSpreadsheet, RefreshCw, Upload,
  DollarSign, Users, Package, Truck, GraduationCap,
  Loader as LoaderIcon, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseMemoApi } from '../../../api/expenseMemo';
import { formationsApi } from '../../../api/formations';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';

// ─── Configuration des sections ──────────────────────────────────────────────
const SECTION_CONFIG = {
  A: { label: 'A - SUPERVISION',              tauxParDefaut: 11,    icon: Users       },
  B: { label: 'B - COORDINATION',             tauxParDefaut: 11,    icon: Users       },
  C: { label: 'C - SECRÉTARIAT',              tauxParDefaut: 11,    icon: Package     },
  D: { label: 'D - DRH',                      tauxParDefaut: 11,    icon: Users       },
  E: { label: 'E - TRANSPORT',                tauxParDefaut: 11,    icon: Truck       },
  F: { label: 'F - FORMATEURS & PRESTATIONS', tauxParDefaut: 24.75, icon: GraduationCap },
};

const SECTION_COLORS = {
  A: 'bg-blue-50   border-blue-200   dark:bg-blue-900/20   dark:border-blue-800',
  B: 'bg-green-50  border-green-200  dark:bg-green-900/20  dark:border-green-800',
  C: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
  D: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  E: 'bg-cyan-50   border-cyan-200   dark:bg-cyan-900/20   dark:border-cyan-800',
  F: 'bg-red-50    border-red-200    dark:bg-red-900/20    dark:border-red-800',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Déclenche le téléchargement d'un Blob dans le navigateur. */
const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ─── Composant ───────────────────────────────────────────────────────────────
export default function ExpenseMemoPage() {
  const { id } = useParams();
  const [memo,       setMemo]       = useState(null);
  const [formation,  setFormation]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [importing,  setImporting]  = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationComment,   setValidationComment]   = useState('');
  const [validationAction,    setValidationAction]    = useState('');
  const [localLines, setLocalLines] = useState([]);
  const [error,      setError]      = useState(null);
  const [totals,     setTotals]     = useState({
    montantTotalTTC: 0, montantTotalIRNC: 0, montantTotalNet: 0,
  });

  useEffect(() => { loadData(); }, [id]);

  // ── Calculs côté client ──────────────────────────────────────────────────
  const calculateTotals = (lines) => {
    let totalTTC = 0, totalIRNC = 0, totalNet = 0;
    const updatedLines = lines.map((line) => {
      const montantTTC = line.isFixedAmount
        ? (line.fixedAmount || 0)
        : (line.nombre || 0) * (line.prixUnitaire || 0);
      const taux      = line.tauxIRNC ?? SECTION_CONFIG[line.code]?.tauxParDefaut ?? 11;
      const irnc      = montantTTC * (taux / 100);
      const montantNet = montantTTC - irnc;
      totalTTC  += montantTTC;
      totalIRNC += irnc;
      totalNet  += montantNet;
      return { ...line, montantTTC, irnc, montantNet };
    });
    return {
      updatedLines,
      totals: { montantTotalTTC: totalTTC, montantTotalIRNC: totalIRNC, montantTotalNet: totalNet },
    };
  };

  // ── Chargement ───────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ FIX: Utilisation de getByIdAdmin au lieu de getById
      // getById → route publique → retourne 404 si isPublic=false
      // getByIdAdmin → route admin → retourne toujours la formation
      const [memoRes, formationRes] = await Promise.all([
        expenseMemoApi.getByFormation(id),
        formationsApi.getByIdAdmin(id),
      ]);
      
      const formationData = formationRes?.data?.data ?? formationRes?.data ?? formationRes;
      if (!formationData?._id) {
        throw new Error('Formation non trouvée');
      }
      
      setFormation(formationData);
      
      const lines = memoRes?.data?.lines || [];
      const { updatedLines, totals: newTotals } = calculateTotals(lines);
      setLocalLines(updatedLines);
      setTotals(newTotals);
      setMemo(memoRes?.data || { status: 'draft' });
    } catch (error) {
      console.error('Erreur chargement:', error);
      setError(error?.response?.data?.message || error?.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // ── Mise à jour d'une ligne ───────────────────────────────────────────────
  const updateLine = async (lineId, field, value) => {
    const updatedList = localLines.map((line) =>
      line._id === lineId ? { ...line, [field]: value } : line
    );
    const { updatedLines, totals: newTotals } = calculateTotals(updatedList);
    setLocalLines(updatedLines);
    setTotals(newTotals);
    try {
      await expenseMemoApi.updateLine(id, lineId, { [field]: value });
    } catch (error) {
      console.error('Erreur mise à jour ligne:', error);
      loadData();
    }
  };

  // ── Import Excel ─────────────────────────────────────────────────────────
  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const response = await expenseMemoApi.importExcel(id, file);
      if (response?.status === 'success' && response?.data?.lines) {
        const { updatedLines, totals: newTotals } = calculateTotals(response.data.lines);
        setLocalLines(updatedLines);
        setTotals(newTotals);
        setMemo(response.data);
        toast.success(`Import réussi : ${updatedLines.length} lignes chargées`);
      } else {
        toast.error("Erreur lors de l'import");
      }
    } catch (error) {
      toast.error(error?.message || "Erreur lors de l'import");
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  // ── Réinitialisation ─────────────────────────────────────────────────────
  const resetToDefault = async () => {
    if (!window.confirm('Réinitialiser toutes les valeurs par défaut ?')) return;
    try {
      const response = await expenseMemoApi.resetToDefault(id);
      if (response?.data?.lines) {
        const { updatedLines, totals: newTotals } = calculateTotals(response.data.lines);
        setLocalLines(updatedLines);
        setTotals(newTotals);
        toast.success('Mémoire réinitialisée');
      }
    } catch {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  // ── Soumission ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      await expenseMemoApi.submit(id);
      setMemo((prev) => ({ ...prev, status: 'submitted' }));
      toast.success('Mémoire soumise pour validation');
    } catch {
      toast.error('Erreur lors de la soumission');
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const handleValidate = (status) => {
    setValidationAction(status);
    setShowValidationModal(true);
  };

  const confirmValidation = async () => {
    try {
      await expenseMemoApi.validate(id, validationAction, validationComment);
      setMemo((prev) => ({ ...prev, status: validationAction }));
      toast.success(`Mémoire ${validationAction === 'approved' ? 'approuvée' : 'rejetée'}`);
      setShowValidationModal(false);
      setValidationComment('');
    } catch {
      toast.error('Erreur lors de la validation');
    }
  };

  // ── Export Excel ─────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    const toastId = 'export-excel';
    toast.loading('Génération du fichier Excel…', { id: toastId });
    try {
      const response = await expenseMemoApi.exportExcel(id);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const filename = `memoire_depenses_${formation?.title || 'formation'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      triggerBlobDownload(blob, filename);
      toast.success('Export Excel réussi', { id: toastId });
    } catch (error) {
      console.error('Export Excel:', error);
      toast.error("Erreur lors de l'export Excel", { id: toastId });
    }
  };

  // ── Export PDF (HTML imprimable) ─────────────────────────────────────────
  const handleExportPDF = async () => {
    const toastId = 'export-pdf';
    toast.loading('Génération du document PDF…', { id: toastId });
    try {
      const response = await expenseMemoApi.exportPDF(id);
      const blob = new Blob([response.data], { type: 'text/html; charset=utf-8' });

      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.focus();
          setTimeout(() => printWindow.print(), 500);
        });
      } else {
        const filename = `memoire_depenses_${formation?.title || 'formation'}_${new Date().toISOString().split('T')[0]}.html`;
        triggerBlobDownload(blob, filename);
      }
      toast.success('Document PDF ouvert – utilisez Ctrl+P pour imprimer/sauvegarder en PDF', { id: toastId, duration: 5000 });
    } catch (error) {
      console.error('Export PDF:', error);
      toast.error("Erreur lors de l'export PDF", { id: toastId });
    }
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────
  const isEditable = memo?.status === 'draft';
  const isAdmin    = true;

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link
            to="/admin/formations"
            className="text-sm text-slate-500 hover:text-primary-600 flex items-center gap-1 mb-6"
          >
            <ArrowLeft size={14} /> Retour aux formations
          </Link>
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <AlertCircle className="text-red-500" size={48} />
            <p className="text-red-600 font-medium text-lg">{error}</p>
            <button onClick={loadData} className="btn-primary">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  // Grouper les lignes par section
  const linesBySection = {};
  localLines.forEach((line) => {
    if (!linesBySection[line.code]) linesBySection[line.code] = [];
    linesBySection[line.code].push(line);
  });

  const statusLabel = {
    draft:     'Brouillon',
    submitted: 'Soumis',
    approved:  'Approuvé',
    rejected:  'Rejeté',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── En-tête ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <Link
              to="/admin/formations"
              className="text-sm text-slate-500 hover:text-primary-600 flex items-center gap-1 mb-2"
            >
              <ArrowLeft size={14} /> Retour aux formations
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Mémoire de dépenses</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{formation?.title}</p>
            {/* Indicateur si la formation n'est pas publiée */}
            {formation && !formation.isPublic && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                <AlertCircle size={12} /> Formation non publiée (visible uniquement par les admins)
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {isEditable && (
              <>
                <label className="btn-secondary cursor-pointer flex items-center gap-2">
                  {importing
                    ? <LoaderIcon size={15} className="animate-spin" />
                    : <Upload size={15} />}
                  Importer Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportExcel}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
                <button onClick={resetToDefault} className="btn-secondary flex items-center gap-2">
                  <RefreshCw size={15} /> Réinitialiser
                </button>
              </>
            )}
            <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
              <FileSpreadsheet size={15} /> Exporter Excel
            </button>
            <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2">
              <FileSpreadsheet size={15} /> Exporter PDF
            </button>
            {isEditable && (
              <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                <CheckCircle size={15} /> Soumettre
              </button>
            )}
            {isAdmin && memo?.status === 'submitted' && (
              <>
                <button onClick={() => handleValidate('approved')} className="btn-success flex items-center gap-2">
                  <CheckCircle size={15} /> Approuver
                </button>
                <button onClick={() => handleValidate('rejected')} className="btn-danger flex items-center gap-2">
                  <XCircle size={15} /> Rejeter
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Badge statut ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            memo?.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            memo?.status === 'submitted' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            memo?.status === 'rejected'  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
          }`}>
            {memo?.status === 'approved'  && <CheckCircle size={14} />}
            {memo?.status === 'submitted' && <LoaderIcon  size={14} className="animate-spin" />}
            {memo?.status === 'rejected'  && <XCircle    size={14} />}
            Statut : {statusLabel[memo?.status] || memo?.status}
          </span>
          {memo?.validationComment && (
            <span className="text-sm text-slate-500 italic">
              « {memo.validationComment} »
            </span>
          )}
        </div>

        {/* ── Cartes récapitulatives ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'TOTAL TTC',    value: totals.montantTotalTTC,   color: 'text-primary-600' },
            { label: 'TOTAL IRNC',   value: totals.montantTotalIRNC,  color: 'text-orange-600'  },
            { label: 'NET À PAYER',  value: totals.montantTotalNet,   color: 'text-green-600'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <DollarSign size={18} />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>
                {value.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          ))}
        </div>

        {/* ── Tableau principal ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700 border-b">
                  <th className="px-4 py-3 text-center w-16   text-sm font-bold">N°</th>
                  <th className="px-4 py-3 text-left          text-sm font-bold">DÉSIGNATIONS</th>
                  <th className="px-4 py-3 text-center w-36   text-sm font-bold">NOMBRES</th>
                  <th className="px-4 py-3 text-right  w-40   text-sm font-bold">PRIX UNITAIRE (FCFA)</th>
                  <th className="px-4 py-3 text-right  w-44   text-sm font-bold">MONTANT TTC (FCFA)</th>
                  <th className="px-4 py-3 text-right  w-24   text-sm font-bold">TAUX IRNC (%)</th>
                  <th className="px-4 py-3 text-right  w-44   text-sm font-bold">IRNC (FCFA)</th>
                  <th className="px-4 py-3 text-right  w-48   text-sm font-bold">NET À PAYER (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(SECTION_CONFIG).map(([code, config]) => {
                  const lines = linesBySection[code] || [];
                  const Icon  = config.icon;
                  if (lines.length === 0) return null;
                  
                  const isSectionFEditable = (code === 'F') ? true : isEditable;
                  
                  return (
                    <React.Fragment key={code}>
                      <tr className={`${SECTION_COLORS[code]} border-t-2`}>
                        <td colSpan="8" className="px-4 py-3 font-bold">
                          <div className="flex items-center gap-2">
                            <Icon size={18} />
                            {config.label}
                            <span className="text-xs font-normal ml-2">
                              (IRNC {config.tauxParDefaut} %)
                            </span>
                          </div>
                        </td>
                       </tr>
                      {lines.map((line, idx) => (
                        <tr key={line._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-3 text-center text-sm">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{line.designation}</td>
                          <td className="px-4 py-3 text-center">
                            {isSectionFEditable ? (
                              <input
                                type="number"
                                value={line.nombre ?? 0}
                                onChange={(e) => updateLine(line._id, 'nombre', parseInt(e.target.value, 10) || 0)}
                                className="w-20 px-2 py-1 text-center border rounded-lg dark:bg-slate-700"
                                min="0"
                              />
                            ) : (
                              <span>{line.nombre ?? '-'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isSectionFEditable ? (
                              <input
                                type="number"
                                value={line.prixUnitaire ?? 0}
                                onChange={(e) => updateLine(line._id, 'prixUnitaire', parseInt(e.target.value, 10) || 0)}
                                className="w-32 px-2 py-1 text-right border rounded-lg dark:bg-slate-700"
                                min="0"
                              />
                            ) : line.isFixedAmount ? (
                              <span className="text-slate-400">/</span>
                            ) : (
                              <span>{line.prixUnitaire ? line.prixUnitaire.toLocaleString('fr-FR') : '-'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-primary-600">
                            {(line.montantTTC ?? 0).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isSectionFEditable ? (
                              <input
                                type="number"
                                value={line.tauxIRNC ?? config.tauxParDefaut}
                                onChange={(e) => updateLine(line._id, 'tauxIRNC', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-right border rounded-lg dark:bg-slate-700"
                                step="0.01"
                              />
                            ) : (
                              <span>{line.tauxIRNC ?? config.tauxParDefaut} %</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-orange-600">
                            {(line.irnc ?? 0).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-green-600">
                            {(line.montantNet ?? 0).toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}

                <tr className="bg-primary-50 dark:bg-primary-900/30 font-bold border-t-2">
                  <td colSpan="4" className="px-4 py-4 text-right">MONTANT TOTAL</td>
                  <td className="px-4 py-4 text-right text-primary-700">
                    {totals.montantTotalTTC.toLocaleString('fr-FR')} FCFA
                   </td>
                  <td className="px-4 py-4 text-right"></td>
                  <td className="px-4 py-4 text-right text-orange-700">
                    {totals.montantTotalIRNC.toLocaleString('fr-FR')} FCFA
                   </td>
                  <td className="px-4 py-4 text-right text-green-700">
                    {totals.montantTotalNet.toLocaleString('fr-FR')} FCFA
                   </td>
                 </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pied de page informatif ──────────────────────────────────── */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
          <p className="text-sm">
            💡 Les montants sont calculés automatiquement. Modifiez les nombres, prix unitaires
            ou taux d'IRNC pour recalculer.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            📊 Importez un fichier Excel pour charger automatiquement les données. |
            📄 L'export PDF ouvre une page imprimable – utilisez Ctrl+P pour sauvegarder en PDF.
          </p>
        </div>

        {/* ── Modal de validation ──────────────────────────────────────── */}
        <Modal
          open={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title={validationAction === 'approved' ? 'Approuver la mémoire' : 'Rejeter la mémoire'}
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowValidationModal(false)} className="btn-secondary">
                Annuler
              </button>
              <button onClick={confirmValidation} className={validationAction === 'approved' ? 'btn-success' : 'btn-danger'}>
                Confirmer
              </button>
            </div>
          }
        >
          <textarea
            value={validationComment}
            onChange={(e) => setValidationComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700"
            placeholder="Commentaire (optionnel)"
          />
        </Modal>
      </div>
    </div>
  );
}