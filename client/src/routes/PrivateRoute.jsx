import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

/**
 * PrivateRoute — Protège toute route nécessitant une connexion
 */
export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

/**
 * AdminRoute — Protège les routes admin/super_admin
 */
export function AdminRoute({ children, superAdminOnly = false }) {
  const { user, loading, isAdmin, isSuperAdmin, memorizedRole } = useAuth();
  const location = useLocation();

  console.log('🛡️ AdminRoute - Vérification:', {
    hasUser: !!user,
    isAdmin,
    isSuperAdmin,
    memorizedRole,
    superAdminOnly,
    path: location.pathname,
  });

  if (loading) {
    return <Loader fullScreen text="Chargement..." />;
  }

  // Vérifier avec le rôle mémorisé si user est null
  if (!user && memorizedRole) {
    const isAdminMemorized = memorizedRole === 'admin' || memorizedRole === 'super_admin';
    if (!isAdminMemorized) {
      console.log('🚫 Accès refusé: rôle non-admin mémorisé');
      return <Navigate to="/forbidden" replace />;
    }
    console.log('⏳ Admin mémorisé, attente du chargement...');
    return <Loader fullScreen text="Chargement du profil..." />;
  }

  if (!user) {
    console.log('🔒 Utilisateur non connecté → redirection login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    console.log('🚫 Accès refusé: super_admin requis');
    return <Navigate to="/forbidden" replace />;
  }

  if (!isAdmin) {
    console.log('🚫 Accès refusé: admin requis');
    return <Navigate to="/forbidden" replace />;
  }

  console.log('✅ Accès autorisé pour:', user.email);
  return children;
}

/**
 * RoleRedirect — Redirige automatiquement selon le rôle
 * ⚠️ MODIFICATION : N'intercepte PAS la navigation manuelle vers /home
 */
export function RoleRedirect({ children }) {
  const { user, loading, isAdmin, memorizedRole } = useAuth();
  const location = useLocation();

  console.log('🔄 RoleRedirect - État:', {
    hasUser: !!user,
    isAdmin,
    memorizedRole,
    path: location.pathname,
  });

  if (loading) return <Loader fullScreen text="Vérification..." />;

  // ✅ Si connecté et admin sur la racine UNIQUEMENT → rediriger vers dashboard
  // Mais NE PAS rediriger si l'utilisateur a explicitement cliqué sur "Accueil"
  if (user && isAdmin) {
    // ✅ Uniquement rediriger si l'utilisateur est sur "/" (racine)
    // ✅ Ne pas rediriger si l'utilisateur est sur "/home" (il a cliqué sur Accueil)
    if (location.pathname === '/') {
      console.log('🔄 Admin sur / → redirection dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Si connecté et non-admin sur route admin → rediriger vers home
  if (user && !isAdmin && location.pathname.startsWith('/admin')) {
    console.log('🔄 Non-admin sur route admin → redirection home');
    return <Navigate to="/home" replace />;
  }

  // Si le rôle est mémorisé (refresh en cours)
  if (memorizedRole && !user) {
    const isAdminMemorized = memorizedRole === 'admin' || memorizedRole === 'super_admin';
    if (isAdminMemorized && location.pathname !== '/login') {
      console.log('⏳ Admin mémorisé, attente du chargement...');
      return <Loader fullScreen text="Chargement du profil..." />;
    }
  }

  // Non connecté → afficher le contenu public
  return children;
}

// Export par défaut pour compatibilité
export default AdminRoute;