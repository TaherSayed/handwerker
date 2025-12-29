import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { Search, Filter, CheckCircle2, FileText, User, Plus } from 'lucide-react';
import Skeleton from '../components/common/Skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    sync: 0,
    drafts: 0
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();

    // Only refetch if tab becomes visible AND data is stale (older than 5 minutes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastFetch = sessionStorage.getItem('dashboard_last_fetch');
        const now = Date.now();
        // Only refetch if last fetch was more than 5 minutes ago
        if (!lastFetch || (now - parseInt(lastFetch)) > 300000) {
          loadDashboardData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Show UI immediately with cached data if available
      const { offlineService } = await import('../services/offline.service');
      const cached = offlineService.getCachedSubmissions();
      if (cached.length > 0) {
        setStats({
          total: cached.length,
          sync: cached.filter((s: any) => s.status === 'submitted').length,
          drafts: cached.filter((s: any) => s.status === 'draft').length
        });
        setSubmissions(cached);
        setLoading(false); // Show cached data immediately
      }

      // Then fetch fresh data in background
      const subs = await apiService.getSubmissions();

      setStats({
        total: subs.length,
        sync: subs.filter((s: any) => s.status === 'submitted').length,
        drafts: subs.filter((s: any) => s.status === 'draft').length
      });

      setSubmissions(subs);

      // Store timestamp of last successful fetch
      sessionStorage.setItem('dashboard_last_fetch', Date.now().toString());
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Keep cached data if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesTab =
      activeTab === 'all' ? true :
        activeTab === 'draft' ? sub.status === 'draft' :
          sub.status === 'submitted';

    const matchesSearch =
      sub.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.form_templates?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return <div className="p-4 space-y-4">
      <Skeleton variant="rectangular" height="100px" className="rounded-xl" />
      <Skeleton variant="rectangular" height="50px" className="rounded-xl" />
      <Skeleton variant="text" />
      <Skeleton variant="rectangular" height="80px" className="rounded-xl" />
      <Skeleton variant="rectangular" height="80px" className="rounded-xl" />
    </div>
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">

      {/* Header with New Submission Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-lg">Dashboard</h1>
          <p className="text-body mt-1">Übersicht Ihrer Einsatzberichte</p>
        </div>
        <button
          onClick={() => navigate('/visits/new')}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Neuer Einsatz</span>
        </button>
      </div>

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card card-compact bg-primary-500 text-white flex flex-col justify-between h-28">
          <span className="text-2xl font-bold">{stats.total}</span>
          <span className="text-sm font-medium opacity-90">Gesamt</span>
        </div>
        <div className="card card-compact bg-primary-500 text-white flex flex-col justify-between h-28">
          <span className="text-2xl font-bold">{stats.sync}</span>
          <span className="text-sm font-medium opacity-90">Sync</span>
        </div>
        <div className="card card-compact bg-primary-500 text-white flex flex-col justify-between h-28">
          <span className="text-2xl font-bold">{stats.drafts}</span>
          <span className="text-sm font-medium opacity-90">Entwürfe</span>
        </div>
      </div>

      {/* 2. Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Berichte durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="btn-secondary w-12 h-12 p-0 flex items-center justify-center">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Tabs - Pill Style */}
      <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-dark-input rounded-full">
        <button
          onClick={() => setActiveTab('all')}
          className={`tab flex-1 ${activeTab === 'all' ? 'tab-active' : 'tab-inactive'}`}
        >
          Alle
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`tab flex-1 ${activeTab === 'draft' ? 'tab-active' : 'tab-inactive'}`}
        >
          Entwürfe
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`tab flex-1 ${activeTab === 'submitted' ? 'tab-active' : 'tab-inactive'}`}
        >
          Eingereicht
        </button>
      </div>

      {/* 4. List Header */}
      <h3 className="text-caption font-semibold uppercase tracking-wider px-1">
        EINSATZBERICHTE & DOKUMENTATIONEN
      </h3>

      {/* 5. List Items */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="card card-compact text-center py-12 text-text-tertiary">
            Keine Berichte gefunden.
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              onClick={() => navigate(`/submissions/${sub.id}`)}
              className="card card-hover card-compact flex items-start gap-4"
            >
              {/* Avatar Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <User className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="heading-sm truncate">{sub.customer_name || 'Kunde'}</h4>
                  <span className="text-primary-500 shrink-0">
                    <code className="text-xs">&gt;</code>
                  </span>
                </div>

                <p className="text-caption truncate">
                  {sub.user?.email || 'user@example.com'}
                </p>

                {/* Status Badge */}
                {sub.status === 'submitted' && (
                  <div className="badge badge-success inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Synchronisiert</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                  <FileText className="w-4 h-4 text-primary-500 shrink-0" />
                  <span className="text-sm font-medium text-text-secondary truncate">{sub.form_templates?.name || 'Formular'}</span>
                </div>

                <div className="flex items-center gap-3 text-caption">
                  <span>{new Date(sub.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{new Date(sub.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for New Submission (Mobile Only) */}
      <button
        onClick={() => navigate('/visits/new')}
        className="fixed right-6 bottom-24 w-16 h-16 btn-primary rounded-full shadow-2xl z-40 lg:hidden flex items-center justify-center"
        style={{ minWidth: '64px', minHeight: '64px' }}
      >
        <Plus className="w-8 h-8" />
      </button>

    </div>
  );
}

