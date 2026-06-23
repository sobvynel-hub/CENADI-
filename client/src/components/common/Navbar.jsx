import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown, LogOut, LayoutDashboard, Newspaper } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const NAV_LINKS = [
  { label: 'Accueil', path: '/' },
  { label: 'Formations', path: '/formations' },
  { label: 'Blog', path: '/blog' }, // ✅ NOUVEAU
  { label: 'À propos', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - avec votre logo.jpg */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity duration-200"
            title="Retour à l'accueil"
          >
            <img 
              src="/logo.png" 
              alt="CENADI" 
              className="h-9 w-auto object-contain"
            />
            <span className="font-display font-bold text-lg text-primary-800 dark:text-primary-400 tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
              
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50/70 dark:hover:bg-primary-900/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50/70 dark:hover:bg-primary-900/10'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              aria-label="Changer le thème"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">{getFullName()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-1 z-50 shadow-lg">
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard Admin
                      </Link>
                      {/* ✅ NOUVEAU : Lien vers le blog admin */}
                      <Link
                        to="/admin/blog"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                      >
                        <Newspaper size={15} />
                        Gérer le blog
                      </Link>
                      <hr className="my-1 border-slate-100 dark:border-slate-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={15} />
                        Se déconnecter
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                Se connecter
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-in">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink 
                to="/admin/dashboard" 
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Admin
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}