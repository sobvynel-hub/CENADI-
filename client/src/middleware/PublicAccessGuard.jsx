/**
 * middleware/PublicAccessGuard.jsx
 * Vérifie le statut de l'accès public et gère les redirections
 * 
 * LOGIQUE :
 * 
 * 1. Si utilisateur EST authentifié (connecté) :
 *    - Admin / Super Admin → /admin/dashboard
 *    - Personnel / Visiteur → /home
 * 
 * 2. Si utilisateur N'EST PAS authentifié (non connecté) :
 *    - Vérifier le rôle mémorisé (cenadi_role)
 *    - Si admin mémorisé → /login (doit se réauthentifier)
 *    - Sinon → /home (espace public)
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
    rememberedRole
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
      if (!location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Outlet />;
    }

    // 1b. Personnel / Visiteur connecté → home
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

  // 2c. ✅ Vérifier le rôle mémorisé pour les admins
  // Si le rôle mémorisé est admin ou super_admin → login (doit se réauthentifier)
  const rememberedIsAdmin = rememberedRole === 'admin' || rememberedRole === 'super_admin';
  
  if (rememberedIsAdmin) {
    // C'est un admin (même déconnecté) → doit se réauthentifier
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2d. ✅ Personnel / Visiteur ou pas de rôle mémorisé → espace public (home)
  return <Outlet />;
}