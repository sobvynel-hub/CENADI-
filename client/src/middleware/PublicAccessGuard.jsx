/**
 * middleware/PublicAccessGuard.jsx
 * Vérifie le statut de l'accès public et redirige vers login si nécessaire
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Loader from '../components/common/Loader';

export default function PublicAccessGuard() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [publicAccess, setPublicAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPublicAccess = async () => {
      try {
        const response = await api.get('/settings/public-access');
        const data = response?.data?.data || response?.data;
        setPublicAccess(data?.publicAccess);
      } catch (error) {
        console.error('Erreur vérification accès public:', error);
        // En cas d'erreur, on considère que l'accès est ouvert
        setPublicAccess({ enabled: true });
      } finally {
        setLoading(false);
      }
    };

    checkPublicAccess();
  }, []);

  // Pendant le chargement
  if (loading) {
    return <Loader fullScreen text="Vérification de l'accès..." />;
  }

  // Si le mode lockdown est activé ET que l'utilisateur n'est pas connecté
  if (publicAccess?.enabled === false && !isAuthenticated) {
    // Rediriger vers login avec la destination sauvegardée
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Sinon, afficher le contenu normal
  return <Outlet />;
}