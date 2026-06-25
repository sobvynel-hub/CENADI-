import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, Calendar, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import FormationCard from '../../../components/ui/FormationCard';
import Loader from '../../../components/common/Loader';
import { formationsApi } from '../../../api/formations';

export default function Home() {
  const [formations, setFormations] = useState([]);
  const [stats, setStats] = useState({
    totalFormations: 0,
    ongoingFormations: 0,
    upcomingFormations: 0,
    completedFormations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer toutes les formations
        const response = await formationsApi.getAll();
        const formationsData = response?.data || (Array.isArray(response) ? response : []);

        // Filtrer les formations publiées
        const publicFormations = formationsData.filter(f => f.isPublic === true);

        // Statistiques basées UNIQUEMENT sur les formations
        const total = publicFormations.length;
        const ongoing = publicFormations.filter(f => f.status === 'ongoing').length;
        const upcoming = publicFormations.filter(f => f.status === 'upcoming').length;
        const completed = publicFormations.filter(f => f.status === 'completed').length;

        setStats({
          totalFormations: total,
          ongoingFormations: ongoing,
          upcomingFormations: upcoming,
          completedFormations: completed
        });

        // Afficher les 3 premières formations à venir
        const upcomingFormationsList = publicFormations
          .filter(f => f.status === 'upcoming')
          .slice(0, 3);

        setFormations(upcomingFormationsList.length > 0 ? upcomingFormationsList : publicFormations.slice(0, 3));

      } catch (err) {
        console.error('Erreur chargement données:', err);
        setError('Impossible de charger les données. Veuillez réessayer.');
        setStats({
          totalFormations: 0,
          ongoingFormations: 0,
          upcomingFormations: 0,
          completedFormations: 0
        });
        setFormations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 4 statistiques pertinentes pour les formations
  const STATS = [
    {
      value: stats.totalFormations,
      label: 'Formations disponibles',
      icon: BookOpen,
      color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
    },
    {
      value: stats.ongoingFormations,
      label: 'En cours',
      icon: Clock,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    },
    {
      value: stats.upcomingFormations,
      label: 'À venir',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      value: stats.completedFormations,
      label: 'Terminées',
      icon: Award,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    },
  ];

  const FEATURES = [
    'Inscription en ligne aux formations',
    'Suivi des présences en temps réel',
    'Génération automatique des attestations',
    'Moteur de recherche puissant',
    'Statistiques et rapports détaillés',
    'Gestion multi-divisions',
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Une erreur est survenue</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* SECTION BANNER HERO AVEC IMAGE EN ARRIÈRE-PLAN */}
      <section className="relative overflow-hidden bg-primary-950 text-white">
        {/* Image d'arrière-plan */}
        <div className="absolute inset-0 z-0">
          <img
            src="/group-afro-americans-working-together.jpg"
            alt="Groupe de travail"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Overlay dégradé vert - visible dans les deux modes mais plus léger en sombre */}
        <div className="absolute inset-0 z-10">
          {/* Mode clair : overlay vert prononcé */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800/85 via-primary-700/80 to-primary-600/70 dark:opacity-0" />
          {/* Mode sombre : overlay très léger pour garder l'image visible */}
          <div className="absolute inset-0 hidden dark:block dark:bg-gradient-to-br dark:from-primary-950/20 dark:via-primary-900/15 dark:to-primary-800/10" />
        </div>

        {/* Contenu */}
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 z-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold mb-6 dark:bg-white/5 dark:border-white/10">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              <span className="dark:text-white/90">Plateforme de gestion des formations pour le Centre National de Développement Informatique (CENADI)</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-5">
              Développez vos<br />
              <span className="text-primary-200 dark:text-primary-300">compétences professionnelles</span>
            </h1>
            <p className="text-primary-100 dark:text-white/80 text-lg leading-relaxed mb-8 max-w-xl">
              le  Centre National de Développement Informatique (CENADI)
             facilite la gestion et le suivi des formations pour tout le personnel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/formations" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-all dark:bg-white/10 dark:text-white dark:backdrop-blur-sm dark:border dark:border-white/20 dark:hover:bg-white/20">
                Découvrir les formations
                <ArrowRight size={17} />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all dark:bg-white/5 dark:border-white/15 dark:hover:bg-white/15">
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION STATISTIQUES - UNIQUEMENT SUR LES FORMATIONS */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border p-5 flex items-center gap-4 shadow-card hover:shadow-lg transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION CATALOGUE MINI */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Formations à venir</h2>
            <p className="text-slate-500 text-sm mt-1">Découvrez nos prochains programmes de formation</p>
          </div>
          <Link to="/formations" className="btn-secondary text-sm">
            Voir tout
            <ChevronRight size={15} className="inline ml-1" />
          </Link>
        </div>

        {formations.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Aucune formation disponible pour le moment</p>
            <p className="text-xs text-slate-400 mb-4">
              De nouvelles formations seront bientôt disponibles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {formations.map((formation) => (
              <FormationCard
                key={formation._id || formation.id}
                formation={formation}
                adminMode={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION PRÉSENTATION DES FONCTIONNALITÉS */}
      <section className="bg-slate-50 dark:bg-dark-surface2 border-y border-slate-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                Une plateforme complète pour votre développement
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                CENADI met à votre disposition un système intégré pour gérer l'ensemble du cycle des formations.
              </p>
              <ul className="space-y-3">
                {FEATURES.map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={18} className="text-primary-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              {/* ✅ Bouton "Commencer maintenant" supprimé pour éviter la redondance */}
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 rounded-3xl overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award size={36} className="text-white" />
                  </div>
                  <p className="text-2xl font-display font-bold text-primary-800 dark:text-primary-300">Formations CENADI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION APPEL À L'ACTION */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Prêt à vous former ?</h2>
        <p className="text-slate-500 mb-6 max-w-xl mx-auto">Consultez notre catalogue de formations et inscrivez-vous dès aujourd'hui.</p>
        <Link to="/formations" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          Voir toutes les formations
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}