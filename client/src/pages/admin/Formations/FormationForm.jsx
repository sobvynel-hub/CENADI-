import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';

const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
const STATUSES = [
  { value: 'upcoming', label: 'À venir' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
];

export default function FormationForm({ open, onClose, onSave, initial, divisions = [] }) {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    objectives: '',
    program: '',
    prerequisites: '',
    skillsToAcquire: '',  // ✅ NOUVEAU
    trainer: '',
    trainerBio: '',
    startDate: '',
    endDate: '',
    location: '',
    maxCapacity: 20,
    cost: 0,              // ✅ budget → cost
    targetDivisions: [],
    status: 'upcoming',
    isPublic: true,
    level: 'Débutant',
  });

  const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        slug: initial.slug || '',
        description: initial.description || '',
        objectives: initial.objectives || '',
        program: initial.program || '',
        prerequisites: initial.prerequisites || '',
        skillsToAcquire: initial.skillsToAcquire || '',
        trainer: initial.trainer || '',
        trainerBio: initial.trainerBio || '',
        startDate: initial.startDate ? initial.startDate.split('T')[0] : '',
        endDate: initial.endDate ? initial.endDate.split('T')[0] : '',
        location: initial.location || '',
        maxCapacity: toSafeNumber(initial.maxCapacity ?? initial.capacity, 20),
        cost: toSafeNumber(initial.cost, 0),
        targetDivisions: Array.isArray(initial.targetDivisions) ? initial.targetDivisions : [],
        status: initial.status || 'upcoming',
        isPublic: initial.isPublic !== undefined ? initial.isPublic : true,
        level: initial.level || 'Débutant',
      });
    } else {
      setForm({
        title: '',
        slug: '',
        description: '',
        objectives: '',
        program: '',
        prerequisites: '',
        skillsToAcquire: '',
        trainer: '',
        trainerBio: '',
        startDate: '',
        endDate: '',
        location: '',
        maxCapacity: 20,
        cost: 0,
        targetDivisions: [],
        status: 'upcoming',
        isPublic: true,
        level: 'Débutant',
      });
    }
  }, [initial, open]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleDivisionToggle = (divisionCode) => {
    setForm(prev => ({
      ...prev,
      targetDivisions: prev.targetDivisions.includes(divisionCode)
        ? prev.targetDivisions.filter(d => d !== divisionCode)
        : [...prev.targetDivisions, divisionCode]
    }));
  };

  const generateSlug = () => {
    if (!form.title) return;
    const slug = form.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    handleChange('slug', slug);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.slug && form.title) generateSlug();
    onSave?.(form);
  };

  const safeDivisions = Array.isArray(divisions) ? divisions : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la formation' : 'Nouvelle formation'}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
            Annuler
          </button>
          <button type="submit" form="formationForm" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            Enregistrer
          </button>
        </div>
      }
    >
      <form id="formationForm" onSubmit={handleSubmit} className="space-y-4">
        {/* Informations de base */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => !form.slug && generateSlug()}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            required
          />
        </div>

        {/* Objectifs */}
        <div>
          <label className="block text-sm font-medium mb-1">Objectifs</label>
          <textarea
            value={form.objectives}
            onChange={(e) => handleChange('objectives', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            placeholder="Objectifs pédagogiques de la formation (un par ligne)"
          />
        </div>

        {/* Programme */}
        <div>
          <label className="block text-sm font-medium mb-1">Programme</label>
          <textarea
            value={form.program}
            onChange={(e) => handleChange('program', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            placeholder="Contenu détaillé de la formation (un module par ligne)"
          />
        </div>

        {/* ✅ NOUVEAU : Compétences à acquérir */}
        <div>
          <label className="block text-sm font-medium mb-1">Compétences à acquérir</label>
          <textarea
            value={form.skillsToAcquire}
            onChange={(e) => handleChange('skillsToAcquire', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            placeholder="Décrivez les compétences que les participants pourront acquérir (une par ligne)"
          />
          <p className="text-xs text-slate-400 mt-1">
            Ex: Savoir développer une application React, Maîtriser les API REST, etc.
          </p>
        </div>

        {/* Formateur */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Formateur</label>
            <input
              type="text"
              value={form.trainer}
              onChange={(e) => handleChange('trainer', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              placeholder="Nom du formateur"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio du formateur</label>
            <input
              type="text"
              value={form.trainerBio}
              onChange={(e) => handleChange('trainerBio', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              placeholder="Courte présentation du formateur"
            />
          </div>
        </div>

        {/* Dates et lieu */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date début *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date fin *</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lieu</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              placeholder="Salle, adresse"
            />
          </div>
        </div>

        {/* Capacité, Coût et Niveau */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Capacité maximale</label>
            <input
              type="number"
              min="1"
              value={form.maxCapacity}
              onChange={(e) => handleChange('maxCapacity', toSafeNumber(e.target.value, 0))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
          {/* ✅ MODIFIÉ : "Budget" → "Coût de la formation" */}
          <div>
            <label className="block text-sm font-medium mb-1">Coût de la formation (FCFA)</label>
            <input
              type="number"
              min="0"
              value={form.cost}
              onChange={(e) => handleChange('cost', toSafeNumber(e.target.value, 0))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Niveau</label>
            <select
              value={form.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            >
              {LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Divisions ciblées */}
        {safeDivisions.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Divisions ciblées</label>
            <div className="flex flex-wrap gap-2">
              {safeDivisions.map(div => (
                <button
                  key={div.code || div}
                  type="button"
                  onClick={() => {
                    const code = div.code || div;
                    setForm(prev => ({
                      ...prev,
                      targetDivisions: prev.targetDivisions.includes(code)
                        ? prev.targetDivisions.filter(d => d !== code)
                        : [...prev.targetDivisions, code]
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.targetDivisions.includes(div.code || div)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-green-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-green-900/30'
                  }`}
                >
                  {div.name || div}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Statut et visibilité */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Formation publique (visible par tous)
              </span>
            </label>
          </div>
        </div>

        {/* Prérequis */}
        <div>
          <label className="block text-sm font-medium mb-1">Prérequis (séparés par des virgules)</label>
          <textarea
            value={form.prerequisites}
            onChange={(e) => handleChange('prerequisites', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            placeholder="JavaScript, HTML, CSS, etc."
          />
        </div>
      </form>
    </Modal>
  );
}