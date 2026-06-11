import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Building2, Eye, EyeOff, ArrowLeft, Phone } from 'lucide-react';
import { authApi } from '../../../api/auth';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

// ✅ Divisions officielles du CENADI
const OFFICIAL_DIVISIONS = [
  { value: 'DAAF', label: 'DAAF - Division des Affaires Administratives et Financières' },
  { value: 'DEL', label: 'DEL - Division de l\'Exploitation et des Logiciels' },
  { value: 'DEP', label: 'DEP - Division des Etudes et des Projets' },
  { value: 'DIRE', label: 'DIRE - Division de l\'Informatique appliquée à la Recherche et à l\'Enseignement' },
  { value: 'DSI', label: 'DSI - Division du Système d\'Information (MINFI)' },
  { value: 'DTB', label: 'DTB - Division de la Télématique et de la Bureautique' },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Ajout du hook useAuth
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    division: '',
    phone: '',
    position: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    } else if (!formData.email.endsWith('@cenadi.cm') && !formData.email.endsWith('@minfi.cm')) {
      newErrors.email = 'Veuillez utiliser votre email professionnel (@cenadi.cm ou @minfi.cm)';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.division) {
      newErrors.division = 'Veuillez sélectionner votre division';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        division: formData.division,
        phone: formData.phone || '',
        position: formData.position || 'Employé',
      };

      console.log('📝 Envoi des données:', { ...userData, password: '***' });

      // 1. Créer le compte
      await authApi.register(userData);

      toast.success('Compte créé avec succès ! Connexion en cours...');

      // 2. Connecter automatiquement l'utilisateur
      await login(formData.email, formData.password);

      // 3. Rediriger vers la page d'accueil
      navigate('/home', { replace: true });

    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);

      let message = 'Erreur lors de la création du compte';

      if (error.message) {
        message = error.message;
      }

      if (error.data?.message?.includes('existe déjà') || error.message?.includes('existe déjà')) {
        message = 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.';
        setErrors({ ...errors, email: message });
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors font-medium">
          <ArrowLeft size={15} />
          Retour à la connexion
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg mb-3">
              <UserPlus size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Créer un compte</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Inscrivez-vous pour accéder aux formations CENADI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    placeholder="Jean"
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500`}
                    placeholder="Dupont"
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email professionnel *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500`}
                  placeholder="jean.dupont@cenadi.cm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              <p className="text-xs text-slate-400 mt-1">Utilisez votre email professionnel (@cenadi.cm ou @minfi.cm)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Division / Service *</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border ${errors.division ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500`}
                >
                  <option value="">Sélectionnez votre division</option>
                  {OFFICIAL_DIVISIONS.map(div => (
                    <option key={div.value} value={div.value}>{div.label}</option>
                  ))}
                </select>
              </div>
              {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Poste</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  autoComplete="organization-title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Développeur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mot de passe *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-10 py-2 rounded-lg border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-xs text-slate-400 mt-1">Minimum 6 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmer le mot de passe *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-10 py-2 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400">
                J'accepte les conditions générales et la politique de confidentialité
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}