import { useState, useEffect } from 'react';
import { 
  Save, MapPin, Phone, Mail, Globe, Target, Eye, Heart, 
  GraduationCap, Building, FileText, CreditCard, Info, MessageSquare,
  Shield, Lock, Unlock, AlertTriangle, Clock, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../../api/settings';
import Loader from '../../../components/common/Loader';
import api from '../../../api/axios';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  
  // États pour le contrôle d'accès public
  const [publicAccess, setPublicAccess] = useState(null);
  const [lockdownMessage, setLockdownMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [lockdownLoading, setLockdownLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadPublicAccessStatus();
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

  const loadPublicAccessStatus = async () => {
    try {
      const response = await api.get('/settings/public-access');
      const data = response?.data?.data || response?.data;
      setPublicAccess(data?.publicAccess);
      setLockdownMessage(data?.publicAccess?.message || '');
    } catch (error) {
      console.error('Erreur chargement statut public:', error);
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

  // Actions pour le contrôle d'accès public
  const enableLockdown = async () => {
    setLockdownLoading(true);
    try {
      const res = await api.post('/settings/lockdown/enable', { message: lockdownMessage });
      setPublicAccess(res.data.data.publicAccess);
      toast.success(res.data.message);
      setShowMessageInput(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'activation');
    } finally {
      setLockdownLoading(false);
    }
  };

  const disableLockdown = async () => {
    setLockdownLoading(true);
    try {
      const res = await api.post('/settings/lockdown/disable');
      setPublicAccess(res.data.data.publicAccess);
      toast.success(res.data.message);
      setShowMessageInput(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la désactivation');
    } finally {
      setLockdownLoading(false);
    }
  };

  const updateLockdownMessage = async () => {
    setLockdownLoading(true);
    try {
      const res = await api.post('/settings/lockdown/toggle', { message: lockdownMessage });
      setPublicAccess(res.data.data.publicAccess);
      toast.success('Message mis à jour');
      setShowMessageInput(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLockdownLoading(false);
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
    { id: 'public-access', label: ' Accès public', icon: Shield },
    { id: 'about', label: 'À propos', icon: Eye },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'footer', label: 'Pied de page', icon: FileText },
  ];

  if (loading) return <Loader />;
  if (!settings) return null;

  const isLockdown = publicAccess ? !publicAccess.enabled : false;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Paramètres</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez les informations du site et le contrôle d'accès public
          </p>
        </div>
        {activeTab !== 'public-access' && (
          <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
            <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        )}
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

      {/* ==================== ONGLET ACCÈS PUBLIC ==================== */}
      {activeTab === 'public-access' && publicAccess && (
        <div className="space-y-4">
          {/* Carte de statut */}
          <div className={`rounded-2xl border-2 p-6 shadow-card ${
            isLockdown 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`p-3 rounded-full ${
                isLockdown 
                  ? 'bg-red-100 dark:bg-red-900/40' 
                  : 'bg-green-100 dark:bg-green-900/40'
              }`}>
                {isLockdown ? (
                  <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
                ) : (
                  <Unlock className="w-8 h-8 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-bold text-lg ${
                  isLockdown ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                }`}>
                  {isLockdown ? ' MODE LOCKDOWN ACTIF' : ' ACCÈS PUBLIC OUVERT'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {isLockdown 
                    ? 'Seuls les administrateurs connectés peuvent accéder à l\'application'
                    : 'Tous les visiteurs peuvent accéder à l\'espace public (formations, blog, etc.)'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Cartes d'information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <Globe className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Statut actuel</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {isLockdown ? 'Site en maintenance' : 'Site accessible au public'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <Users className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Accès administrateur</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {isLockdown ? 'Réservé aux admins' : 'Accès normal'}
                </p>
              </div>
            </div>
          </div>

          {/* Message personnalisable en lockdown */}
          {isLockdown && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-primary-500" />
                Message de maintenance
              </h2>
              
              <button
                onClick={() => setShowMessageInput(!showMessageInput)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mb-3"
              >
                 {showMessageInput ? 'Annuler' : 'Personnaliser le message'}
              </button>
              
              {showMessageInput && (
                <div className="space-y-3">
                  <textarea
                    value={lockdownMessage}
                    onChange={(e) => setLockdownMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="Message affiché aux utilisateurs bloqués..."
                  />
                  <button
                    onClick={updateLockdownMessage}
                    disabled={lockdownLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {lockdownLoading ? 'Mise à jour...' : 'Mettre à jour le message'}
                  </button>
                </div>
              )}
              
              {!showMessageInput && publicAccess?.message && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Message actuel :</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{publicAccess.message}"</p>
                </div>
              )}
            </div>
          )}

          {/* Dernière modification */}
          {publicAccess?.updatedAt && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pb-2">
              <Clock size={14} />
              <span>Dernière modification : {new Date(publicAccess.updatedAt).toLocaleString()}</span>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="space-y-3">
            {!isLockdown ? (
              <button
                onClick={enableLockdown}
                disabled={lockdownLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                {lockdownLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock size={18} />
                )}
                {lockdownLoading ? 'Activation...' : ' Activer le mode lockdown (bloquer l\'accès public)'}
              </button>
            ) : (
              <button
                onClick={disableLockdown}
                disabled={lockdownLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                {lockdownLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Unlock size={18} />
                )}
                {lockdownLoading ? 'Désactivation...' : ' Désactiver le lockdown (réouvrir l\'accès public)'}
              </button>
            )}
          </div>

          {/* Avertissement */}
          {isLockdown && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-400">
                  <p className="font-semibold"> Attention</p>
                  <p className="mt-1">
                    En mode lockdown, <strong>tous les visiteurs non connectés</strong> seront bloqués 
                    et verront le message ci-dessus. Les administrateurs peuvent toujours accéder à l'application.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== ONGLET À PROPOS ==================== */}
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

      {/* ==================== ONGLET CONTACT ==================== */}
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

      {/* ==================== ONGLET PIED DE PAGE ==================== */}
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