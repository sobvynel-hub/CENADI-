import { useState, useEffect } from 'react';
import { Download, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Loader from '../../../components/common/Loader';
import { certificatesApi } from '../../../api/certificates';
import { formatDate } from '../../../utils/helpers';

export default function CertificatesList() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificatesApi.getAll();
      
      // ✅ Extraction correcte du tableau
      const certificatesArray = response?.data || (Array.isArray(response) ? response : []);
      console.log('📡 Certificats chargés:', certificatesArray.length);
      setCertificates(certificatesArray);
    } catch (error) {
      console.error('Erreur chargement certificats:', error);
      toast.error('Erreur lors du chargement des attestations');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const download = async (id) => {
    try {
      const blob = await certificatesApi.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Téléchargement commencé');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const sendEmail = async (id) => {
    try {
      await certificatesApi.sendEmail(id);
      toast.success('Email envoyé avec succès');
      loadCertificates();
    } catch (error) {
      console.error('Erreur envoi email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  const columns = [
    { 
      key: 'user', 
      label: 'Employé', 
      render: (_, row) => `${row.userId?.firstName || ''} ${row.userId?.lastName || ''}` 
    },
    { 
      key: 'formation', 
      label: 'Formation', 
      render: (_, row) => row.formationId?.title || row.personalTrainingId?.trainingName || '-' 
    },
    { 
      key: 'certificateNumber', 
      label: 'N° Attestation', 
      render: (val) => val || '-' 
    },
    { 
      key: 'issueDate', 
      label: 'Date d\'émission', 
      render: (val) => formatDate(val) 
    },
    { 
      key: 'source', 
      label: 'Source', 
      render: (val) => <Badge status={val === 'enterprise' ? 'confirmed' : 'pending'} /> 
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => download(row._id)} 
            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
            title="Télécharger"
          >
            <Download size={16} />
          </button>
          {!row.emailSent && (
            <button 
              onClick={() => sendEmail(row._id)} 
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Envoyer par email"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      )
    },
  ];

  // Sécurisation des données pour le tableau
  const tableData = Array.isArray(certificates) ? certificates : [];

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Attestations</h1>
          <p className="text-slate-500 text-sm">{tableData.length} attestation(s) délivrée(s)</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <Table columns={columns} data={tableData} emptyText="Aucune attestation trouvée" />
      </div>
    </div>
  );
}