import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { settingsApi } from '../../api/settings';

export default function Footer() {
  const [settings, setSettings] = useState({
    footer: {
      companyName: 'CENADI',
      tagline: 'Centre National de Développement Informatique — Plateforme de gestion des formations professionnelles.',
      copyrightText: 'Tous droits réservés',
      developerCredit: 'Développé pour la gestion des formations CENADI',
      socialLinks: {}
    },
    contact: {
      address: 'BP 13011, Yaoundé, Cameroun',
      phone: '+237 222 20 68 60',
      email: 'contact@cenadi.cm',
      website: 'www.cenadi.cm'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      const settingsData = data?.data || data;
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres footer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <footer className="bg-slate-900 dark:bg-dark-surface text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </footer>
    );
  }

  const { footer, contact } = settings;

  return (
    <footer className="bg-slate-900 dark:bg-dark-surface text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand avec logo */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/logo.png" 
                alt={footer?.companyName || 'CENADI'} 
                className="h-10 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="font-display font-bold text-white text-lg">
                {footer?.companyName || 'CENADI'}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              {footer?.tagline || 'Centre National de Développement Informatique — Plateforme de gestion des formations professionnelles.'}
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm hover:text-primary-400 transition-colors">Accueil</Link></li>
              <li><Link to="/formations" className="text-sm hover:text-primary-400 transition-colors">Formations</Link></li>
              <li><Link to="/about" className="text-sm hover:text-primary-400 transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>{contact?.address || 'BP 13011, Yaoundé, Cameroun'}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone size={15} className="text-primary-400 flex-shrink-0" />
                <span>{contact?.phone || '+237 222 20 68 60'}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail size={15} className="text-primary-400 flex-shrink-0" />
                <a href={`mailto:${contact?.email || 'contact@cenadi.cm'}`} className="hover:text-primary-400 transition-colors">
                  {contact?.email || 'contact@cenadi.cm'}
                </a>
              </li>
              {contact?.website && (
                <li className="flex items-center gap-2.5 text-sm">
                  <Globe size={15} className="text-primary-400 flex-shrink-0" />
                  <a href={`https://${contact.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                    {contact.website}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {footer?.companyName || 'CENADI'} – {footer?.copyrightText || 'Tous droits réservés'}
          </p>
          <p className="text-xs text-slate-500">
            {footer?.developerCredit || 'Développé pour la gestion des formations CENADI'}
          </p>
        </div>
      </div>
    </footer>
  );
}