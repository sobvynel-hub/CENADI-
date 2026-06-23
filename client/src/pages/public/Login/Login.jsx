import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft, Shield, User, Users, Compass } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function Login() {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      const userRole = user?.role || user?.data?.role;
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(form.email, form.password);
      
      console.log("✅ Connecté avec succès", response);
      
      // Récupérer le rôle depuis la réponse
      const userRole = response?.role || response?.user?.role || user?.role;
      
      // Récupérer la page d'origine (si l'utilisateur a été redirigé)
      const from = location.state?.from || '/home';
      
      // Rediriger selon le rôle et la page d'origine
      if (userRole === 'admin' || userRole === 'super_admin') {
        // Si l'utilisateur venait d'une page admin, y retourner
        if (from.startsWith('/admin')) {
          navigate(from, { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setError('');
    setLoading(true);
    setForm({ email, password });

    try {
      const response = await login(email, password);
      console.log("✅ Connecté avec succès via Connexion Rapide", response);
      
      const userRole = response?.role || response?.user?.role || response?.data?.user?.role;
      const from = location.state?.from || '/home';
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        if (from.startsWith('/admin')) {
          navigate(from, { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Erreur de connexion rapide:", err);
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorAccess = async () => {
    setError('');
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('cenadi_user');
      const token = localStorage.getItem('cenadi_token');
      if (storedUser || token) {
        await logout();
      }
      navigate('/home', { replace: true });
    } catch (err) {
      console.error("Erreur accès visiteur:", err);
      navigate('/home', { replace: true });
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

          {/* Section Connexion Rapide */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-3 text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                Mode Démo / Connexion Rapide
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('super@cenadi.cm', 'Admin123456!')}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-900/50 hover:shadow-sm text-left transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  Super Admin
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  super@cenadi.cm
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@cenadi.cm', 'Admin123456!')}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20 dark:hover:border-blue-900/50 hover:shadow-sm text-left transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <User size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  Admin
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  admin@cenadi.cm
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('employe@cenadi.cm', 'Admin123456!')}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-900/50 hover:shadow-sm text-left transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Personnel
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  employe@cenadi.cm
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleVisitorAccess}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950/20 dark:hover:border-amber-900/50 hover:shadow-sm text-left transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Visiteur
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Accès Public Libre
                </p>
              </div>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>

        
        </div>
      </div>
    </div>
  );
}