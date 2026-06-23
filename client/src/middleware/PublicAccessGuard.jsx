/**
 * middleware/PublicAccessGuard.jsx
 * Vérifie le statut de l'accès public et redirige selon le rôle
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Loader from '../components/common/Loader';

export default function PublicAccessGuard() {
  const { user, isAuthenticated, loading, memorizedRole } = useAuth();
  const location = useLocation();
  const [publicAccess, setPublicAccess] = useState(null);
  const [checking, setChecking] = useState(true);

  console.log('🛡️ PublicAccessGuard - État:', {
    isAuthenticated,
    hasUser: !!user,
    memorizedRole,
    path: location.pathname,
    loading,
    checking,
  });

  useEffect(() => {
    const checkPublicAccess = async () => {
      try {
        console.log('🔍 Vérification du statut d\'accès public...');
        const response = await api.get('/settings/public-access');
        const data = response?.data?.data || response?.data;
        setPublicAccess(data?.publicAccess);
        console.log('📊 Statut accès public:', data?.publicAccess);
      } catch (error) {
        console.error('❌ Erreur vérification accès public:', error);
        setPublicAccess({ enabled: true }); // Fallback: accès ouvert
      } finally {
        setChecking(false);
      }
    };

    checkPublicAccess();
  }, []);

  // ⏳ Pendant le chargement
  if (loading || checking) {
    console.log('⏳ Attente du chargement...');
    return <Loader fullScreen text="Vérification de l'accès..." />;
  }

  // 🚪 Routes d'authentification toujours accessibles (priorité maximale)
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (authRoutes.includes(location.pathname)) {
    console.log('✅ Route d\'authentification, accès libre');
    return <Outlet />;
  }

  // ✅ Si l'utilisateur est connecté
  if (isAuthenticated && user) {
    const isAdminUser = user.role === 'admin' || user.role === 'super_admin';
    console.log('👤 Utilisateur connecté:', user.email, 'Rôle:', user.role);

    // ✅ Admin sur route publique → rediriger vers dashboard
    if (isAdminUser && !location.pathname.startsWith('/admin')) {
      console.log('🔄 Admin sur route publique → redirection vers dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    }

    // ✅ Non-admin sur route admin → rediriger vers home
    if (!isAdminUser && location.pathname.startsWith('/admin')) {
      console.log('🔄 Non-admin sur route admin → redirection vers home');
      return <Navigate to="/home" replace />;
    }

    console.log('✅ Accès autorisé pour:', user.email);
    return <Outlet />;
  }

  // ✅ Si le rôle est mémorisé mais user est null (refresh en cours)
  if (memorizedRole && !user) {
    const isAdminMemorized = memorizedRole === 'admin' || memorizedRole === 'super_admin';
    console.log('💾 Rôle mémorisé:', memorizedRole);

    // Si admin mémorisé mais pas encore chargé → attendre
    if (isAdminMemorized) {
      console.log('⏳ Admin mémorisé, attente du chargement du profil...');
      return <Loader fullScreen text="Chargement du profil..." />;
    }
  }

  // 🔒 Mode lockdown
  if (publicAccess?.enabled === false) {
    console.log('🔒 Mode LOCKDOWN activé');

    // Si admin mémorisé ou user connecté → autoriser (ils ont accès)
    if (memorizedRole === 'admin' || memorizedRole === 'super_admin' || isAuthenticated) {
      console.log('✅ Admin ou utilisateur connecté, accès autorisé en lockdown');
      return <Outlet />;
    }

    // Sinon → page maintenance
    console.log('🚫 Accès public bloqué → maintenance');
    return <Navigate to="/maintenance" replace />;
  }

  // ✅ Accès public ouvert et utilisateur non connecté
  console.log('🌍 Accès public ouvert');
  return <Outlet />;
}