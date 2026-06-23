import { PAGINATION } from './constants';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

/* ─── Formatage des dates ─── */
export const formatDate = (dateStr, fmt = 'dd MMM yyyy') => {
  if (!dateStr) return '—';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (!isValid(date)) return '—';
    return format(date, fmt, { locale: fr });
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateStr) => formatDate(dateStr, 'dd MMM yyyy, HH:mm');

/* ─── Export CSV ─── */
export const exportCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) => Object.values(row).map((v) => `"${v ?? ''}"`).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ─── Status helpers ─── */
export const getStatusColor = (status) => {
  const colors = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ongoing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    completed: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
};

export const getStatusLabel = (status) => {
  const labels = {
    upcoming: 'À venir',
    ongoing: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
    published: 'Publié',
    draft: 'Brouillon',
    pending: 'En attente',
    confirmed: 'Confirmé',
    approved: 'Approuvé',
    rejected: 'Refusé',
  };
  return labels[status] || status;
};

/* ─── Utilitaires généraux ─── */
export const truncate = (str, n = 60) => (str?.length > n ? str.slice(0, n) + '…' : str);

export const initials = (firstName, lastName) => {
  if (!firstName && !lastName) return '?';
  return `${(firstName?.charAt(0) || '')}${(lastName?.charAt(0) || '')}`.toUpperCase();
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

// ✅ Ajout de getRoleLabel pour l'affichage
export const getRoleLabel = (role) => {
  const labels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    employee: 'Personnel',
    user: 'Visiteur',
  };
  return labels[role] || role;
};