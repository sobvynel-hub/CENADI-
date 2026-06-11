import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Card from './Card';

export default function FormationCard({ formation, adminMode = false }) {
  // ✅ Vérification que formation existe
  if (!formation) {
    console.error('FormationCard: formation est null/undefined');
    return null;
  }

  const enrolled = formation.currentEnrolled || formation.enrolled || 0;
  const capacity = formation.maxCapacity || formation.capacity || 0;
  
  // ✅ Utilisation CORRECTE de l'ID
  const formationId = formation._id || formation.id;
  
  // ✅ Construction du lien avec l'ID
  const detailLink = adminMode 
    ? `/admin/formations/${formationId}`
    : `/formations/${formationId}`;

  const formatDate = (date) => {
    if (!date) return 'Date non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // ✅ Déterminer le statut des places
  const isFull = capacity > 0 && enrolled >= capacity;
  const placesLeft = capacity > 0 ? capacity - enrolled : null;

  return (
    <Card hover padding={false}>
      <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge status={formation.status} />
              {formation.level && (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{formation.level}</span>
              )}
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-tight hover:text-primary-700 transition-colors line-clamp-2">
              {formation.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {formation.description}
        </p>

        {/* ✅ Informations réelles de la formation - SANS taux de remplissage */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar size={13} className="text-primary-500 flex-shrink-0" />
            <span>{formatDate(formation.startDate)} → {formatDate(formation.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin size={13} className="text-primary-500 flex-shrink-0" />
            <span className="truncate">{formation.location || 'Lieu non spécifié'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Users size={13} className="text-primary-500 flex-shrink-0" />
            <span>
              {capacity ? (
                isFull ? (
                  <span className="text-red-500 font-medium">Complet</span>
                ) : (
                  <span>{placesLeft} place{placesLeft > 1 ? 's' : ''} restante{placesLeft > 1 ? 's' : ''}</span>
                )
              ) : (
                'Places illimitées'
              )}
            </span>
          </div>
        </div>

        {/* ✅ Coût de la formation (si > 0) */}
        {(formation.cost > 0 || formation.budget > 0) && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-primary-600 dark:text-primary-400">Coût :</span>
              <span>{formation.cost?.toLocaleString() || formation.budget?.toLocaleString()} FCFA</span>
            </div>
          </div>
        )}

        {formation.trainer && (
          <div className="flex items-center gap-2 mb-4 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 text-xs font-bold">
              {formation.trainer.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-slate-400">Formateur</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formation.trainer}</p>
            </div>
          </div>
        )}

        {/* Bouton "Voir les détails" */}
        <Link
          to={detailLink}
          className="flex items-center justify-between w-full px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-xl text-sm font-semibold transition-all duration-200 group/btn"
        >
          <span>Voir les détails</span>
          <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}