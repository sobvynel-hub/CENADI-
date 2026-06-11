import { useEffect, useState } from 'react';

export default function DivisionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    budget: '',
    description: ''
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        code: initial.code || '',
        budget: initial.budget || '',
        description: initial.description || ''
      });
    }
  }, [initial]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        {initial ? 'Modifier la division' : 'Nouvelle division'}
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nom de la division <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="input-field"
            placeholder="ex: Direction des Systèmes d'Information"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            required
            className="input-field"
            placeholder="ex: DSI"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Budget annuel (FCFA)
          </label>
          <input
            type="number"
            value={form.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            className="input-field"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="input-field"
            placeholder="Description optionnelle"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          Enregistrer
        </button>
      </div>
    </form>
  );
}