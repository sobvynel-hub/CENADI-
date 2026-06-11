import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, User, Award, CheckCircle2, Clock, Download, Mail, Edit, Trash2, Globe, GlobeLock, Target, BookOpen, Coins } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';
import { formationsApi } from '../../../api/formations';
import toast from 'react-hot-toast';

export default function AdminFormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [ADMIN] Recherche formation avec ID:', id);
        
        if (!id) {
          throw new Error('ID de formation manquant');
        }
        
        const response = await formationsApi.getById(id);
        const formationData = response?.data || response;
        
        if (!formationData || !formationData._id) {
          throw new Error('Formation non trouvée');
        }
        
        console.log('✅ [ADMIN] Formation trouvée:', formationData.title);
        setFormation(formationData);
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError(err.message || 'La formation que vous recherchez n\'existe pas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormation();
  }, [id]);

  const handleTogglePublish = async () => {
    const newPublishState = !formation.isPublic;
    const actionText = newPublishState ? 'publiée' : 'dépubliée';
    
    try {
      await formationsApi.togglePublish(formation._id, newPublishState);
      toast.success(`Formation ${actionText} avec succès`);
      setFormation({ ...formation, isPublic: newPublishState });
    } catch (error) {
      console.error(`Erreur ${actionText}:`, error);
      toast.error(error.response?.data?.message || `Erreur lors de la ${actionText}`);
    }
  };

  const handleDelete = async () => {
    try {
      await formationsApi.delete(formation._id);
      toast.success('Formation supprimée avec succès');
      navigate('/admin/formations');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  
  if (error || !formation) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error || 'Formation introuvable'}</p>
          <Link to="/admin/formations" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'Date non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const enrolled = formation.currentEnrolled || 0;
  const capacity = formation.maxCapacity || 0;
  const placesLeft = capacity > 0 ? capacity - enrolled : 'Illimité';
  const isFull = capacity > 0 && enrolled >= capacity;

  const infoItems = [
    { icon: Calendar, label: 'Date de début', value: formatDate(formation.startDate) },
    { icon: Clock, label: 'Horaire', value: formatTime(formation.startDate) || 'Non spécifiée' },
    { icon: Calendar, label: 'Date de fin', value: formatDate(formation.endDate) },
    { icon: MapPin, label: 'Lieu', value: formation.location || 'Non spécifié' },
    { icon: Users, label: 'Places disponibles', value: isFull ? 'Complet' : (capacity ? `${placesLeft} / ${capacity}` : 'Illimité') },
    { icon: User, label: 'Formateur', value: formation.trainer || 'À confirmer' },
  ];

  const objectivesList = Array.isArray(formation.objectives) 
    ? formation.objectives 
    : formation.objectives 
      ? formation.objectives.split('\n').filter(o => o.trim())
      : ['Maîtriser les concepts fondamentaux', 'Appliquer les meilleures pratiques', 'Développer des compétences opérationnelles'];

  const programList = Array.isArray(formation.program)
    ? formation.program
    : formation.program
      ? formation.program.split('\n').filter(p => p.trim())
      : ['Module 1 : Introduction', 'Module 2 : Approfondissement', 'Module 3 : Évaluation et validation'];

  // ✅ Compétences à acquérir
  const skillsList = Array.isArray(formation.skillsToAcquire)
    ? formation.skillsToAcquire
    : formation.skillsToAcquire
      ? formation.skillsToAcquire.split('\n').filter(s => s.trim())
      : [];

  const prerequisitesList = Array.isArray(formation.prerequisites)
    ? formation.prerequisites
    : formation.prerequisites && formation.prerequisites !== 'Aucun'
      ? [formation.prerequisites]
      : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Boutons retour et actions */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          to="/admin/formations" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 font-medium transition-colors"
        >
          <ArrowLeft size={15} /> Retour aux formations
        </Link>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePublish}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              formation.isPublic 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
            }`}
          >
            {formation.isPublic ? <GlobeLock size={16} /> : <Globe size={16} />}
            {formation.isPublic ? 'Dépublier' : 'Publier'}
          </button>
          
          <Link
            to={`/admin/formations/${formation._id}/edit`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
          >
            <Edit size={16} />
            Modifier
          </Link>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale - Contenu */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge status={formation.status} />
              {formation.level && (
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {formation.level}
                </span>
              )}
              {formation.isPublic ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  📢 Publiée
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                  🔒 Non publiée
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {formation.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {formation.description}
            </p>
          </div>

          {/* Objectifs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-primary-500" />
              Objectifs de la formation
            </h2>
            <ul className="space-y-3">
              {objectivesList.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={17} className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Compétences à acquérir */}
          {skillsList.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-primary-500" />
                Compétences à acquérir
              </h2>
              <ul className="space-y-3">
                {skillsList.map((skill, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={17} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Programme */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
              Programme détaillé
            </h2>
            <div className="space-y-3">
              {programList.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prérequis */}
          {prerequisitesList.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-3">
                Prérequis
              </h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {prerequisitesList.map((prereq, idx) => (
                  <li key={idx}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar - Informations pratiques */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-card space-y-4 sticky top-24">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">
              Informations pratiques
            </h3>
            
            <div className="space-y-4">
              {infoItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Coût de la formation (anciennement budget) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Coût de la formation</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1">
                <Coins size={14} className="text-primary-500" />
                {formation.cost?.toLocaleString() || formation.budget?.toLocaleString() || 0} FCFA
              </p>
            </div>

            {/* Formateur Bio */}
            {formation.trainerBio && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">À propos du formateur</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{formation.trainerBio}</p>
              </div>
            )}

            {/* ID technique (admin seulement) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">ID technique</p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all">
                {formation._id}
              </p>
            </div>

            {/* Attestation */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-3 mb-2">
                <Award size={18} className="text-primary-600 dark:text-primary-400" />
                <p className="font-semibold text-primary-800 dark:text-primary-300 text-sm">Attestation délivrée</p>
              </div>
              <p className="text-xs text-primary-600 dark:text-primary-400">
                Une attestation de participation vous sera remise à l'issue de la formation.
              </p>
            </div>

            {/* Bouton d'inscription */}
            {formation.status !== 'completed' && formation.status !== 'cancelled' && !isFull && (
              <button 
                className="w-full btn-primary py-2.5 mt-2"
                onClick={() => window.location.href = '/login'}
              >
                S'inscrire à cette formation
              </button>
            )}

            {isFull && formation.status !== 'completed' && (
              <div className="text-center py-2 text-sm text-red-500">
                Formation complète
              </div>
            )}

            {formation.status === 'completed' && (
              <div className="text-center py-2 text-sm text-slate-500">
                Cette formation est terminée
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="Confirmer la suppression" 
        size="md"
        footer={
          <>
            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={handleDelete} className="btn-danger">Supprimer</button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Êtes-vous sûr de vouloir supprimer la formation <strong className="font-semibold">"{formation?.title}"</strong> ?
        </p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
          Cette action est irréversible et supprimera également toutes les inscriptions associées.
        </p>
      </Modal>
    </div>
  );
}