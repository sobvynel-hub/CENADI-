import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Toast({ open = false, type = 'success', message = '', onClose = () => {} }) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const styles = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-amber-500',
    info: 'bg-sky-600',
  };

  const bg = styles[type] || 'bg-slate-900';

  return (
    <div className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl shadow-2xl text-white ${bg} ring-1 ring-black/10 animate-in slide-in-from-right`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm leading-5">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}