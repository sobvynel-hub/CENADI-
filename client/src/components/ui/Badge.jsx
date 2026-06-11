export function Badge({ status, label, color, children }) {
  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      ongoing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  const getStatusLabel = (status) => {
    const labels = {
      upcoming: 'À venir',
      ongoing: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      pending: 'En attente',
      confirmed: 'Confirmé',
      rejected: 'Refusé',
      approved: 'Approuvé',
    };
    return labels[status] || status;
  };

  const cls = color || getStatusColor(status);
  const text = label || (status ? getStatusLabel(status) : children);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {text}
    </span>
  );
}

export default Badge;