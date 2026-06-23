import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Users, CalendarCheck, 
  Award, FileText, Search, BarChart3, 
  Settings, Shield, LogOut, Moon, Sun, Building2,
  ChevronLeft, ChevronRight, Newspaper, Lightbulb
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/admin/formations', label: 'Formations', icon: BookOpen },
  { path: '/admin/users', label: 'Utilisateurs', icon: Users },
  { path: '/admin/enrollments', label: 'Inscriptions', icon: CalendarCheck },
  { path: '/admin/personal-trainings', label: 'Formations perso.', icon: FileText },
  { path: '/admin/blog', label: 'Blog', icon: Newspaper },
  //{ path: '/admin/search', label: 'Recherche', icon: Search },
  //{ path: '/admin/statistics', label: 'Statistiques', icon: BarChart3 },
];

const superAdminItems = [
  { path: '/admin/admins', label: 'Administrateurs', icon: Shield },
  { path: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminSidebar({ isOpen, onToggle }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  console.log('✅ AdminSidebar rendu, isOpen:', isOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Déconnecté avec succès');
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-30
        h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-700">
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:w-auto lg:opacity-100'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-display font-bold text-lg text-slate-800 dark:text-white whitespace-nowrap">
              CENADI
            </span>
          </div>
          
          <div className={`lg:hidden ${!isOpen ? 'flex items-center justify-center w-full' : 'hidden'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
          </div>
          
          <button 
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            title={isOpen ? "Réduire le menu" : "Agrandir le menu"}
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          
          <button 
            onClick={onToggle} 
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white'
                }
                ${!isOpen ? 'lg:justify-center' : ''}
              `}
              title={!isOpen ? item.label : ''}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className={`transition-all duration-300 whitespace-nowrap ${!isOpen ? 'lg:hidden' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          ))}

          {isSuperAdmin && (
            <>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2 mx-2" />
              {superAdminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white'
                    }
                    ${!isOpen ? 'lg:justify-center' : ''}
                  `}
                  title={!isOpen ? item.label : ''}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={`transition-all duration-300 whitespace-nowrap ${!isOpen ? 'lg:hidden' : ''}`}>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-700 space-y-0.5">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200 ${!isOpen ? 'lg:justify-center' : ''}`}
            title={!isOpen ? (dark ? 'Mode clair' : 'Mode sombre') : ''}
          >
            {dark ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
            <span className={`transition-all duration-300 whitespace-nowrap ${!isOpen ? 'lg:hidden' : ''}`}>
              {dark ? 'Mode clair' : 'Mode sombre'}
            </span>
          </button>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ${!isOpen ? 'lg:justify-center' : ''}`}
            title={!isOpen ? 'Déconnexion' : ''}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className={`transition-all duration-300 whitespace-nowrap ${!isOpen ? 'lg:hidden' : ''}`}>
              Déconnexion
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}