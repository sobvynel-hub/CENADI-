export default function Input({ label, name, type = 'text', value, onChange, onBlur, error, placeholder, required, disabled, className = '', icon }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-300 focus:border-red-400' : ''} ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1">{error}</p>}
    </div>
  );
}