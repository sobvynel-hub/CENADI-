import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 INITIALISATION - Restauration de session au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('cenadi_user');
        const token = localStorage.getItem('cenadi_token');
        const storedRole = localStorage.getItem('cenadi_role');

        console.log('🔄 Initialisation Auth:', {
          hasUser: !!storedUser,
          hasToken: !!token,
          storedRole,
        });

        // Si token et user existent, on valide le token
        if (storedUser && token) {
          try {
            const response = await authApi.getMe();
            const userData = response.data?.user || response;

            if (userData) {
              setUser(userData);
              // Mettre à jour le rôle dans localStorage
              localStorage.setItem('cenadi_role', userData.role);
              console.log('✅ Session restaurée pour:', userData.email, 'Rôle:', userData.role);
            } else {
              // Nettoyer si les données sont invalides
              console.warn('⚠️ Données utilisateur invalides, nettoyage...');
              localStorage.removeItem('cenadi_user');
              localStorage.removeItem('cenadi_token');
              localStorage.removeItem('cenadi_role');
            }
          } catch (err) {
            // Token invalide ou expiré
            console.warn('⚠️ Token invalide, nettoyage du stockage');
            localStorage.removeItem('cenadi_user');
            localStorage.removeItem('cenadi_token');
            localStorage.removeItem('cenadi_role');
            setUser(null);
          }
        } else if (storedRole && !storedUser) {
          // Le rôle est mémorisé mais pas l'utilisateur → on attend
          console.log('⏳ Rôle mémorisé, attente de la restauration...');
        }
      } catch (err) {
        console.error('❌ Erreur initialisation auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 🔐 CONNEXION
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Tentative de connexion pour:', email);
      const response = await authApi.login(email, password);

      // Structure de la réponse
      const token = response.token;
      const userData = response.data?.user || response;

      if (!token || !userData) {
        throw new Error('Réponse serveur invalide: token ou utilisateur manquant');
      }

      // Stockage des données
      setUser(userData);
      localStorage.setItem('cenadi_user', JSON.stringify(userData));
      localStorage.setItem('cenadi_token', token);
      localStorage.setItem('cenadi_role', userData.role); // ✅ CRITIQUE

      console.log('✅ Connexion réussie pour:', userData.email, 'Rôle:', userData.role);
      toast.success(`Bienvenue, ${userData.firstName} ${userData.lastName}!`);

      // Déterminer si c'est un admin
      const isAdmin = userData.role === 'admin' || userData.role === 'super_admin';

      return { user: userData, token, isAdmin };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erreur de connexion';
      setError(message);
      toast.error(message);
      console.error('❌ Erreur de connexion:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚪 DÉCONNEXION
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      console.log('👋 Déconnexion API réussie');
    } catch (err) {
      console.error('⚠️ Erreur déconnexion API:', err);
    } finally {
      setUser(null);
      setError(null);
      localStorage.removeItem('cenadi_user');
      localStorage.removeItem('cenadi_token');
      localStorage.removeItem('cenadi_role');
      toast.success('Déconnecté avec succès');
      console.log('✅ Nettoyage localStorage effectué');
    }
  }, []);

  // 📝 MISE À JOUR DU PROFIL
  const updateProfile = useCallback(async (data) => {
    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data?.user || response;
      setUser(updatedUser);
      localStorage.setItem('cenadi_user', JSON.stringify(updatedUser));
      localStorage.setItem('cenadi_role', updatedUser.role);
      toast.success('Profil mis à jour');
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
      throw err;
    }
  }, []);

  // 🔑 CHANGEMENT DE MOT DE PASSE
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

  // ✅ PERMISSIONS
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isAuthenticated = !!user && !!localStorage.getItem('cenadi_token');

  // Récupérer le rôle mémorisé (même si user est null)
  const memorizedRole = localStorage.getItem('cenadi_role');

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
    memorizedRole, // ✅ AJOUT : rôle mémorisé pour les redirections
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}