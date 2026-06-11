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
 * @param {boolean} superAdminOnly — Si true, seul super_admin peut accéder
 */
export function AdminRoute({ children, superAdminOnly = false }) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (superAdminOnly && !isSuperAdmin) return <Navigate to="/forbidden" replace />;
  if (!isAdmin) return <Navigate to="/forbidden" replace />;
  return children;
}
