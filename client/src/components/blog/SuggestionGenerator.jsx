import { useState } from 'react';
import { Sparkles, Loader, CheckCircle, TrendingUp, Users, Building2, Calendar, Lightbulb, Globe, Brain, Zap, BarChart3, Target, Rocket, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

export default function SuggestionGenerator({ onSuccess }) {
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [results, setResults] = useState(null);

  const loadAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const response = await api.get('/blog-suggestions/analyze');
      setAnalysis(response);
    } catch (error) {
      console.error('Erreur analyse:', error);
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleGenerateAll = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/blog-suggestions/generate-all');
      setResults(response);
      toast.success(response.message || 'Articles générés avec succès');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const suggestionTypes = [
    { icon: TrendingUp, label: 'Tendances', color: 'from-orange-500 to-red-500', bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30', description: 'Basé sur les technologies recherchées' },
    { icon: Users, label: 'Collaborateurs', color: 'from-blue-500 to-cyan-500', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30', description: 'Basé sur les demandes des employés' },
    { icon: Building2, label: 'Externes', color: 'from-purple-500 to-pink-500', bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30', description: 'Opportunités dans d\'autres ministères' },
    { icon: Calendar, label: 'À venir', color: 'from-green-500 to-emerald-500', bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', description: 'Promotion des prochaines sessions' },
    { icon: BarChart3, label: 'Analyse', color: 'from-amber-500 to-yellow-500', bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30', description: 'Basé sur vos données existantes' },
    { icon: Globe, label: 'Actualités', color: 'from-cyan-500 to-teal-500', bg: 'bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30', description: 'Informations générales sur le secteur' },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100/20 to-primary-200/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Brain size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Générateur IA intelligent</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Analyse vos données et génère automatiquement des articles de blog pertinents</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {suggestionTypes.map((type, idx) => {
            const IconComponent = type.icon;
            return (
              <div key={idx} className={`${type.bg} rounded-xl p-3 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform`}>
                  <IconComponent size={18} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{type.label}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{type.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateAll}
            disabled={generating}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/30 disabled:opacity-50"
          >
            {generating ? <><Loader size={16} className="animate-spin inline mr-2" /> Génération...</> : <><Rocket size={16} className="inline mr-2" /> Générer tous les articles</>}
          </button>
          
          <button
            onClick={loadAnalysis}
            disabled={loadingAnalysis}
            className="px-6 py-2.5 bg-white dark:bg-slate-800 border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
          >
            {loadingAnalysis ? <Loader size={16} className="animate-spin inline mr-2" /> : <Target size={16} className="inline mr-2" />}
            Analyser les données
          </button>
        </div>

        {results && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">{results.message}</span>
            </div>
            {results.data?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {results.data.map((item, idx) => (
                  <span key={idx} className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-full text-green-600 shadow-sm">
                    ✓ {item.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {analysis && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" />
            Analyse intelligente de vos données
          </h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.data?.suggestionsFromData?.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1"><Crown size={12} /> Recommandations</p>
                {analysis.data.suggestionsFromData.map((s, i) => (
                  <div key={i} className="text-xs text-slate-600 dark:text-slate-300 mb-2">• <span className="font-medium">{s.title}</span>: {s.reason}</div>
                ))}
              </div>
            )}
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-3 border border-orange-100 dark:border-orange-800">
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1"><Zap size={12} /> Tendances actuelles</p>
              {analysis.data?.marketTrends?.slice(0, 3).map((t, i) => (
                <div key={i} className="text-xs text-slate-600 dark:text-slate-300 mb-2">• {t.title}</div>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1"><Globe size={12} /> Opportunités externes</p>
              {analysis.data?.externalTrainings?.slice(0, 3).map((e, i) => (
                <div key={i} className="text-xs text-slate-600 dark:text-slate-300 mb-2">• <span className="font-medium">{e.organization}</span>: {e.title}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}