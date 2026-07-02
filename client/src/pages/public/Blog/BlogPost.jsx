import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Eye, User, Tag, Share2, 
  Heart, MessageCircle, Clock, ChevronLeft, 
  ChevronRight, Check, Award, TrendingUp, Lightbulb,
  Building2, Newspaper
} from 'lucide-react';
import { blogApi } from '../../../api/blog';
import Loader from '../../../components/common/Loader';
import { formatDate } from '../../../utils/helpers';
import toast from 'react-hot-toast';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadPost(); }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getBySlug(slug);
      const data = response?.data || response;
      setPost(data);
      setLikesCount(data.likes || 0);
      // Si le backend retourne liked (via le champ likedBy + vérification), on le prend, sinon false
      setLiked(data.liked || false);
    } catch (err) { 
      setError('Article introuvable'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleLike = async () => {
    try {
      const response = await blogApi.like(post._id);
      const data = response?.data || response;
      setLikesCount(data.likes);
      setLiked(data.liked);
      toast.success(data.liked ? 'Vous aimez cet article' : 'Like retiré');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du like');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: `Découvrez cet article : ${post.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Article partagé !');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papiers !');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Erreur lors du partage');
        console.error(error);
      }
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Eye size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Article non trouvé</h1>
          <p className="text-slate-500 mb-6">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link to="/blog" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryGradient = (category) => {
    const gradients = {
      upcoming: 'from-blue-600 to-cyan-600',
      trending: 'from-orange-600 to-red-600',
      feedback: 'from-green-600 to-emerald-600',
      external: 'from-purple-600 to-pink-600',
      suggestion: 'from-amber-600 to-yellow-600',
      news: 'from-cyan-600 to-teal-600'
    };
    return gradients[category] || 'from-primary-600 to-primary-700';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      upcoming: Calendar,
      trending: TrendingUp,
      feedback: MessageCircle,
      external: Building2,
      suggestion: Lightbulb,
      news: Newspaper
    };
    const Icon = icons[category] || Newspaper;
    return <Icon size={18} className="text-current" />;
  };

  const readingTime = Math.ceil((post.content?.length || 0) / 1500);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero avec gradient */}
      <div className={`relative bg-gradient-to-br ${getCategoryGradient(post.category)} pt-16 pb-24`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 mb-6">
            {getCategoryIcon(post.category)}
            <span>{post.categoryLabel || post.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70">
            <div className="flex items-center gap-2"><User size={16} /><span>{post.author}</span></div>
            <div className="flex items-center gap-2"><Calendar size={16} /><span>{formatDate(post.publishedAt || post.createdAt)}</span></div>
            <div className="flex items-center gap-2"><Clock size={16} /><span>{readingTime} min de lecture</span></div>
            <div className="flex items-center gap-2"><Eye size={16} /><span>{post.views || 0} vues</span></div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {post.coverImage && (
            <div className="relative h-64 md:h-96 overflow-hidden">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-6 md:p-10">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
              <Link to="/blog" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors">
                <ChevronLeft size={18} /><span>Tous les articles</span>
              </Link>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleShare} 
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
                  title="Partager l'article"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} className="text-slate-500" />}
                </button>
                <button 
                  onClick={handleLike} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    liked 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-primary-50'
                  }`}
                  title={liked ? 'Retirer le like' : 'Aimer cet article'}
                >
                  <Heart size={18} className={liked ? 'fill-primary-600 text-primary-600' : ''} />
                  <span className="font-medium">{likesCount}</span>
                </button>
              </div>
            </div>
            
            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
              {post.content?.split('\n').map((paragraph, i) => 
                paragraph.startsWith('##') ? (
                  <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('##', '').trim()}</h2>
                ) : paragraph.startsWith('###') ? (
                  <h3 key={i} className="text-xl font-semibold mt-6 mb-3">{paragraph.replace('###', '').trim()}</h3>
                ) : paragraph.trim() ? (
                  <p key={i} className="mb-4">{paragraph}</p>
                ) : null
              )}
            </div>
            
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600">
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">{post.author}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Équipe CENADI Formation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 rounded-2xl p-10 text-white">
          <Award size={32} className="mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-3">Vous souhaitez vous former ?</h3>
          <p className="text-white/80 mb-6">Découvrez notre catalogue de formations et développez vos compétences</p>
          <Link to="/formations" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:shadow-xl transition-all">
            Voir les formations <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}