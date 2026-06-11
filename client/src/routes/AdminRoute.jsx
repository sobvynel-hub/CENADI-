import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, UserCheck, ClipboardCheck, Award, Users,
  Building2, Search, BarChart2, ShieldCheck, Settings, LogOut, Menu, X, Bell, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Formations', path: '/admin/formations', icon: BookOpen },
  { label: 'Inscriptions', path: '/admin/enrollments', icon: UserCheck },
  { label: 'Présences', path: '/admin/attendances', icon: ClipboardCheck },
  { label: 'Attestations', path: '/admin/certificates', icon: Award },
  { label: 'Employés', path: '/admin/users', icon: Users },
  { label: 'Divisions', path: '/admin/divisions', icon: Building2 },
  { label: 'Recherche', path: '/admin/search', icon: Search },
  { label: 'Statistiques', path: '/admin/statistics', icon: BarChart2 },
];

const SUPER_ITEMS = [
  { label: 'Administrateurs', path: '/admin/admins', icon: ShieldCheck },
  { label: 'Paramètres', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-display font-bold text-sm">C</span>
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 dark:text-white text-sm leading-tight">CENADI</p>
            <p className="text-xs text-slate-400">Administration</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu principal</p>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {isSuperAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Super Admin</p>
            </div>
            {SUPER_ITEMS.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" 
            title="Se déconnecter"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}