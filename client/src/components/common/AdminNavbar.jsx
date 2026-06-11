import { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, Settings, Moon, Sun, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications (simulées pour l'instant)
  useEffect(() => {
    // Exemple de données - à remplacer par un appel API réel
    const loadNotifications = async () => {
      // Simulation d'appel API
      const mockNotifications = [
        { id: 1, message: 'Nouvelle inscription à "Excel Avancé"', read: false, time: 'il y a 5 min', type: 'enrollment' },
        { id: 2, message: 'Formation "Cybersécurité" complétée', read: false, time: 'il y a 1 heure', type: 'formation' },
        { id: 3, message: 'Attestation générée pour Paul Ndjock', read: true, time: 'il y a 2 heures', type: 'certificate' },
        { id: 4, message: 'Nouvel utilisateur inscrit', read: false, time: 'il y a 3 heures', type: 'user' },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    };
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    // Marquer une notification comme lue
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => prev - 1);
    toast.success('Notification marquée comme lue');
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
    toast.success('Toutes les notifications ont été marquées comme lues');
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    // Redirection selon le type de notification
    switch (notif.type) {
      case 'enrollment':
        window.location.href = '/admin/enrollments';
        break;
      case 'formation':
        window.location.href = '/admin/formations';
        break;
      case 'certificate':
        window.location.href = '/admin/certificates';
        break;
      default:
        break;
    }
    setShowNotifications(false);
  };

  const getInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>

          <Link
            to="/home"
            className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Retour à l'accueil"
          >
            <Home size={20} className="text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">Accueil</span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-slate-600 dark:text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Dropdown Notifications */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">Aucune notification</div>
                    ) : (
                      notifications.map(notif => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 ${
                            !notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
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
                  <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
                    <button className="text-xs text-primary-600 hover:text-primary-700 w-full text-center">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle (clair/sombre) */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={dark ? 'Mode clair' : 'Mode sombre'}
          >
            {dark ? (
              <Sun size={20} className="text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon size={20} className="text-slate-600 dark:text-slate-400" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {getInitials() || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </button>

            {/* Dropdown User Menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full"
                    >
                      <User size={16} />
                      Mon profil
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full"
                    >
                      <Settings size={16} />
                      Paramètres
                    </Link>
                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}