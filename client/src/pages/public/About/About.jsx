import { useState, useEffect } from 'react';
import { settingsApi } from '../../../api/settings';
import Loader from '../../../components/common/Loader';

export default function About() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getSettings();
        const data = response?.data || response;
        setSettings(data);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  if (loading) return <Loader fullScreen />;

  const about = settings?.about || {};
  const items = about.mission && about.vision && about.values && about.training ? [
    { title: 'Notre Mission', text: about.mission, icon: '🎯' },
    { title: 'Notre Vision', text: about.vision, icon: '👁️' },
    { title: 'Nos Valeurs', text: about.values, icon: '❤️' },
    { title: 'Formation Continue', text: about.training, icon: '🎓' },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
          {about.title || 'À propos de CENADI'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {about.description || 'Le Centre National de Développement Informatique (CENADI) est un établissement public camerounais chargé de la conception et de la mise en œuvre de la politique informatique de l\'État.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {items.map(({ title, text }) => (
          <div key={title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}