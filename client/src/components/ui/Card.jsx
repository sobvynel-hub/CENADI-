export default function Card({ children, className = '', hover = true, padding = true }) {
  const baseClasses = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-card-hover' : '';
  const paddingClasses = padding ? 'p-5' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
}