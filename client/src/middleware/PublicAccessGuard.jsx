/**
 * middleware/PublicAccessGuard.jsx
 * Vérifie le statut de l'accès public et gère les redirections par rôle
 * 
 * LOGIQUE :
 * - Mode lockdown activé (publicAccess.enabled = false) :
 *   → Tous les utilisateurs (même non connectés) → accèdent à /home
 *   → Les admins sont redirigés vers /login s'ils ne sont pas connectés
 *   → Les admins connectés accèdent au dashboard
 * 
 * - Mode normal (publicAccess.enabled = true) :
 *   → Visiteurs → /home
 *   → Admin non connecté → /login
 *   → Admin connecté → /admin/dashboard
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Loader from '../components/common/Loader';

export default function PublicAccessGuard() {
  const { user, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
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
        setPublicAccess({ enabled: true });
      } finally {
        setLoading(false);
      }
    };

    checkPublicAccess();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Vérification de l'accès..." />;
  }

  const isLockdown = publicAccess?.enabled === false;
  const isAdminUser = isAdmin || isSuperAdmin;

  // ============ CAS 1 : Utilisateur authentifié ============
  if (isAuthenticated && user) {
    // Admin ou Super Admin
    if (isAdminUser) {
      if (!location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Outlet />;
    }

    // Personnel / Visiteur connecté
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/home" replace />;
    }
    return <Outlet />;
  }

  // ============ CAS 2 : Utilisateur NON authentifié ============

  // ✅ NOUVEAU : Si c'est un admin qui essaie d'accéder (on ne peut pas savoir), on le redirige vers login
  // Mais pour les visiteurs normaux, on les laisse aller sur /home

  // Si l'utilisateur essaie d'accéder à une page admin, on le redirige vers login
  if (location.pathname.startsWith('/admin')) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ✅ NOUVEAU : Même en lockdown, les visiteurs peuvent voir la page d'accueil
  // Mais ils ne peuvent pas accéder aux autres pages (formations, blog, etc.)
  // Si vous voulez bloquer tout sauf /home en lockdown, décommentez les lignes ci-dessous

  // Si le mode lockdown est activé et que l'utilisateur essaie d'accéder à autre chose que /home
  if (isLockdown && location.pathname !== '/home') {
    // Autoriser l'accès à /home uniquement
    if (location.pathname !== '/home') {
      return <Navigate to="/home" replace />;
    }
  }

  // Sinon, on laisse passer vers les pages publiques
  return <Outlet />;
}