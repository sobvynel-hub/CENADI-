import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { statsApi } from '../../../api/stats';
import Loader from '../../../components/common/Loader';
import { Users, BookOpen, CalendarCheck, Award, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

Chart.register(...registerables);

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('year'); // month, year
  const [isDarkMode, setIsDarkMode] = useState(false);

  const lineCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);
  const doughnutCanvasRef = useRef(null);
  const chartInstances = useRef({ line: null, bar: null, doughnut: null });

  // Détecter le thème sombre
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await statsApi.getDashboard();
        const data = response?.data || response;
        setStats(data);
      } catch (err) {
        console.error('Erreur chargement stats:', err);
        setError(err.message);
        setStats({
          users: { total: 124, active: 98, newThisMonth: 12 },
          formations: { total: 45, upcoming: 8, ongoing: 5, completed: 30, cancelled: 2 },
          enrollments: { total: 342, confirmed: 298, pending: 44 },
          certificates: 256,
          satisfaction: 94,
          monthlyEnrollments: [28, 32, 35, 42, 48, 52, 58, 62, 68, 72, 78, 85],
          topFormations: [
            { title: 'Cybersécurité avancée', enrollments: 45 },
            { title: 'Développement Web Full Stack', enrollments: 38 },
            { title: 'Data Science et IA', enrollments: 32 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Destruction des graphiques existants
  const destroyCharts = () => {
    if (chartInstances.current.line) chartInstances.current.line.destroy();
    if (chartInstances.current.bar) chartInstances.current.bar.destroy();
    if (chartInstances.current.doughnut) chartInstances.current.doughnut.destroy();
    chartInstances.current = { line: null, bar: null, doughnut: null };
  };

  useEffect(() => {
    if (loading || !stats) return;

    destroyCharts();

    const timeout = setTimeout(() => {
      // Couleurs adaptées au thème
      const gridColor = isDarkMode ? '#334155' : '#e5e7eb';
      const textColor = isDarkMode ? '#94a3b8' : '#6b7280';
      const titleColor = isDarkMode ? '#f1f5f9' : '#1e293b';
      
      // Graphique linéaire - Évolution des inscriptions
      if (lineCanvasRef.current) {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyData = stats.monthlyEnrollments || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        chartInstances.current.line = new Chart(lineCanvasRef.current, {
          type: 'line',
          data: {
            labels: months,
            datasets: [
              {
                label: 'Inscriptions',
                data: monthlyData,
                borderColor: '#6366f1',
                backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: isDarkMode ? '#1e293b' : '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { 
                backgroundColor: isDarkMode ? '#334155' : '#1f2937', 
                titleColor: '#fff', 
                bodyColor: '#9ca3af' 
              },
            },
            scales: {
              y: { 
                beginAtZero: true, 
                grid: { color: gridColor, drawBorder: false }, 
                ticks: { color: textColor, stepSize: 10 } 
              },
              x: { 
                grid: { display: false },
                ticks: { color: textColor }
              },
            },
          },
        });
      }

      // Graphique à barres - Formations par statut
      if (barCanvasRef.current) {
        chartInstances.current.bar = new Chart(barCanvasRef.current, {
          type: 'bar',
          data: {
            labels: ['Formations'],
            datasets: [
              { label: 'À venir', data: [stats.formations?.upcoming || 0], backgroundColor: '#3b82f6', borderRadius: 8, barPercentage: 0.7 },
              { label: 'En cours', data: [stats.formations?.ongoing || 0], backgroundColor: '#f59e0b', borderRadius: 8, barPercentage: 0.7 },
              { label: 'Terminées', data: [stats.formations?.completed || 0], backgroundColor: '#22c55e', borderRadius: 8, barPercentage: 0.7 },
              { label: 'Annulées', data: [stats.formations?.cancelled || 0], backgroundColor: '#ef4444', borderRadius: 8, barPercentage: 0.7 },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { 
                position: 'top', 
                labels: { 
                  usePointStyle: true, 
                  boxWidth: 8,
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                } 
              } 
            },
            scales: { 
              y: { 
                beginAtZero: true, 
                grid: { color: gridColor }, 
                title: { display: true, text: 'Nombre de formations', color: textColor },
                ticks: { color: textColor }
              },
              x: { 
                ticks: { color: textColor }
              }
            },
          },
        });
      }

      // Graphique doughnut - Taux d'occupation
      if (doughnutCanvasRef.current) {
        const confirmed = stats.enrollments?.confirmed || 0;
        const pending = stats.enrollments?.pending || 0;
        
        chartInstances.current.doughnut = new Chart(doughnutCanvasRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Confirmées', 'En attente'],
            datasets: [{ data: [confirmed, pending], backgroundColor: ['#22c55e', '#f59e0b'], borderWidth: 0, cutout: '65%' }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { 
                position: 'bottom', 
                labels: { 
                  usePointStyle: true, 
                  boxWidth: 8,
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                } 
              }, 
              tooltip: { 
                callbacks: { 
                  label: (ctx) => `${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / (confirmed + pending) * 100)}%)` 
                } 
              }
            },
          },
        });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [loading, stats, isDarkMode]);

  useEffect(() => () => destroyCharts(), []);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="p-6 text-center text-red-500 dark:text-red-400">Erreur : {error}</div>;

  const totalEnrollments = stats?.enrollments?.total || 0;
  const confirmedEnrollments = stats?.enrollments?.confirmed || 0;
  const satisfaction = stats?.satisfaction || 94;
  const satisfactionColor = satisfaction >= 80 ? 'text-green-600 dark:text-green-400' : satisfaction >= 60 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400';

  const statCards = [
    { icon: Users, label: 'Utilisateurs actifs', value: stats?.users?.active || 0, total: stats?.users?.total || 0, color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', iconColor: 'text-indigo-600 dark:text-indigo-400' },
    { icon: BookOpen, label: 'Formations', value: stats?.formations?.total || 0, total: `${stats?.formations?.ongoing || 0} en cours`, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', iconColor: 'text-blue-600 dark:text-blue-400' },
    { icon: CalendarCheck, label: 'Inscriptions', value: totalEnrollments, total: `${confirmedEnrollments} confirmées`, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Award, label: 'Attestations', value: stats?.certificates || 0, total: 'délivrées', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Statistiques</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Aperçu global et indicateurs clés de performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTimeRange('month')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === 'month' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Mois
          </button>
          <button 
            onClick={() => setTimeRange('year')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === 'year' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Année
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon size={20} className={card.iconColor} />
              </div>
              {i === 0 && stats?.users?.newThisMonth > 0 && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <TrendingUp size={12} /> +{stats.users.newThisMonth} ce mois
                </span>
              )}
            </div>
            <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">{card.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{card.total}</p>
          </div>
        ))}
      </div>

      {/* Satisfaction & Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 rounded-2xl p-6 border border-primary-100 dark:border-primary-800">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={24} className="text-primary-600 dark:text-primary-400" />
            <h3 className="font-display font-semibold text-slate-900 dark:text-white">Satisfaction globale</h3>
          </div>
          <p className={`text-5xl font-display font-bold ${satisfactionColor}`}>{satisfaction}%</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Taux de satisfaction des apprenants</p>
          <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full transition-all duration-1000" style={{ width: `${satisfaction}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target size={24} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-display font-semibold text-slate-900 dark:text-white">Taux d'occupation</h3>
          </div>
          <div className="h-40">
            <canvas ref={doughnutCanvasRef} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
            <h3 className="font-display font-semibold text-slate-900 dark:text-white">Top formations</h3>
          </div>
          <div className="space-y-4">
            {(stats?.topFormations || []).map((formation, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 truncate">{formation.title}</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{formation.enrollments} inscrits</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(formation.enrollments / (stats?.topFormations?.[0]?.enrollments || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Évolution des inscriptions</h2>
          <div className="h-80">
            <canvas ref={lineCanvasRef} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Répartition des formations</h2>
          <div className="h-80">
            <canvas ref={barCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}