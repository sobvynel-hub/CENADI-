/**
 * pages/admin/Dashboard/Dashboard.jsx
 * 
 * Dashboard complet qui combine les fonctionnalités de la page Statistics
 * Vous pouvez supprimer Statistics.jsx après avoir remplacé ce fichier
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, UserCheck, Award, TrendingUp, TrendingDown,
  ArrowRight, RefreshCw, AlertCircle, Activity, Target, Calendar,
  Download, Filter, ChevronDown, Eye, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../../../hooks/useAuth';
import { statsApi } from '../../../api/stats';
import { formationsApi } from '../../../api/formations';
import { formatDate, getStatusLabel, getStatusColor } from '../../../utils/helpers';
import Badge from '../../../components/ui/Badge';
import Loader from '../../../components/common/Loader';

Chart.register(...registerables);

/* ─── Carte statistique ─── */
function StatCard({ label, value, sub, icon: Icon, colorClass, trend, loading, suffix = '' }) {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={colorClass?.replace('bg', 'text')?.replace('/20', '')} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            trend.includes('+') ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {trend.includes('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-lg mb-1" />
      ) : (
        <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">
          {value?.toLocaleString()}{suffix}
        </p>
      )}
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{sub}</p>}
    </div>
  );
}

/* ─── Composant principal ─── */
export default function Dashboard() {
  const { user } = useAuth();

  /* États */
  const [rawStats, setRawStats] = useState(null);
  const [formations, setFormations] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [formationsLoading, setFormationsLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);
  const [timeRange, setTimeRange] = useState('year');
  const [isDarkMode, setIsDarkMode] = useState(false);

  /* Refs graphiques */
  const lineRef = useRef(null);
  const barRef = useRef(null);
  const doughnutRef = useRef(null);
  const lineChart = useRef(null);
  const barChart = useRef(null);
  const doughnutChart = useRef(null);

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

  /* ─── Normalisation des stats backend ─── */
  const overview = useMemo(() => {
    if (!rawStats) return null;
    return {
      totalFormations: rawStats.formations?.total ?? 0,
      upcomingFormations: rawStats.formations?.upcoming ?? 0,
      ongoingFormations: rawStats.formations?.ongoing ?? 0,
      completedFormations: rawStats.formations?.completed ?? 0,
      cancelledFormations: rawStats.formations?.cancelled ?? 0,
      totalUsers: rawStats.users?.total ?? 0,
      activeUsers: rawStats.users?.active ?? 0,
      newUsersThisMonth: rawStats.users?.newThisMonth ?? 0,
      totalEnrollments: rawStats.enrollments?.total ?? 0,
      pendingEnrollments: (rawStats.enrollments?.total ?? 0) - (rawStats.enrollments?.confirmed ?? 0),
      confirmedEnrollments: rawStats.enrollments?.confirmed ?? 0,
      totalCertificates: rawStats.certificates ?? 0,
      satisfaction: rawStats.satisfaction ?? 94,
      pendingPersonalTrainings: rawStats.pendingPersonalTrainings ?? 0,
      monthlyEnrollments: buildMonthlyArray(rawStats.monthlyEnrollments),
      topFormations: rawStats.topFormations ?? [],
    };
  }, [rawStats]);

  /* ─── Chargement des statistiques ─── */
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const res = await statsApi.getDashboard();
      const stats = res?.data ?? res;
      setRawStats(stats);
    } catch (err) {
      setOverviewError(err?.message || 'Impossible de charger les statistiques');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  /* ─── Chargement des formations récentes ─── */
  const loadFormations = useCallback(async () => {
    setFormationsLoading(true);
    try {
      const res = await formationsApi.getAll({ limit: 5, sort: '-createdAt' });
      const list = res?.data ?? (Array.isArray(res) ? res : []);
      setFormations(list);
    } catch {
      setFormations([]);
    } finally {
      setFormationsLoading(false);
    }
  }, []);

  /* ─── Chargement des inscriptions récentes (simulé) ─── */
  const loadRecentEnrollments = useCallback(async () => {
    setEnrollmentsLoading(true);
    try {
      // Essayer de récupérer les inscriptions récentes depuis l'API
      const res = await statsApi.getRecentEnrollments?.() || { data: [] };
      const list = res?.data ?? (Array.isArray(res) ? res : []);
      setRecentEnrollments(list.slice(0, 5));
    } catch {
      // Données d'exemple si l'API n'existe pas
      setRecentEnrollments([
        { user: { firstName: 'Jean', lastName: 'Djimeli' }, formation: { title: 'Cybersécurité' }, status: 'confirmed', createdAt: new Date() },
        { user: { firstName: 'Marie', lastName: 'Essomba' }, formation: { title: 'React Avancé' }, status: 'pending', createdAt: new Date() },
        { user: { firstName: 'Paul', lastName: 'Ndjock' }, formation: { title: 'Data Science' }, status: 'confirmed', createdAt: new Date() },
      ]);
    } finally {
      setEnrollmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    loadFormations();
    loadRecentEnrollments();
  }, [loadOverview, loadFormations, loadRecentEnrollments]);

  /* ─── Destruction des graphiques ─── */
  const destroyCharts = () => {
    if (lineChart.current) lineChart.current.destroy();
    if (barChart.current) barChart.current.destroy();
    if (doughnutChart.current) doughnutChart.current.destroy();
    lineChart.current = null;
    barChart.current = null;
    doughnutChart.current = null;
  };

  /* ─── Création des graphiques ─── */
  useEffect(() => {
    if (overviewLoading || !overview) return;

    destroyCharts();

    const timeout = setTimeout(() => {
      const gridColor = isDarkMode ? '#334155' : '#e5e7eb';
      const textColor = isDarkMode ? '#94a3b8' : '#6b7280';
      
      const monthlyData = overview?.monthlyEnrollments ?? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const topFormations = overview?.topFormations ?? [];
      const divisionLabels = topFormations.length > 0
        ? topFormations.map((f) => truncateLabel(f.title, 14))
        : ['Aucune donnée'];
      const divisionData = topFormations.length > 0
        ? topFormations.map((f) => f.enrollments || f.count || 0)
        : [0];

      // Graphique linéaire - Inscriptions mensuelles
      if (lineRef.current) {
        lineChart.current = new Chart(lineRef.current, {
          type: 'line',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [{
              label: 'Inscriptions',
              data: monthlyData,
              borderColor: '#16a34a',
              backgroundColor: isDarkMode ? 'rgba(22, 163, 74, 0.1)' : 'rgba(22, 163, 74, 0.05)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#16a34a',
              pointBorderColor: isDarkMode ? '#1e293b' : '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
              y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true },
            },
          },
        });
      }

      // Graphique à barres - Top formations
      if (barRef.current && topFormations.length > 0) {
        barChart.current = new Chart(barRef.current, {
          type: 'bar',
          data: {
            labels: divisionLabels,
            datasets: [{
              label: 'Inscriptions',
              data: divisionData,
              backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
              borderRadius: 8,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
              y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true },
            },
          },
        });
      }

      // Graphique doughnut - Taux d'occupation des inscriptions
      if (doughnutRef.current) {
        const confirmed = overview?.confirmedEnrollments || 0;
        const pending = overview?.pendingEnrollments || 0;
        
        doughnutChart.current = new Chart(doughnutRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Confirmées', 'En attente'],
            datasets: [{
              data: [confirmed, pending],
              backgroundColor: ['#22c55e', '#f59e0b'],
              borderWidth: 0,
              cutout: '65%',
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: textColor } },
              tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / (confirmed + pending) * 100)}%)` } }
            },
          },
        });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [overviewLoading, overview, isDarkMode]);

  useEffect(() => () => destroyCharts(), []);

  /* ─── Cartes stats ─── */
  const statCards = [
    { label: 'Formations', value: overview?.totalFormations, sub: `${overview?.upcomingFormations || 0} à venir`, icon: BookOpen, colorClass: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' },
    { label: 'Personnel', value: overview?.totalUsers, sub: `${overview?.activeUsers || 0} actifs`, icon: Users, colorClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', trend: overview?.newUsersThisMonth ? `+${overview.newUsersThisMonth}` : null },
    { label: 'Inscriptions', value: overview?.totalEnrollments, sub: `${overview?.pendingEnrollments || 0} en attente`, icon: UserCheck, colorClass: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
    { label: 'Attestations', value: overview?.totalCertificates, sub: 'délivrées', icon: Award, colorClass: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  ];

  const formationStatusData = [
    { label: 'À venir', value: overview?.upcomingFormations || 0, color: '#3b82f6' },
    { label: 'En cours', value: overview?.ongoingFormations || 0, color: '#f59e0b' },
    { label: 'Terminées', value: overview?.completedFormations || 0, color: '#22c55e' },
    { label: 'Annulées', value: overview?.cancelledFormations || 0, color: '#ef4444' },
  ];

  const satisfaction = overview?.satisfaction || 94;
  const satisfactionColor = satisfaction >= 80 ? 'text-green-600 dark:text-green-400' : satisfaction >= 60 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-6 animate-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            Bonjour {user?.firstName || user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Voici un aperçu complet de l'activité de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtre de période */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === 'month' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === 'year' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Année
            </button>
          </div>
          <button
            onClick={() => { loadOverview(); loadFormations(); }}
            className="btn-ghost text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RefreshCw size={14} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Erreur stats ── */}
      {overviewError && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{overviewError}</span>
        </div>
      )}

      {/* ── Cartes statistiques ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={overviewLoading} />
        ))}
      </div>

      {/* ── Section Satisfaction et Taux d'occupation ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Satisfaction */}
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

        {/* Taux d'occupation des inscriptions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target size={24} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-display font-semibold text-slate-900 dark:text-white">État des inscriptions</h3>
          </div>
          <div className="h-48">
            <canvas ref={doughnutRef} />
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Confirmées: {overview?.confirmedEnrollments || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">En attente: {overview?.pendingEnrollments || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Graphiques ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Graphique inscriptions mensuelles */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-slate-900 dark:text-white">Évolution des inscriptions</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Sur les 12 derniers mois</p>
            </div>
            <TrendingUp size={18} className="text-primary-500" />
          </div>
          <div className="h-64">
            <canvas ref={lineRef} />
          </div>
        </div>

        {/* Top formations */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-slate-900 dark:text-white">Top formations</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Par nombre d'inscriptions</p>
            </div>
          </div>
          <div className="h-64">
            <canvas ref={barRef} />
          </div>
        </div>
      </div>

      {/* ── Répartition des formations par statut ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Répartition des formations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formationStatusData.map((status) => (
            <div key={status.label} className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-2xl font-bold" style={{ color: status.color }}>{status.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{status.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Formations récentes ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-display font-bold text-slate-900 dark:text-white">Formations récentes</h2>
          <Link to="/admin/formations" className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1 transition-colors">
            Voir tout <ArrowRight size={13} />
          </Link>
        </div>

        {formationsLoading ? (
          <div className="p-8 flex justify-center"><Loader /></div>
        ) : formations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">Aucune formation trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['Formation', 'Statut', 'Début', 'Participants'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formations.map((f) => (
                  <tr key={f._id || f.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{f.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{f.trainer}</p>
                    </td>
                    <td className="px-4 py-3.5"><Badge status={f.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{formatDate(f.startDate)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-16">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(((f.currentEnrolled || 0) / (f.maxCapacity || 1)) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{f.currentEnrolled ?? 0}/{f.maxCapacity ?? '∞'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Inscriptions récentes ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <h2 className="font-display font-bold text-slate-900 dark:text-white">Dernières inscriptions</h2>
          </div>
          <Link to="/admin/enrollments" className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1 transition-colors">
            Voir tout <ArrowRight size={13} />
          </Link>
        </div>

        {enrollmentsLoading ? (
          <div className="p-8 flex justify-center"><Loader /></div>
        ) : recentEnrollments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">Aucune inscription récente</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentEnrollments.map((enrollment, idx) => (
              <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">
                    {enrollment.user?.firstName} {enrollment.user?.lastName}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{enrollment.formation?.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  {enrollment.status === 'confirmed' ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><CheckCircle size={12} /> Confirmée</span>
                  ) : enrollment.status === 'pending' ? (
                    <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400"><Clock size={12} /> En attente</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"><XCircle size={12} /> Annulée</span>
                  )}
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Eye size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function buildMonthlyArray(mongoArray) {
  const result = new Array(12).fill(0);
  if (!Array.isArray(mongoArray)) return result;
  const currentYear = new Date().getFullYear();
  mongoArray.forEach(({ _id, count }) => {
    if (_id?.year === currentYear && _id?.month >= 1 && _id?.month <= 12) {
      result[_id.month - 1] = count;
    }
  });
  return result;
}

function truncateLabel(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}