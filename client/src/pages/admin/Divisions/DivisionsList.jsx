import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/ui/Table';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import { divisionsApi } from '../../../api/divisions';
import DivisionForm from './DivisionForm';

export default function DivisionsList() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDivision, setEditDivision] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadDivisions();
  }, []);

  // ✅ CORRIGÉ : extraction correcte du tableau
  const loadDivisions = async () => {
    try {
      setLoading(true);
      const response = await divisionsApi.getAll();
      
      // ✅ Extraction du tableau depuis response.data
      const divisionsArray = response?.data || (Array.isArray(response) ? response : []);
      setDivisions(divisionsArray);
    } catch (error) {
      console.error('Erreur chargement divisions:', error);
      toast.error('Erreur lors du chargement');
      setDivisions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editDivision) {
        await divisionsApi.update(editDivision._id, data);
        toast.success('Division modifiée');
      } else {
        await divisionsApi.create(data);
        toast.success('Division créée');
      }
      loadDivisions();
      setShowForm(false);
      setEditDivision(null);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async () => {
    try {
      await divisionsApi.delete(deleteId);
      toast.success('Division supprimée');
      loadDivisions();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'code', label: 'Code' },
    { key: 'budget', label: 'Budget', render: (val) => val ? `${val.toLocaleString()} FCFA` : '-' },
    { 
      key: '_id', 
      label: 'Actions', 
      render: (_, row) => (
        <div className="flex gap-1">
          <button 
            onClick={() => { setEditDivision(row); setShowForm(true); }} 
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Pencil size={15} />
          </button>
          <button 
            onClick={() => setDeleteId(row._id)} 
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ) 
    },
  ];

  // ✅ Sécurisation des données pour le tableau
  const tableData = Array.isArray(divisions) ? divisions : [];

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Divisions</h1>
          <p className="text-slate-500 text-sm">{tableData.length} division(s)</p>
        </div>
        <button 
          onClick={() => { setEditDivision(null); setShowForm(true); }} 
          className="btn-primary"
        >
          <Plus size={15} /> Nouvelle
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <Table columns={columns} data={tableData} emptyText="Aucune division trouvée" />
      </div>

      <DivisionForm 
        open={showForm} 
        onClose={() => { setShowForm(false); setEditDivision(null); }} 
        onSave={handleSave} 
        initial={editDivision} 
      />

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
        <p>Êtes-vous sûr de vouloir supprimer cette division ?</p>
      </Modal>
    </div>
  );
}