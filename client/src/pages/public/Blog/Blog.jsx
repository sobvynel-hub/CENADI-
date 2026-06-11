import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Newspaper, Search, Filter, Calendar, TrendingUp, Award, 
  Briefcase, Lightbulb, Globe, ChevronRight, Sparkles, 
  Clock, Eye, ThumbsUp, BookOpen, Target, Zap, 
  Users, Building2, MessageCircle, Star, Rocket, Heart
} from 'lucide-react';
import { blogApi } from '../../../api/blog';
import Loader from '../../../components/common/Loader';

const CATEGORIES = [
  { id: 'all', name: 'Tous', icon: Newspaper, color: 'bg-slate-500' },
  { id: 'trending', name: 'Tendances', icon: TrendingUp, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
  { id: 'upcoming', name: 'À venir', icon: Calendar, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { id: 'feedback', name: 'Retours', icon: MessageCircle, color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { id: 'external', name: 'Externe', icon: Building2, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'suggestion', name: 'Suggestions', icon: Lightbulb, color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
  { id: 'news', name: 'Actualités', icon: Newspaper, color: 'bg-gradient-to-r from-cyan-500 to-teal-500' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadPosts(); }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await blogApi.getAll(params);
      setPosts(response?.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setPosts([]);
    } finally { setLoading(false); }
  };

  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIconComponent = (category) => {
    const icons = {
      upcoming: Calendar,
      trending: TrendingUp,
      feedback: MessageCircle,
      external: Building2,
      suggestion: Lightbulb,
      news: Newspaper
    };
    const Icon = icons[category] || Newspaper;
    return <Icon size={16} className="text-current" />;
  };

  const getCategoryColorClass = (category) => {
    const colors = {
      upcoming: 'text-blue-600 dark:text-blue-400',
      trending: 'text-orange-600 dark:text-orange-400',
      feedback: 'text-green-600 dark:text-green-400',
      external: 'text-purple-600 dark:text-purple-400',
      suggestion: 'text-amber-600 dark:text-amber-400',
      news: 'text-cyan-600 dark:text-cyan-400'
    };
    return colors[category] || 'text-slate-600';
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-900 dark:via-primary-950 dark:to-primary-900">
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/90 mb-6">
            <Sparkles size={14} />
            <span>Blog & Actualités</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Blog Formations
            <span className="block text-primary-200">CENADI</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Actualités, tendances et conseils pour votre développement professionnel
          </p>
        </div>
      </section>

      {/* Search & Categories */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md'
                }`}
              >
                <IconComponent size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <Newspaper size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Aucun article trouvé</h3>
            <p className="text-slate-500 dark:text-slate-400">Essayez une autre catégorie ou revenez plus tard</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => {
              const CategoryIcon = getCategoryIconComponent(post.category);
              return (
                <article
                  key={post._id}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="p-6">
                      {/* Category Badge with Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 ${getCategoryColorClass(post.category)}`}>
                          {CategoryIcon}
                          <span>{post.categoryLabel || post.category}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Eye size={14} />
                          <span>{post.views || 0}</span>
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {post.title}
                      </h2>
                      
                      <p className="text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={12} />
                            <span>{post.likes || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:gap-2 transition-all">
                          <span>Lire plus</span>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}