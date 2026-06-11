import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

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
    trainer: '',
    trainerBio: '',
    startDate: '',
    endDate: '',
    location: '',
    maxCapacity: 20,
    targetDivisions: [],
    status: 'upcoming',
    isPublic: true,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        slug: initial.slug || '',
        description: initial.description || '',
        objectives: initial.objectives || '',
        program: initial.program || '',
        prerequisites: initial.prerequisites || '',
        trainer: initial.trainer || '',
        trainerBio: initial.trainerBio || '',
        startDate: initial.startDate ? initial.startDate.split('T')[0] : '',
        endDate: initial.endDate ? initial.endDate.split('T')[0] : '',
        location: initial.location || '',
        maxCapacity: initial.maxCapacity || initial.capacity || 20,
        targetDivisions: initial.targetDivisions || [],
        status: initial.status || 'upcoming',
        isPublic: initial.isPublic !== undefined ? initial.isPublic : true,
      });
    } else {
      setForm({
        title: '',
        slug: '',
        description: '',
        objectives: '',
        program: '',
        prerequisites: '',
        trainer: '',
        trainerBio: '',
        startDate: '',
        endDate: '',
        location: '',
        maxCapacity: 20,
        targetDivisions: [],
        status: 'upcoming',
        isPublic: true,
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
      size="xl"
    >
      <form id="formation-edit-form" onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
        {/* Informations de base */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => !form.slug && generateSlug()}
              required
              className="input-field"
              placeholder="Titre de la formation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Slug (URL)
            </label>
            <input
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="input-field"
              placeholder="titre-de-la-formation"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="input-field resize-none"
            required
            placeholder="Brève description de la formation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Objectifs
          </label>
          <textarea
            value={form.objectives}
            onChange={(e) => handleChange('objectives', e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="Objectifs pédagogiques de la formation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Programme
          </label>
          <textarea
            value={form.program}
            onChange={(e) => handleChange('program', e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Contenu détaillé de la formation"
          />
        </div>

        {/* Formateur */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Formateur <span className="text-red-500">*</span>
            </label>
            <input
              value={form.trainer}
              onChange={(e) => handleChange('trainer', e.target.value)}
              required
              className="input-field"
              placeholder="Nom du formateur"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Bio du formateur
            </label>
            <input
              value={form.trainerBio}
              onChange={(e) => handleChange('trainerBio', e.target.value)}
              className="input-field"
              placeholder="Courte présentation du formateur"
            />
          </div>
        </div>

        {/* Dates et lieu */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date de début <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date de fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Lieu <span className="text-red-500">*</span>
            </label>
            <input
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
              className="input-field"
              placeholder="Salle, adresse"
            />
          </div>
        </div>

        {/* Capacité et niveau */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Capacité maximale
            </label>
            <input
              type="number"
              min="1"
              value={form.maxCapacity}
              onChange={(e) => handleChange('maxCapacity', Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Niveau
            </label>
            <select
              value={form.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className="input-field"
            >
              {LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Divisions ciblées */}
        {divisions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Divisions ciblées
            </label>
            <div className="flex flex-wrap gap-2">
              {divisions.map(div => (
                <button
                  key={div.code || div}
                  type="button"
                  onClick={() => handleDivisionToggle(div.code || div)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.targetDivisions.includes(div.code || div)
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-primary-100'
                  }`}
                >
                  {div.name || div}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Statut et visibilité */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Statut
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="input-field"
            >
              {STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Formation publique (visible par tous)
              </span>
            </label>
          </div>
        </div>

        {/* Prérequis */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Prérequis
          </label>
          <textarea
            value={form.prerequisites}
            onChange={(e) => handleChange('prerequisites', e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="Prérequis nécessaires pour suivre la formation"
          />
        </div>
      </form>
    </Modal>
  );
}