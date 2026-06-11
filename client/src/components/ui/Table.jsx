export default function Table({ columns, data, onRowClick, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-100 dark:border-slate-800 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}