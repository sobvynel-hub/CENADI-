/**
 * middleware/PublicAccessGuard.jsx
 * Vérifie le statut de l'accès public et gère les redirections
 * 
 * LOGIQUE SIMPLIFIÉE :
 * 
 * 1. Si utilisateur EST authentifié (connecté) :
 *    - Admin / Super Admin → /admin/dashboard
 *    - Personnel / Visiteur → /home
 * 
 * 2. Si utilisateur N'EST PAS authentifié (non connecté) :
 *    - On vérifie le rôle mémorisé (cenadi_role)
 *    - Si c'est un admin → /login (doit se réauthentifier)
 *    - Si c'est un personnel/visiteur → /home (espace public)
 *    - Si aucun rôle mémorisé → /home (espace public)
 * 
 * 3. Si mode lockdown activé :
 *    - Tout le monde (sauf admins connectés) → /login
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Loader from '../components/common/Loader';

export default function PublicAccessGuard() {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    isSuperAdmin,
    isAdminRole
  } = useAuth();
  
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

  // Pendant le chargement
  if (loading) {
    return <Loader fullScreen text="Vérification de l'accès..." />;
  }

  const isLockdown = publicAccess?.enabled === false;
  const isAdminUser = isAdmin || isSuperAdmin;

  // ============================================================
  // CAS 1 : Utilisateur EST authentifié (connecté)
  // ============================================================
  if (isAuthenticated && user) {
    // 1a. Admin / Super Admin → dashboard
    if (isAdminUser) {
      // S'il essaie d'accéder à une page non-admin, on le redirige vers le dashboard
      if (!location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Outlet />;
    }

    // 1b. Personnel / Visiteur connecté → home
    // S'il essaie d'accéder à une page admin, on le redirige vers /home
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/home" replace />;
    }
    return <Outlet />;
  }

  // ============================================================
  // CAS 2 : Utilisateur N'EST PAS authentifié (non connecté)
  // ============================================================

  // 2a. Si le mode lockdown est activé : TOUT LE MONDE → login
  if (isLockdown) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2b. Si l'utilisateur essaie d'accéder à une page admin → login
  if (location.pathname.startsWith('/admin')) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2c. ✅ Vérifier le rôle mémorisé
  // Si c'est un admin (même déconnecté) → login (doit se réauthentifier)
  if (isAdminRole) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2d. ✅ Personnel / Visiteur ou pas de rôle mémorisé → espace public (home)
  return <Outlet />;
}