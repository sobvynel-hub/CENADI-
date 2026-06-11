// client/src/components/blog/BlogPostForm.jsx
import { useState } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'news', label: '📰 Actualité' },
  { value: 'upcoming', label: '📅 À venir' },
  { value: 'trending', label: '🔥 En tendance' },
  { value: 'feedback', label: '💬 Retours expérience' },
  { value: 'external', label: '🏛️ Externe' },
  { value: 'suggestion', label: '💡 Suggestion' },
];

export default function BlogPostForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    content: initial?.content || '',
    excerpt: initial?.excerpt || '',
    category: initial?.category || 'news',
    tags: initial?.tags?.join(', ') || '',
    status: initial?.status || 'draft',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      await onSave(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Titre *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Résumé</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
          placeholder="Résumé de l'article (optionnel)"
        />
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
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            placeholder="IA, formation, tendance (séparés par des virgules)"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Contenu *</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={10}
          className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 font-mono text-sm"
          required
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}