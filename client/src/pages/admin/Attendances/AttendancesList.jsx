import { useState, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from '../../../components/ui/Select';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Loader from '../../../components/common/Loader';
import { attendancesApi } from '../../../api/attendances';
import { formationsApi } from '../../../api/formations';
import { formatDate } from '../../../utils/helpers';

export default function AttendancesList() {
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendances, setLoadingAttendances] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFormations();
  }, []);

  useEffect(() => {
    if (selectedFormation) {
      loadAttendances();
    }
  }, [selectedFormation]);

  const loadFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await formationsApi.getAll();
      
      console.log('📡 Réponse formations:', response);
      
      // ✅ Extraction correcte du tableau
      let formationsArray = [];
      if (response && Array.isArray(response.data)) {
        formationsArray = response.data;
      } else if (Array.isArray(response)) {
        formationsArray = response;
      } else {
        formationsArray = [];
      }
      
      console.log('📡 Formations extraites:', formationsArray.length);
      setFormations(formationsArray);
      
      // ✅ Sélectionner automatiquement la première formation si disponible
      if (formationsArray.length > 0 && !selectedFormation) {
        setSelectedFormation(formationsArray[0]._id);
      }
    } catch (error) {
      console.error('Erreur chargement formations:', error);
      setError('Impossible de charger les formations');
      toast.error('Erreur lors du chargement des formations');
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendances = async () => {
    if (!selectedFormation) return;
    
    try {
      setLoadingAttendances(true);
      const response = await attendancesApi.getByFormation(selectedFormation);
      
      let attendancesArray = [];
      if (response && Array.isArray(response.data)) {
        attendancesArray = response.data;
      } else if (Array.isArray(response)) {
        attendancesArray = response;
      } else {
        attendancesArray = [];
      }
      
      setAttendances(attendancesArray);
    } catch (error) {
      console.error('Erreur chargement présences:', error);
      toast.error('Erreur lors du chargement des présences');
      setAttendances([]);
    } finally {
      setLoadingAttendances(false);
    }
  };

  const markPresence = async (id, status) => {
    try {
      if (status === 'present') {
        await attendancesApi.markPresent(id);
      } else {
        await attendancesApi.markAbsent(id);
      }
      toast.success('Présence enregistrée');
      loadAttendances();
    } catch (error) {
      console.error('Erreur marquage présence:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const generateQRCode = async () => {
    if (!selectedFormation) return;
    try {
      const response = await attendancesApi.generateQRCode(selectedFormation);
      const qrCodeUrl = response?.qrCode || response?.data?.qrCode;
      if (qrCodeUrl) {
        window.open(qrCodeUrl, '_blank');
      }
      toast.success('QR Code généré');
    } catch (error) {
      console.error('Erreur génération QR code:', error);
      toast.error('Erreur lors de la génération du QR code');
    }
  };

  // ✅ Construction des options du select
  const formationOptions = formations.map(f => ({
    value: f._id,
    label: f.title
  }));

  const columns = [
    { 
      key: 'user', 
      label: 'Employé', 
      render: (_, row) => `${row.userId?.firstName || ''} ${row.userId?.lastName || ''}` 
    },
    { 
      key: 'status', 
      label: 'Statut', 
      render: (val) => <Badge status={val === 'present' ? 'confirmed' : 'cancelled'} /> 
    },
    { 
      key: 'date', 
      label: 'Date', 
      render: (val) => formatDate(val) 
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => markPresence(row._id, 'present')} 
            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Marquer présent"
          >
            <CheckCircle size={18} />
          </button>
          <button 
            onClick={() => markPresence(row._id, 'absent')} 
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Marquer absent"
          >
            <XCircle size={18} />
          </button>
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadFormations} className="btn-primary">
          <RefreshCw size={16} className="mr-2" /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des présences</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Marquez les présences des employés par formation
          </p>
        </div>
        {selectedFormation && (
          <button onClick={generateQRCode} className="btn-primary">
            <QrCode size={18} className="mr-2" />
            Générer QR Code
          </button>
        )}
      </div>

      {/* Sélection de la formation */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Formation
        </label>
        {formations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Aucune formation disponible</p>
            <button onClick={loadFormations} className="btn-secondary mt-3">
              <RefreshCw size={14} className="mr-2" /> Actualiser
            </button>
          </div>
        ) : (
          <select
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">-- Sélectionner une formation --</option>
            {formations.map(formation => (
              <option key={formation._id} value={formation._id}>
                {formation.title} - {formation.trainer || 'Formateur non défini'}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tableau des présences */}
      {selectedFormation && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">
              Liste des présences
              {loadingAttendances && <span className="ml-2 text-sm text-slate-400">(chargement...)</span>}
            </h2>
          </div>
          
          {loadingAttendances ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : attendances.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>Aucune présence enregistrée pour cette formation</p>
              <p className="text-sm mt-1">Les présences apparaîtront ici une fois marquées</p>
            </div>
          ) : (
            <Table columns={columns} data={attendances} />
          )}
        </div>
      )}

      {!selectedFormation && formations.length > 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border">
          <p className="text-slate-500">Sélectionnez une formation pour voir les présences</p>
        </div>
      )}
    </div>
  );
}