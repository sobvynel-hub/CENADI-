import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { searchApi } from '../../../api/search';
import Table from '../../../components/ui/Table';
import Loader from '../../../components/common/Loader';
import Badge from '../../../components/ui/Badge';
import { Link } from 'react-router-dom';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await searchApi.global(query);
      const data = response?.data || response || {};
      
      // ✅ Ajouter le type à chaque résultat pour la redirection
      const formations = (data.formations || []).map(item => ({ ...item, _type: 'formation' }));
      const users = (data.users || []).map(item => ({ ...item, _type: 'user' }));
      const certificates = (data.certificates || []).map(item => ({ ...item, _type: 'certificate' }));
      const personalTrainings = (data.personalTrainings || []).map(item => ({ ...item, _type: 'personal-training' }));
      
      setResults({ formations, users, certificates, personalTrainings });
    } catch (error) {
      console.error(error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Rassembler tous les résultats
  const allResults = [
    ...(results?.formations || []),
    ...(results?.users || []),
    ...(results?.certificates || []),
    ...(results?.personalTrainings || [])
  ];

  // ✅ Fonction pour générer le lien de redirection en fonction du type
  const getViewLink = (item) => {
    switch (item._type) {
      case 'formation':
        return `/admin/formations/${item._id}`;
      case 'user':
        return `/admin/users/${item._id}`;
      case 'certificate':
        return `/admin/certificates/${item._id}`;
      case 'personal-training':
        return `/admin/personal-trainings/${item._id}`;
      default:
        return '#';
    }
  };

  // ✅ Fonction pour obtenir le libellé du type
  const getTypeLabel = (item) => {
    switch (item._type) {
      case 'formation':
        return 'Formation';
      case 'user':
        return 'Utilisateur';
      case 'certificate':
        return 'Attestation';
      case 'personal-training':
        return 'Formation perso.';
      default:
        return 'Inconnu';
    }
  };

  const columns = [
    { 
      key: 'title', 
      label: 'Titre / Nom',
      render: (_, row) => {
        if (row._type === 'formation') return row.title;
        if (row._type === 'user') return `${row.firstName || ''} ${row.lastName || ''}`;
        if (row._type === 'certificate') return row.certificateNumber || 'Attestation';
        if (row._type === 'personal-training') return row.trainingName;
        return '-';
      }
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (_, row) => <Badge status={row._type === 'formation' ? 'ongoing' : 'completed'} label={getTypeLabel(row)} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link 
          to={getViewLink(row)} 
          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          <Eye size={14} /> Voir
        </Link>
      )
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Recherche globale</h1>
        <p className="text-sm text-slate-500">Recherchez dans les formations, utilisateurs, attestations et déclarations personnelles</p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Rechercher par titre, nom, email, numéro d'attestation..."
          className="input-field flex-1"
        />
        <button onClick={handleSearch} className="btn-primary">
          <Search size={16} /> Rechercher
        </button>
      </div>

      {loading && <Loader />}

      {results && (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {allResults.length} résultat(s) trouvé(s)
            </p>
          </div>
          <Table 
            columns={columns} 
            data={allResults} 
            emptyText="Aucun résultat trouvé pour cette recherche"
          />
        </div>
      )}

      {results && allResults.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-2xl border">
          <p className="text-slate-500">Aucun résultat trouvé pour "{query}"</p>
          <p className="text-sm text-slate-400 mt-1">Essayez avec d'autres mots-clés</p>
        </div>
      )}
    </div>
  );
}