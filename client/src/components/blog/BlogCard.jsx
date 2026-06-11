import { Link } from 'react-router-dom';
import { Calendar, Eye, Heart, ArrowRight, BookOpen, TrendingUp, Lightbulb, Globe, MessageCircle, Calendar as CalendarIcon, Sparkles, Zap, Rocket } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const getCategoryConfig = (category) => {
  const configs = {
    upcoming: { 
      icon: Rocket, 
      gradient: 'from-blue-500 to-cyan-500',
      color: 'text-blue-600', 
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30', 
      border: 'border-blue-200 dark:border-blue-800',
      shadow: 'shadow-blue-200/50'
    },
    trending: { 
      icon: TrendingUp, 
      gradient: 'from-orange-500 to-red-500',
      color: 'text-orange-600', 
      bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30', 
      border: 'border-orange-200 dark:border-orange-800',
      shadow: 'shadow-orange-200/50'
    },
    feedback: { 
      icon: MessageCircle, 
      gradient: 'from-green-500 to-emerald-500',
      color: 'text-green-600', 
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', 
      border: 'border-green-200 dark:border-green-800',
      shadow: 'shadow-green-200/50'
    },
    external: { 
      icon: Globe, 
      gradient: 'from-purple-500 to-pink-500',
      color: 'text-purple-600', 
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30', 
      border: 'border-purple-200 dark:border-purple-800',
      shadow: 'shadow-purple-200/50'
    },
    suggestion: { 
      icon: Lightbulb, 
      gradient: 'from-amber-500 to-yellow-500',
      color: 'text-amber-600', 
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30', 
      border: 'border-amber-200 dark:border-amber-800',
      shadow: 'shadow-amber-200/50'
    },
    news: { 
      icon: Sparkles, 
      gradient: 'from-cyan-500 to-teal-500',
      color: 'text-cyan-600', 
      bg: 'bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30', 
      border: 'border-cyan-200 dark:border-cyan-800',
      shadow: 'shadow-cyan-200/50'
    }
  };
  return configs[category] || configs.news;
};

export default function BlogCard({ post }) {
  const config = getCategoryConfig(post.category);
  const IconComponent = config.icon;
  
  return (
    <Link to={`/blog/${post.slug}`} className="group block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-primary-200/50 dark:hover:shadow-primary-900/30">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${config.gradient}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border} backdrop-blur-sm`}>
            <IconComponent size={14} className="drop-shadow-sm" />
            <span>{post.categoryLabel || post.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-full">
            <Eye size={12} />
            <span>{post.views || 0}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {post.title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/30 px-2 py-1 rounded-full">
              <Calendar size={12} />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/30 px-2 py-1 rounded-full">
              <Heart size={12} className="text-rose-500" />
              <span>{post.likes || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:gap-2 transition-all bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full">
            <span>Lire</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}