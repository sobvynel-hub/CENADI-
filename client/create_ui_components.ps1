$files = @{
    # UI Components
    "Card.jsx" = @"
export default function Card({ children, className = '', hoverable = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 `$(hoverable ? 'hover:shadow-lg transition-shadow' : '') $ `$className`}
      {...props}
    >
      {children}
    </div>
  );
}
"@
    
    "Input.jsx" = @"
export default function Input({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  icon: Icon,
  ...props 
}) {
  return (
    <div className='mb-4'>
      {label && <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>}
      <div className='relative'>
        {Icon && <Icon className='absolute left-3 top-3 text-gray-400' size={20} />}
        <input
          type={type}
          className={`w-full px-4 py-2 `$(Icon ? 'pl-10' : '') $ `border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none `$(error ? 'border-red-500' : 'border-gray-300') $ `$className`}
          {...props}
        />
      </div>
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
}
"@

    "Badge.jsx" = @"
export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-green-100 text-green-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium `$variants[variant] $ `$className`}>
      {children}
    </span>
  );
}
"@

    "SearchBar.jsx" = @"
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Rechercher...', className = '' }) {
  const [value, setValue] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative `$className`}>
      <input
        type='text'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none'
      />
      <Search className='absolute left-3 top-2.5 text-gray-400' size={20} />
    </form>
  );
}
"@

    "Pagination.jsx" = @"
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ current = 1, total = 1, onChange }) {
  const pages = Math.ceil(total / 10);
  
  if (pages <= 1) return null;
  
  return (
    <div className='flex items-center justify-center gap-2 mt-6'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
      >
        <ChevronLeft size={18} />
      </Button>
      
      {Array.from({ length: pages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`px-3 py-2 rounded-lg font-medium transition `$(current === page ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200')`}
        >
          {page}
        </button>
      ))}
      
      <Button
        variant='outline'
        size='sm'
        onClick={() => onChange(current + 1)}
        disabled={current === pages}
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}
"@

    "RatingStars.jsx" = @"
import { Star } from 'lucide-react';
import { useState } from 'react';

export default function RatingStars({ value = 0, onChange, disabled = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  
  const sizeClasses = { sm: 16, md: 20, lg: 24 };
  const sz = sizeClasses[size];
  
  return (
    <div className='flex gap-1'>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => !disabled && onChange?.(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`transition `$(disabled ? 'cursor-not-allowed' : 'cursor-pointer')`}
          disabled={disabled}
        >
          <Star
            size={sz}
            className={`transition `$(star <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')`}
          />
        </button>
      ))}
    </div>
  );
}
"@

    "Tabs.jsx" = @"
import { useState } from 'react';

export default function Tabs({ tabs, defaultTab = 0 }) {
  const [active, setActive] = useState(defaultTab);
  
  return (
    <div>
      <div className='flex border-b border-gray-200'>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 font-medium border-b-2 transition `$(active === i ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-900')`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className='mt-4'>
        {tabs[active].content}
      </div>
    </div>
  );
}
"@

    "Select.jsx" = @"
export default function Select({ label, options = [], error, className = '', ...props }) {
  return (
    <div className='mb-4'>
      {label && <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>}
      <select
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none `$(error ? 'border-red-500' : 'border-gray-300') $ `$className`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
}
"@

    "Table.jsx" = @"
export default function Table({ columns, data, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 `$className`}>
      <table className='w-full'>
        <thead className='bg-gray-50 border-b border-gray-200'>
          <tr>
            {columns.map(col => (
              <th key={col.key} className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase'>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className='border-b border-gray-200 hover:bg-gray-50'>
              {columns.map(col => (
                <td key={col.key} className='px-6 py-4 text-sm text-gray-700'>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
"@
}

# Create all files
$basePath = "c:\Users\LEADER INFORMATIQUE\gestion-formation-cenadi\client\src\components\ui"

foreach ($file in $files.GetEnumerator()) {
    $path = Join-Path $basePath $file.Key
    Set-Content -Path $path -Value $file.Value -Encoding UTF8
    Write-Host "Created: $($file.Key)"
}

Write-Host "Completed: All UI components created!"
