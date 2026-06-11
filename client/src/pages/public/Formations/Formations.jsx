import { useState, useEffect, useMemo } from 'react';
import { Filter } from 'lucide-react';
import FormationCard from '../../../components/ui/FormationCard';
import SearchBar from '../../../components/ui/SearchBar';
import Select from '../../../components/ui/Select';
import Loader from '../../../components/common/Loader';
import { formationsApi } from '../../../api/formations';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'À venir' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'completed', label: 'Terminées' },
];

const LEVEL_OPTIONS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

export default function Formations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        
        const response = await formationsApi.getUpcoming();
        const formationsData = response?.data || (Array.isArray(response) ? response : []);
        
        console.log('📡 Formations chargées:', formationsData.length);
        console.log('📡 Détail:', formationsData.map(f => ({ title: f.title, status: f.status, isPublic: f.isPublic })));
        
        setFormations(formationsData);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
        setFormations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFormations();
  }, []);

  const filtered = useMemo(() => {
    return formations.filter(f => {
      const matchSearch = !search || 
        f.title?.toLowerCase().includes(search.toLowerCase()) || 
        f.description?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || f.status === statusFilter;
      const matchLevel = !levelFilter || f.level === levelFilter;
      return matchSearch && matchStatus && matchLevel;
    });
  }, [formations, search, statusFilter, levelFilter]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Catalogue des formations</h1>
        <p className="text-slate-500 dark:text-slate-400">Découvrez toutes les formations disponibles chez CENADI</p>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border p-4 mb-6 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Rechercher une formation..."
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[{ value: '', label: 'Tous les statuts' }, ...STATUS_OPTIONS]}
            placeholder="Statut"
            className="sm:w-44"
          />
          <Select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            options={[{ value: '', label: 'Tous les niveaux' }, ...LEVEL_OPTIONS.map(l => ({ value: l, label: l }))]}
            placeholder="Niveau"
            className="sm:w-44"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-white">{filtered.length}</span> 
          formation{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Filter size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune formation trouvée</p>
          <p className="text-slate-400 text-sm mt-1">
            {formations.length === 0 
              ? "Aucune formation n'est disponible pour le moment. Connectez-vous en tant qu'administrateur pour en créer."
              : "Modifiez vos filtres de recherche"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((formation, i) => (
            <div key={formation._id || formation.id} className="animate-in" style={{ animationDelay: `${Math.min(i, 4) * 0.05}s` }}>
              <FormationCard formation={formation} adminMode={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}