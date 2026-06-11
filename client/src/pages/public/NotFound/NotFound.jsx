import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-8xl font-display font-black text-primary-100 mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-3">Page introuvable</h1>
        <p className="text-slate-500 mb-6">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn-primary">
          <Home size={16} /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}