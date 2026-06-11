import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPage, total, perPage }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-slate-500">
        Affichage <span className="font-semibold text-slate-700">{start}–{end}</span> sur <span className="font-semibold text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
              p === page
                ? 'bg-primary-600 text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}