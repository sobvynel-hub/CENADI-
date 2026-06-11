export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  type = 'button', 
  className = '', 
  icon: Icon,
  loading = false,
  ...props 
}) {
  const baseClasses = 'font-semibold rounded-lg transition duration-200 inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-200',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 active:bg-green-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-600',
    ghost: 'text-green-600 hover:bg-green-50 active:bg-green-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {loading ? <span className="inline-block animate-spin">⟳</span> : children}
    </button>
  );
}