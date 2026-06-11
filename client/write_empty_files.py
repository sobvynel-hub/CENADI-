from pathlib import Path
files = {
    'src/components/common/Toast.jsx': '''import { useEffect } from 'react';

export default function Toast({ open = false, type = 'success', message = '', onClose = () => {} }) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const bg = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-amber-500',
    info: 'bg-sky-600',
  }[type] || 'bg-slate-900';

  return (
    <div className={`fixed right-4 top-4 z-50 max-w-sm rounded-3xl shadow-2xl text-white ${bg} ring-1 ring-black/10`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm leading-5">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white transition"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  );
}
''',
    'src/components/forms/FormationForm.jsx': '''import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
const STATUSES = ['draft', 'published', 'ongoing', 'completed', 'cancelled'];
const DIVISIONS = ['DSI', 'RH', 'Finance', 'Marketing'];

export default function FormationForm({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    capacity: 20,
    level: 'Débutant',
    trainer: '',
    division: 'DSI',
    category: 'Bureautique',
    location: '',
    status: 'draft',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        startDate: initial.startDate || '',
        endDate: initial.endDate || '',
        capacity: initial.capacity || 20,
        level: initial.level || 'Débutant',
        trainer: initial.trainer || '',
        division: initial.division || 'DSI',
        category: initial.category || 'Bureautique',
        location: initial.location || '',
        status: initial.status || 'draft',
      });
    } else {
      setForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        capacity: 20,
        level: 'Débutant',
        trainer: '',
        division: 'DSI',
        category: 'Bureautique',
        location: '',
        status: 'draft',
      });
    }
  }, [initial, open]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la formation' : 'Nouvelle formation'}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Annuler</button>
          <button type="submit" form="formation-edit-form" className="btn-primary text-sm">Enregistrer</button>
        </>
      }
      size="lg"
    >
      <form id="formation-edit-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Titre</span>
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="input-field mt-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Formateur</span>
            <input
              value={form.trainer}
              onChange={(e) => handleChange('trainer', e.target.value)}
              required
              className="input-field mt-2"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="input-field mt-2 resize-none"
            required
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Date de début</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              required
              className="input-field mt-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Date de fin</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              required
              className="input-field mt-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Capacité</span>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => handleChange('capacity', Number(e.target.value))}
              className="input-field mt-2"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Niveau</span>
            <select
              value={form.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className="input-field mt-2"
            >
              {LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Division</span>
            <select
              value={form.division}
              onChange={(e) => handleChange('division', e.target.value)}
              className="input-field mt-2"
            >
              {DIVISIONS.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Statut</span>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="input-field mt-2"
            >
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Catégorie</span>
            <input
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="input-field mt-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Lieu</span>
            <input
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="input-field mt-2"
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}
''',
    'src/components/forms/UserForm.jsx': '''import { useEffect, useState } from 'react';

const ROLES = ['user', 'admin', 'super_admin'];
const DIVISIONS = ['DSI', 'RH', 'Finance', 'Marketing'];

export default function UserForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'user', division: 'DSI' });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        email: initial.email || '',
        phone: initial.phone || '',
        role: initial.role || 'user',
        division: initial.division || 'DSI',
      });
    }
  }, [initial]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{initial ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nom complet</span>
          <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required className="input-field mt-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required className="input-field mt-2" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Téléphone</span>
          <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="input-field mt-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Rôle</span>
          <select value={form.role} onChange={(e) => handleChange('role', e.target.value)} className="input-field mt-2">
            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Division</span>
        <select value={form.division} onChange={(e) => handleChange('division', e.target.value)} className="input-field mt-2">
          {DIVISIONS.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="submit" className="btn-primary">Enregistrer</button>
      </div>
    </form>
  );
}
''',
    'src/components/forms/DivisionForm.jsx': '''import { useEffect, useState } from 'react';

export default function DivisionForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (initial) setName(initial.name || '');
  }, [initial]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{initial ? 'Modifier la division' : 'Nouvelle division'}</h2>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Nom de la division</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-field mt-2" />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="submit" className="btn-primary">Enregistrer</button>
      </div>
    </form>
  );
}
''',
    'src/components/common/Footer.css': '''.footer-container {
  display: grid;
  gap: 1.5rem;
  padding: 2rem;
}
''',
    'src/components/common/Layout.css': '''.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
''',
    'src/components/common/Loader.css': '''.loader-ring {
  width: 3rem;
  height: 3rem;
  border: 0.4rem solid rgba(22, 163, 74, 0.2);
  border-top-color: #16a34a;
  border-radius: 9999px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
''',
    'src/components/common/Modal.css': '''.modal-backdrop {
  background: rgba(15, 23, 42, 0.55);
}
''',
    'src/components/common/Navbar.css': '''.navbar-container {
  background-color: #ffffff;
}
''',
    'src/components/common/Toast.css': '''.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
}
''',
    'src/components/forms/FormationForm.css': '''.formation-form label {
  display: block;
  margin-bottom: 0.75rem;
}
''',
    'src/components/ui/Badge.css': '''.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
''',
    'src/components/ui/Button.css': '''.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
''',
    'src/components/ui/Card.css': '''.card {
  border-radius: 1rem;
}
''',
    'src/components/ui/Input.css': '''.input {
  width: 100%;
}
''',
    'src/components/ui/Pagination.css': '''.pagination {
  display: flex;
  gap: 0.5rem;
}
''',
    'src/components/ui/SearchBar.css': '''.search-bar {
  width: 100%;
}
''',
    'src/pages/public/Contact/Contact.css': '''.contact-page {
  min-height: 70vh;
}
''',
    'src/pages/public/Forbidden/Forbidden.css': '''.forbidden-container {
  min-height: 70vh;
}
''',
    'src/pages/public/FormationDetail/FormationDetail.css': '''.formation-detail {
  min-height: 70vh;
}
''',
    'src/pages/public/Home/Home.css': '''.home-page {
  min-height: 70vh;
}
''',
    'src/pages/public/Login/Login.css': '''.login-page {
  min-height: 70vh;
}
''',
    'src/pages/public/NotFound/NotFound.css': '''.notfound-page {
  min-height: 70vh;
}
'''
}

for relative_path, content in files.items():
    path = Path(relative_path)
    path.write_text(content, encoding='utf-8')
    print(f'Wrote {relative_path}')
''