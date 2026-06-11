import { useState } from 'react';
import { Lightbulb, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { suggestionsApi } from '../../../api/suggestions';

const CATEGORY_OPTIONS = [
  { value: 'technical', label: 'Technique' },
  { value: 'soft_skills', label: 'Soft skills' },
  { value: 'management', label: 'Management' },
  { value: 'language', label: 'Langues' },
  { value: 'other', label: 'Autre' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'urgent', label: 'Urgente' },
];

export default function SuggestionForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    reason: '',
    expectedBenefits: '',
    targetAudience: '',
    category: 'technical',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error('Veuillez saisir un titre');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Veuillez décrire la suggestion');
      return;
    }
    if (!form.reason.trim()) {
      toast.error('Veuillez expliquer la raison');
      return;
    }
    
    setSubmitting(true);
    try {
      await suggestionsApi.create(form);
      toast.success('Suggestion envoyée avec succès !');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Lightbulb size={24} className="text-primary-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Proposer une formation</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Titre de la formation *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              placeholder="Ex: Formation Kubernetes avancé"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              placeholder="Décrivez la formation que vous souhaitez..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Pourquoi cette formation ? *</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              placeholder="Expliquez pourquoi cette formation serait bénéfique..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bénéfices attendus</label>
              <textarea
                value={form.expectedBenefits}
                onChange={(e) => setForm({ ...form, expectedBenefits: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                placeholder="Quels bénéfices pour l'équipe ?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Public cible</label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                placeholder="Qui devrait suivre cette formation ?"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Priorité</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 Votre suggestion sera examinée par l'équipe administrative. 
              Les meilleures idées pourront être publiées sur notre blog et intégrées au catalogue.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Send size={15} />
              {submitting ? 'Envoi...' : 'Envoyer la suggestion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}