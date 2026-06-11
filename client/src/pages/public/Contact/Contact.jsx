import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Globe, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api';
import { settingsApi } from '../../../api/settings';
import Loader from '../../../components/common/Loader';

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Message envoyé avec succès !');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const contact = settings?.contact || {};
  const contactInfo = [
    { icon: MapPin, label: 'Adresse', value: contact.address || 'BP 13011, Yaoundé, Cameroun' },
    { icon: Phone, label: 'Téléphone', value: contact.phone || '+237 222 20 68 60' },
    { icon: Mail, label: 'Email', value: contact.email || 'contact@cenadi.cm' },
    { icon: Globe, label: 'Site web', value: contact.website || 'www.cenadi.cm' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">Contactez-nous</h1>
        <p className="text-slate-500 dark:text-slate-400">Une question ? Nous sommes à votre disposition.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {contactInfo.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-4 shadow-card">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nom complet <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Jean Dupont" required className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="jean@exemple.cm" required className="input-field" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sujet</label>
            <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="Objet de votre message" className="input-field" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message <span className="text-red-500">*</span></label>
            <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="Votre message..." required rows={5} className="input-field resize-none" />
          </div>
          
          <button type="submit" disabled={sending} className="w-full btn-primary justify-center">
            {sending ? (<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />) : (<Send size={16} />)}
            {sending ? 'Envoi...' : 'Envoyer le message'}
          </button>
        </form>
      </div>
    </div>
  );
}