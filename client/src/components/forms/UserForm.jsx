import { useEffect, useState } from 'react';

const ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'super_admin', label: 'Super Administrateur' }
];

export default function UserForm({ initial, onSave, onCancel, divisions = [] }) {
  const [form, setForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    division: '',
    role: 'admin',
    isActive: true
  });

  useEffect(() => {
    if (initial) {
      setForm({
        employeeId: initial.employeeId || '',
        firstName: initial.firstName || '',
        lastName: initial.lastName || '',
        email: initial.email || '',
        phone: initial.phone || '',
        position: initial.position || '',
        division: initial.division || '',
        role: initial.role || 'admin',
        isActive: initial.isActive !== undefined ? initial.isActive : true
      });
    }
  }, [initial]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        {initial ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Matricule <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            required
            className="input-field"
            placeholder="ex: CEN-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="input-field"
            placeholder="prenom.nom@cenadi.cm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
            className="input-field"
            placeholder="Prénom"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
            className="input-field"
            placeholder="Nom"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Téléphone
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="input-field"
            placeholder="+237 6XX XXX XXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Poste
          </label>
          <input
            type="text"
            value={form.position}
            onChange={(e) => handleChange('position', e.target.value)}
            className="input-field"
            placeholder="Chef de projet, Analyste, etc."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Division
          </label>
          <select
            value={form.division}
            onChange={(e) => handleChange('division', e.target.value)}
            className="input-field"
          >
            <option value="">Sélectionner une division</option>
            {divisions.map(div => (
              <option key={div.code || div} value={div.code || div}>
                {div.name || div}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Rôle
          </label>
          <select
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="input-field"
          >
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Compte actif
          </span>
        </label>
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