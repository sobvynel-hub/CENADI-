import { useState } from 'react';
import { Sparkles, Loader, CheckCircle, Bot, Zap, Brain, Cpu, Rocket, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogApi } from '../../api/blog';

export default function AIGeneratorPanel({ onSuccess }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await blogApi.generateAuto();
      toast.success(response.message || 'Articles générés avec succès');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-2xl p-6 mb-6 border border-indigo-200 dark:border-indigo-800 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20">
      {/* Effet de fond animé */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-400/20 to-amber-400/20 rounded-full blur-2xl animate-pulse delay-1000" />
      
      <div className="relative flex items-center gap-4 mb-5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-60 animate-pulse" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot size={28} className="text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Assistant IA CENADI
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Génération automatique d'articles intelligents basée sur vos données
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded-xl">
          <Brain size={14} className="text-indigo-500" />
          <span>Analyse des tendances</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded-xl">
          <Zap size={14} className="text-amber-500" />
          <span>Génération rapide</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded-xl">
          <Cpu size={14} className="text-emerald-500" />
          <span>Contenu intelligent</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded-xl">
          <Rocket size={14} className="text-rose-500" />
          <span>Optimisation SEO</span>
        </div>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="relative group w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <span className="relative flex items-center justify-center gap-2">
          {generating ? (
            <><Loader size={18} className="animate-spin" /> Génération en cours...</>
          ) : (
            <><Wand2 size={18} /> Générer tous les articles</>
          )}
        </span>
      </button>
    </div>
  );
}