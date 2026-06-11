// Loader.jsx
export function Loader({ fullScreen = false, text = 'Chargement...' }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
      </div>
      {text && <p className="text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {inner}
      </div>
    );
  }
  return <div className="flex items-center justify-center py-16">{inner}</div>;
}

export default Loader;