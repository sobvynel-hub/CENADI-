export default function Select({ label, name, value, onChange, options = [], placeholder = 'Sélectionner...', error, required, disabled, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-field appearance-none ${error ? 'border-red-400' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}