import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rememberedRole, setRememberedRole] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('cenadi_user');
        const token = localStorage.getItem('cenadi_token');
        const storedRole = localStorage.getItem('cenadi_role');

        // Récupérer le rôle mémorisé
        if (storedRole) {
          setRememberedRole(storedRole);
        }

        if (storedUser && token && !user) {
          try {
            const response = await authApi.getMe();
            const userData = response.data?.user || response;
            setUser(userData);
            // Mettre à jour le rôle mémorisé
            if (userData?.role) {
              localStorage.setItem('cenadi_role', userData.role);
              setRememberedRole(userData.role);
            }
          } catch (err) {
            console.warn('Token invalide, nettoyage du stockage');
            localStorage.removeItem('cenadi_user');
            localStorage.removeItem('cenadi_token');
          }
        }
      } catch (err) {
        console.error('Erreur initialisation auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);

      const token = response.token;
      const userData = response.data?.user;

      if (!token || !userData) {
        console.error('Réponse brute:', response);
        throw new Error('Réponse serveur invalide: token ou utilisateur manquant');
      }

      setUser(userData);
      localStorage.setItem('cenadi_user', JSON.stringify(userData));
      localStorage.setItem('cenadi_token', token);

      // Stocker le rôle pour les futures visites
      if (userData?.role) {
        localStorage.setItem('cenadi_role', userData.role);
        setRememberedRole(userData.role);
      }

      toast.success(`Bienvenue, ${userData.firstName} ${userData.lastName}!`);
      return { user: userData, token };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erreur de connexion';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Erreur déconnexion API:', err);
    } finally {
      setUser(null);
      setError(null);
      localStorage.removeItem('cenadi_user');
      localStorage.removeItem('cenadi_token');
      // Ne PAS supprimer le rôle mémorisé
      toast.success('Déconnecté avec succès');
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data?.user || response;
      setUser(updatedUser);
      localStorage.setItem('cenadi_user', JSON.stringify(updatedUser));
      toast.success('Profil mis à jour');
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      await authApi.changePassword(oldPassword, newPassword);
      toast.success('Mot de passe changé avec succès');
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(message);
      throw err;
    }
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isAuthenticated = !!user && !!localStorage.getItem('cenadi_token');

  // Déterminer si l'utilisateur est un admin (même déconnecté)
  const isAdminRole = rememberedRole === 'admin' || rememberedRole === 'super_admin';

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    changePassword,
    isAdmin,
    isSuperAdmin,
    isAuthenticated,
    rememberedRole,
    isAdminRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}