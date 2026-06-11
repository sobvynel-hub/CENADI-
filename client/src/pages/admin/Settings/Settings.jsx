import { useState, useEffect } from 'react';
import { 
  Save, MapPin, Phone, Mail, Globe, Target, Eye, Heart, 
  GraduationCap, Building, FileText, CreditCard, Info, MessageSquare 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../../api/settings';
import Loader from '../../../components/common/Loader';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.getSettings();
      const data = response?.data || response;
      setSettings(data);
    } catch (error) {
      console.error('Erreur chargement settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateSettings(settings);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateAbout = (field, value) => {
    setSettings({
      ...settings,
      about: { ...settings.about, [field]: value }
    });
  };

  const updateContact = (field, value) => {
    setSettings({
      ...settings,
      contact: { ...settings.contact, [field]: value }
    });
  };

  const updateFooter = (field, value) => {
    setSettings({
      ...settings,
      footer: { ...settings.footer, [field]: value }
    });
  };

  const tabs = [
    { id: 'about', label: 'À propos', icon: Eye },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'footer', label: 'Pied de page', icon: FileText },
  ];

  if (loading) return <Loader />;
  if (!settings) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Paramètres</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez les informations du site : À propos, Contact et Pied de page
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
          <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Panneau À propos */}
      {activeTab === 'about' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye size={18} className="text-primary-500" />
              Page À propos
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={settings.about?.title || ''}
                  onChange={(e) => updateAbout('title', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description principale
                </label>
                <textarea
                  value={settings.about?.description || ''}
                  onChange={(e) => updateAbout('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Target size={14} /> Mission
                  </label>
                  <textarea
                    value={settings.about?.mission || ''}
                    onChange={(e) => updateAbout('mission', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Eye size={14} /> Vision
                  </label>
                  <textarea
                    value={settings.about?.vision || ''}
                    onChange={(e) => updateAbout('vision', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Heart size={14} /> Valeurs
                  </label>
                  <textarea
                    value={settings.about?.values || ''}
                    onChange={(e) => updateAbout('values', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <GraduationCap size={14} /> Formation continue
                  </label>
                  <textarea
                    value={settings.about?.training || ''}
                    onChange={(e) => updateAbout('training', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panneau Contact */}
      {activeTab === 'contact' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary-500" />
            Informations de contact
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin size={14} /> Adresse
              </label>
              <input
                type="text"
                value={settings.contact?.address || ''}
                onChange={(e) => updateContact('address', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone size={14} /> Téléphone
              </label>
              <input
                type="text"
                value={settings.contact?.phone || ''}
                onChange={(e) => updateContact('phone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                value={settings.contact?.email || ''}
                onChange={(e) => updateContact('email', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Globe size={14} /> Site web
              </label>
              <input
                type="text"
                value={settings.contact?.website || ''}
                onChange={(e) => updateContact('website', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Panneau Pied de page */}
      {activeTab === 'footer' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary-500" />
              Informations du pied de page
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building size={14} /> Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={settings.footer?.companyName || ''}
                  onChange={(e) => updateFooter('companyName', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="CENADI"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MessageSquare size={14} /> Slogan / Tagline
                </label>
                <textarea
                  value={settings.footer?.tagline || ''}
                  onChange={(e) => updateFooter('tagline', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Centre National de Développement Informatique — Plateforme de gestion des formations professionnelles."
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <CreditCard size={14} /> Texte de copyright
                  </label>
                  <input
                    type="text"
                    value={settings.footer?.copyrightText || ''}
                    onChange={(e) => updateFooter('copyrightText', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="Tous droits réservés"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Info size={14} /> Crédit développeur
                  </label>
                  <input
                    type="text"
                    value={settings.footer?.developerCredit || ''}
                    onChange={(e) => updateFooter('developerCredit', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="Développé pour la gestion des formations CENADI"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}