import { useState } from 'react';
import { FileSpreadsheet, X, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

export default function FormationImportModal({ open, onClose, onImport, formations = [] }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState([]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('📊 Données brutes:', jsonData);

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
          title: getValue(['Titre', 'titre', 'Title', 'title']),
          description: getValue(['Description', 'description']),
          status: normalizeStatus(getValue(['Statut', 'status', 'Status'])),
          isPublic: normalizeBoolean(getValue(['Publiée', 'publiee', 'isPublic', 'public'])),
          startDate: parseDateValue(getValue(['Date début', 'date_debut', 'startDate'])),
          endDate: parseDateValue(getValue(['Date fin', 'date_fin', 'endDate'])),
          time: getValue(['Horaire', 'horaire', 'time']) || '09:00',
          location: getValue(['Lieu', 'lieu', 'location']),
          maxCapacity: parseInt(getValue(['Capacité', 'capacite', 'maxCapacity']) || 20),
          trainer: getValue(['Formateur', 'formateur', 'trainer']),
          trainerBio: getValue(['Bio formateur', 'bio_formateur', 'trainerBio']),
          cost: parseInt(getValue(['Coût de la formation', 'cout_formation', 'cost', 'budget']) || 0),
          level: normalizeLevel(getValue(['Niveau', 'niveau', 'level'])),
          objectives: (getValue(['Objectifs', 'objectifs']) || '').split(';').filter(o => o.trim()),
          program: (getValue(['Programme', 'programme']) || '').split(';').filter(p => p.trim()),
          skillsToAcquire: (getValue(['Compétences à acquérir', 'competences_a_acquérir', 'skillsToAcquire']) || '').split(';').filter(s => s.trim()),
          prerequisites: (getValue(['Prérequis', 'prerequis']) || '').split(';').filter(p => p.trim()),
          targetDivisions: (getValue(['Divisions ciblées', 'divisions_ciblees']) || '').split(';').filter(d => d.trim()),
        };
      }).filter(row => row.title);

      setPreviewData(normalizedData);
      toast.success(`${normalizedData.length} formation(s) trouvée(s) dans le fichier`);
    } catch (error) {
      console.error('Erreur lecture fichier:', error);
      toast.error('Erreur lors de la lecture du fichier');
      setPreviewData([]);
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return 'upcoming';
    const s = String(status).toLowerCase().trim();
    if (s === 'à venir' || s === 'a venir' || s === 'upcoming') return 'upcoming';
    if (s === 'en cours' || s === 'ongoing') return 'ongoing';
    if (s === 'terminé' || s === 'termine' || s === 'completed') return 'completed';
    if (s === 'annulé' || s === 'annule' || s === 'cancelled') return 'cancelled';
    return 'upcoming';
  };

  const normalizeLevel = (level) => {
    if (!level) return 'Débutant';
    const l = String(level).toLowerCase().trim();
    if (l === 'débutant' || l === 'debutant') return 'Débutant';
    if (l === 'intermédiaire' || l === 'intermediaire') return 'Intermédiaire';
    if (l === 'avancé' || l === 'avance') return 'Avancé';
    if (l === 'expert') return 'Expert';
    return 'Débutant';
  };

  const normalizeBoolean = (value) => {
    if (!value) return false;
    const v = String(value).toLowerCase().trim();
    return v === 'oui' || v === 'yes' || v === 'true' || v === '1' || v === 'publiée' || v === 'publiee';
  };

  const parseDateValue = (dateValue) => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'number') {
      const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
      return excelDate;
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

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error('Aucune donnée à importer');
      return;
    }

    setImporting(true);
    let successCount = 0;
    let errorCount = 0;
    const importErrors = [];

    for (let i = 0; i < previewData.length; i++) {
      setProgress({ current: i + 1, total: previewData.length });
      const formation = previewData[i];

      try {
        const startDateTime = new Date(formation.startDate);
        if (formation.time && typeof formation.time === 'string') {
          const [hours, minutes] = formation.time.split(':');
          startDateTime.setHours(parseInt(hours) || 9, parseInt(minutes) || 0);
        } else {
          startDateTime.setHours(9, 0);
        }

        const endDateTime = new Date(formation.endDate);
        endDateTime.setHours(17, 0);

        const formationData = {
          title: formation.title,
          description: formation.description || '',
          objectives: Array.isArray(formation.objectives) ? formation.objectives.join('\n') : formation.objectives || '',
          program: Array.isArray(formation.program) ? formation.program.join('\n') : formation.program || '',
          skillsToAcquire: Array.isArray(formation.skillsToAcquire) ? formation.skillsToAcquire.join('\n') : formation.skillsToAcquire || '',
          prerequisites: Array.isArray(formation.prerequisites) ? formation.prerequisites.join(',') : formation.prerequisites || '',
          trainer: formation.trainer || '',
          trainerBio: formation.trainerBio || '',
          startDate: startDateTime,
          endDate: endDateTime,
          location: formation.location || '',
          maxCapacity: formation.maxCapacity || 20,
          targetDivisions: formation.targetDivisions || [],
          isPublic: formation.isPublic,
          status: formation.status,
          level: formation.level,
          cost: formation.cost || 0,
        };

        await onImport(formationData);
        successCount++;
      } catch (error) {
        console.error(`Erreur import formation ${formation.title}:`, error);
        errorCount++;
        importErrors.push({ title: formation.title, error: error.message });
      }
    }

    setErrors(importErrors);
    
    if (errorCount === 0) {
      toast.success(`${successCount} formation(s) importée(s) avec succès !`);
      onClose();
      setFile(null);
      setPreviewData([]);
    } else {
      toast.error(`${successCount} importées, ${errorCount} erreurs`);
    }
    
    setImporting(false);
    setProgress({ current: 0, total: 0 });
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return '';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Importer des formations depuis Excel"
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button 
            onClick={handleImport} 
            disabled={importing || previewData.length === 0}
            className="btn-primary"
          >
            {importing ? 'Import en cours...' : `Importer ${previewData.length} formation(s)`}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Zone d'upload */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="formation-excel-input"
          />
          <label
            htmlFor="formation-excel-input"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <FileSpreadsheet size={48} className="text-primary-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cliquez pour sélectionner un fichier Excel
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Formats acceptés : .xlsx, .xls, .csv
              </p>
            </div>
          </label>
        </div>

        {/* Aperçu des données */}
        {previewData.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Aperçu des formations ({previewData.length} formation(s))
            </h3>
            <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Titre</th>
                    <th className="px-3 py-2 text-left">Statut</th>
                    <th className="px-3 py-2 text-left">Publiée</th>
                    <th className="px-3 py-2 text-left">Date début</th>
                    <th className="px-3 py-2 text-left">Lieu</th>
                    <th className="px-3 py-2 text-left">Coût (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((formation, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2 font-medium">{formation.title}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          formation.status === 'ongoing' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          formation.status === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          formation.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {formation.status === 'ongoing' ? 'En cours' :
                           formation.status === 'upcoming' ? 'À venir' :
                           formation.status === 'completed' ? 'Terminé' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {formation.isPublic ? (
                          <span className="text-green-600 dark:text-green-400">✓ Oui</span>
                        ) : (
                          <span className="text-red-500 dark:text-red-400">✗ Non</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{formatDate(formation.startDate)}</td>
                      <td className="px-3 py-2">{formation.location || '-'}</td>
                      <td className="px-3 py-2">{formation.cost?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <div className="px-3 py-2 text-center text-slate-400 text-sm border-t">
                  ... et {previewData.length - 10} autres formations
                </div>
              )}
            </div>
          </div>
        )}

        {/* Barre de progression */}
        {importing && progress.total > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Import en cours...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Erreurs rencontrées :</p>
            <ul className="text-xs text-red-600 dark:text-red-300 space-y-1">
              {errors.map((err, idx) => (
                <li key={idx}>• {err.title}: {err.error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Format du fichier */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
            📋 Format du fichier Excel attendu :
          </p>
          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <p><strong>Colonnes obligatoires :</strong> Titre</p>
            <p><strong>Colonnes optionnelles :</strong> Description, Statut, Publiée, Date début, Date fin, Horaire, Lieu, Capacité, Formateur, Bio formateur, <span className="font-bold">Coût de la formation</span>, Niveau, Objectifs (séparés par ;), Programme (séparé par ;), <span className="font-bold">Compétences à acquérir (séparées par ;)</span>, Prérequis (séparés par ;), Divisions ciblées (séparées par ;)</p>
            <p><strong>Statut :</strong> "À venir", "En cours", "Terminé", "Annulé"</p>
            <p><strong>Publiée :</strong> "oui" ou "non"</p>
            <p><strong>Niveau :</strong> "Débutant", "Intermédiaire", "Avancé", "Expert"</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}