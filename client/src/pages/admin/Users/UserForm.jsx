import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';

export default function UserForm({ open, onClose, onSave, initial, divisions = [] }) {
  const [form, setForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    division: '',
    role: '',
    phone: '',
    position: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        employeeId: initial.employeeId || '',
        firstName: initial.firstName || '',
        lastName: initial.lastName || '',
        email: initial.email || '',
        password: '',
        division: initial.division || '',
        role: initial.role || '',
        phone: initial.phone || '',
        position: initial.position || '',
        isActive: initial.isActive !== undefined ? initial.isActive : true,
      });
    } else {
      setForm({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        division: '',
        role: '',
        phone: '',
        position: '',
        isActive: true,
      });
    }
    setError('');
  }, [initial, open]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.employeeId) {
      setError('Le matricule est requis');
      return;
    }
    if (!form.firstName) {
      setError('Le prénom est requis');
      return;
    }
    if (!form.lastName) {
      setError('Le nom est requis');
      return;
    }
    if (!form.email) {
      setError('L\'email est requis');
      return;
    }
    
    setLoading(true);
    try {
      if (!initial && !form.password) {
        setError('Le mot de passe est requis pour un nouveau personnel');
        setLoading(false);
        return;
      }
      
      const submitData = { ...form };
      if (!submitData.password) delete submitData.password;
      if (!submitData.role) delete submitData.role;
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const safeDivisions = Array.isArray(divisions) ? divisions : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier le personnel' : 'Nouveau personnel'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
            Annuler
          </button>
          <button type="submit" form="userForm" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      }
    >
      <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Matricule *</label>
            <input
              type="text"
              value={form.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="CEN-XXX"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="prenom.nom@cenadi.cm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prénom *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="+237 6XX XXX XXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Poste</label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Développeur, Analyste, etc."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Division</label>
            <select
              value={form.division}
              onChange={(e) => handleChange('division', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Sélectionner une division</option>
              {safeDivisions.map(div => (
                <option key={div._id || div.code} value={div.name || div}>
                  {div.name || div}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rôle</label>
            <select
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Personnel (pas d'accès admin)</option>
              <option value="admin">Administrateur</option>
              <option value="super_admin">Super Administrateur</option>
            </select>
          </div>
        </div>

        {!initial && (
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="8 caractères minimum"
              required={!initial}
            />
            <p className="text-xs text-slate-400 mt-1">Minimum 8 caractères, dont 1 majuscule et 1 chiffre</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm">Compte actif</label>
        </div>
      </form>
    </Modal>
  );
}