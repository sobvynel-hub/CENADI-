import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      // Vérifier le rôle de l'utilisateur
      const userRole = user?.role || user?.data?.role;
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'user' || !userRole) {
        navigate('/home', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // La fonction login retourne probablement les données utilisateur
      const response = await login(form.email, form.password);
      
      console.log("✅ Connecté avec succès", response);
      
      // Récupérer le rôle depuis la réponse ou depuis l'utilisateur dans le contexte
      const userRole = response?.role || response?.user?.role || user?.role;
      
      // Rediriger selon le rôle
      if (userRole === 'admin' || userRole === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-200 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Retour à l'accueil
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 shadow-card animate-in">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-green-glow mb-4">
              <span className="text-white font-display font-bold text-2xl">C</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Connexion</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Accédez à votre espace personnel CENADI
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="super@cenadi.cm"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-11 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-600 rounded" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Se souvenir de moi
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base flex items-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
              Comptes de démonstration :
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Super Admin: <code className="text-primary-700 dark:text-primary-400 font-mono">super@cenadi.cm</code>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin: <code className="text-primary-700 dark:text-primary-400 font-mono">admin@cenadi.cm</code>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personnel: <code className="text-primary-700 dark:text-primary-400 font-mono">employe@cenadi.cm</code>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mot de passe: <code className="text-primary-700 dark:text-primary-400 font-mono">Admin123456!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}