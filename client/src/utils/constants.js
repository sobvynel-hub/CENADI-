export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// ✅ CORRIGÉ BUG #4 : aligné avec le backend
export const FORMATION_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const FORMATION_STATUS_LABELS = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const FORMATION_STATUS_COLORS = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ongoing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  completed: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const ENROLLMENT_STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  rejected: 'Refusé',
  cancelled: 'Annulé',
};

export const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

export const NAV_LINKS = [
  { label: 'Accueil', path: '/' },
  { label: 'Formations', path: '/formations' },
  { label: 'À propos', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const ADMIN_NAV = [
  { label: 'Tableau de bord', path: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Formations', path: '/admin/formations', icon: 'BookOpen' },
  { label: 'Inscriptions', path: '/admin/enrollments', icon: 'UserCheck' },
  { label: 'Présences', path: '/admin/attendances', icon: 'ClipboardCheck' },
  { label: 'Attestations', path: '/admin/certificates', icon: 'Award' },
  { label: 'Employés', path: '/admin/users', icon: 'Users' },
  { label: 'Divisions', path: '/admin/divisions', icon: 'Building2' },
  { label: 'Recherche', path: '/admin/search', icon: 'Search' },
  { label: 'Statistiques', path: '/admin/statistics', icon: 'BarChart2' },
];

export const SUPER_ADMIN_NAV = [
  { label: 'Administrateurs', path: '/admin/admins', icon: 'ShieldCheck' },
  { label: 'Paramètres', path: '/admin/settings', icon: 'Settings' },
];

// ✅ AJOUT OBLIGATOIRE (utilisé par helpers.js)
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};