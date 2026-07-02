import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { authApi } from '../../../api/auth';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Vérifier la présence du token
  useEffect(() => {
    if (!token || token.length < 10) {
      setErrorMessage('Lien de réinitialisation invalide. Veuillez demander un nouveau lien.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setResetSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
      
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Erreur lors de la réinitialisation.';
      
      if (status === 400) {
        setErrorMessage('Le lien a expiré ou est invalide. Veuillez demander un nouveau lien.');
        toast.error('Lien invalide ou expiré');
      } else {
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Affichage d'erreur initiale
  if (errorMessage && !resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 shadow-xl">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white text-center mb-3">
              Lien invalide
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/forgot-password"
                className="btn-primary w-full text-center py-2.5"
              >
                Demander un nouveau lien
              </Link>
              <Link
                to="/login"
                className="text-sm text-slate-500 hover:text-primary-600 text-center transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage de succès
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 shadow-xl">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white text-center mb-3">
              Mot de passe réinitialisé !
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            <Link
              to="/login"
              className="btn-primary w-full text-center py-2.5"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de réinitialisation
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Nouveau mot de passe</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Choisissez un mot de passe sécurisé (minimum 6 caractères)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Minimum 6 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Réinitialisation...
                </div>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}