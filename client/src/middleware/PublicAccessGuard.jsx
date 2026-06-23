/**
 * middleware/PublicAccessGuard.jsx
 * Vérifie le statut de l'accès public et gère les redirections par rôle
 * 
 * LOGIQUE :
 * - Si mode lockdown activé (publicAccess.enabled = false) :
 *   → Tous les utilisateurs non authentifiés → redirigés vers /login
 *   → Les admins peuvent accéder après connexion
 *   → Les personnels/visiteurs → redirigés vers /login
 * 
 * - Si mode normal (publicAccess.enabled = true) :
 *   → Admin non connecté → redirigé vers /login
 *   → Personnel/Visiteur non connecté → accède à /home
 *   → Admin connecté → accède au dashboard
 *   → Personnel connecté → accède à /home
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

  const isLockdown = publicAccess?.enabled === false;
  const isAdminUser = isAdmin || isSuperAdmin;

  // ============ CAS 1 : Utilisateur authentifié ============
  if (isAuthenticated && user) {
    // Si l'utilisateur est Admin ou Super Admin
    if (isAdminUser) {
      // S'il essaie d'accéder à une page non-admin, on le redirige vers le dashboard
      if (!location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      // Sinon, on le laisse passer
      return <Outlet />;
    }

    // Si l'utilisateur est un personnel ou visiteur connecté
    // S'il essaie d'accéder à une page admin, on le redirige vers /home
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/home" replace />;
    }
    // Sinon, on le laisse passer
    return <Outlet />;
  }

  // ============ CAS 2 : Utilisateur NON authentifié ============

  // 2a. Si le mode lockdown est activé : TOUT LE MONDE → login
  if (isLockdown) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2b. Mode normal : on vérifie le rôle pour la redirection

  // On ne peut pas déterminer le rôle d'un utilisateur non connecté
  // Donc on laisse passer vers les pages publiques (home, formations, etc.)
  // Mais on bloque l'accès aux pages admin via le composant AdminRoute

  // Si l'utilisateur essaie d'accéder à une page admin, on le redirige vers login
  if (location.pathname.startsWith('/admin')) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Sinon, on laisse passer vers les pages publiques
  return <Outlet />;
}