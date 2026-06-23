import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, Moon, Sun, Home, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import toast from 'react-hot-toast';

// Notifications simulées
const NOTIFICATIONS = [
  { id: 1, message: 'Nouvelle inscription à "Excel Avancé"', read: false, time: 'il y a 5 min', type: 'enrollment' },
  { id: 2, message: 'Formation "Cybersécurité" complétée', read: false, time: 'il y a 1 heure', type: 'formation' },
  { id: 3, message: 'Attestation générée pour Paul Ndjock', read: true, time: 'il y a 2 heures', type: 'certificate' },
  { id: 4, message: 'Nouvel utilisateur inscrit', read: false, time: 'il y a 3 heures', type: 'user' },
];

export default function AdminNavbar({ onMenuClick }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Fermer les menus au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success('Toutes les notifications marquées comme lues');
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    switch (notif.type) {
      case 'enrollment':
        navigate('/admin/enrollments');
        break;
      case 'formation':
        navigate('/admin/formations');
        break;
      case 'certificate':
        navigate('/admin/certificates');
        break;
      default:
        break;
    }
  };

  const getInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      employee: 'Personnel',
      user: 'Visiteur',
    };
    return labels[role] || role;
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>

          <Link
            to="/home"
            className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Retour à l'accueil"
          >
            <Home size={20} className="text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">Accueil</span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1.5">
          {/* Thème */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title={dark ? 'Mode clair' : 'Mode sombre'}
          >
            {dark ? (
              <Sun size={18} className="text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon size={18} className="text-slate-600 dark:text-slate-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-slate-600 dark:text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                      <Bell size={24} className="mx-auto mb-2 opacity-50" />
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          !notif.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <p className={`text-sm ${!notif.read ? 'font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </button>
                    ))
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="w-full text-xs text-center text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                {getInitials() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
                  {getFullName() || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden md:block" />
            </button>

            {/* Dropdown User Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {getFullName() || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    {getRoleLabel(user?.role)}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to="/admin/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full"
                  >
                    <User size={15} />
                    Mon profil
                  </Link>
                  {isSuperAdmin && (
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full"
                    >
                      <Settings size={15} />
                      Paramètres
                    </Link>
                  )}
                  <hr className="my-1 border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={async () => {
                      await logout();
                      setShowUserMenu(false);
                      navigate('/login');
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                  >
                    <LogOut size={15} />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}