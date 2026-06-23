/**
 * pages/public/Maintenance/Maintenance.jsx
 * Page affichée quand le mode lockdown est activé
 * 
 * Cette page s'affiche lorsque le Super Admin a activé le mode lockdown
 * et qu'un visiteur non connecté tente d'accéder au site.
 * 
 * Elle informe simplement que l'espace public est temporairement indisponible.
 * Aucun bouton de connexion n'est affiché.
 */

import { Shield, AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../../api/axios';

export default function Maintenance() {
  const [message, setMessage] = useState("L'espace public est temporairement indisponible.");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/settings/public-access');
        const data = response?.data?.data || response?.data;
        if (data?.publicAccess?.message) {
          setMessage(data.publicAccess.message);
        }
        if (data?.publicAccess?.updatedAt) {
          setLastUpdate(data.publicAccess.updatedAt);
        }
      } catch (error) {
        console.error('Erreur chargement message:', error);
        // Garder le message par défaut
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte principale */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Bandeau orange */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex justify-center">
            <Shield className="w-12 h-12 text-white" />
          </div>
          
          <div className="p-8 text-center">
            {/* Icône d'avertissement */}
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-500" />
            </div>
            
            {/* Titre */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Espace public indisponible
            </h1>
            
            {/* Message personnalisé */}
            <div className="mb-6">
              {loading ? (
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">
                  {message}
                </p>
              )}
            </div>
            
            {/* Séparateur */}
            <div className="border-t border-slate-100 dark:border-slate-700 my-6"></div>
            
            {/* Date de dernière modification */}
            {lastUpdate && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={14} />
                <span>Dernière mise à jour : {new Date(lastUpdate).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Pied de page */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            CENADI - Centre National de Développement Informatique
          </p>
        </div>
      </div>
    </div>
  );
}