import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Building2, Phone, Briefcase, Calendar, Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { usersApi } from '../../../api/users';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await usersApi.getOne(id);
        
        let userData = null;
        
        if (response?.data?.user) {
          userData = response.data.user;
        } else if (response?.data) {
          userData = response.data;
        } else if (response?.user) {
          userData = response.user;
        } else if (response?._id) {
          userData = response;
        }
        
        if (!userData || !userData._id) {
          throw new Error('Format de données invalide');
        }
        
        setUser(userData);
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError('Personnel non trouvé');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await usersApi.delete(id);
      toast.success('Personnel supprimé avec succès');
      navigate('/admin/users');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await usersApi.update(id, { isActive: !user.isActive });
      setUser({ ...user, isActive: !user.isActive });
      toast.success(user.isActive ? 'Personnel désactivé' : 'Personnel activé');
    } catch (err) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  if (loading) return <Loader fullScreen />;
  
  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error || 'Personnel non trouvé'}</p>
          <Link to="/admin/users" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Retour au personnel
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'Non renseigné';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Non renseigné';
    }
  };

  const firstName = user.firstName || 'Non renseigné';
  const lastName = user.lastName || 'Non renseigné';
  const email = user.email || 'Non renseigné';
  const employeeId = user.employeeId || 'Non défini';
  const division = user.division || 'Non affecté';
  const position = user.position || 'Non renseigné';
  const phone = user.phone || 'Non renseigné';
  const role = user.role || 'employé';
  const isActive = user.isActive !== undefined ? user.isActive : true;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <Link 
          to="/admin/users" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 font-medium transition-colors"
        >
          <ArrowLeft size={15} /> Retour au personnel
        </Link>
        
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              }`}
            >
              {isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
              {isActive ? 'Désactiver' : 'Activer'}
            </button>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  {firstName} {lastName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    <Shield size={12} />
                    {role === 'super_admin' ? 'Super Administrateur' : role === 'admin' ? 'Administrateur' : 'Personnel'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white break-all">{email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Briefcase size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Matricule</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{employeeId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building2 size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Division</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{division}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Briefcase size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Poste</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{position}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Téléphone</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Date d'inscription</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-card">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-3">
              Statistiques
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Dernière connexion</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                  {formatDate(user.lastLogin)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">ID technique</span>
                <span className="text-xs font-mono text-slate-400 break-all">{user._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="Confirmer la suppression" 
        size="md"
        footer={
          <>
            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={handleDelete} className="btn-danger">Supprimer</button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Êtes-vous sûr de vouloir supprimer le personnel <strong className="font-semibold">"{firstName} {lastName}"</strong> ?
        </p>
        <p className="text-slate-500 text-sm mt-2">
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}