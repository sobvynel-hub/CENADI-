import { Link } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldX size={36} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-3">Accès refusé</h1>
        <p className="text-slate-500 mb-6">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link to="/" className="btn-primary">
          <Home size={16} /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}