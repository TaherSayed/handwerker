import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import {
  Search, CheckCircle2,
  Clock, ChevronRight, LayoutGrid,
  Settings2, Calendar, Database
} from 'lucide-react';
import Skeleton from '../components/common/Skeleton';
import { useNotificationStore } from '../store/notificationStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { error: notifyError } = useNotificationStore();

  const [stats, setStats] = useState({
    total: 0,
    sync: 0,
    drafts: 0,
    today: 0
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastFetch = sessionStorage.getItem('dashboard_last_fetch');
        const now = Date.now();
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
      if (submissions.length === 0) setLoading(true);
      else setIsRefreshing(true);

      const { offlineService } = await import('../services/offline.service');
      const cached = offlineService.getCachedSubmissions();

      if (cached.length > 0 && submissions.length === 0) {
        updateStates(cached);
        setLoading(false);
      }

      const subs = await apiService.getSubmissions();
      updateStates(subs);
      sessionStorage.setItem('dashboard_last_fetch', Date.now().toString());
    } catch (error) {
      console.error('Error loading dashboard:', error);
      notifyError('Sync-Fehler', 'Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateStates = (subs: any[]) => {
    const today = new Date().toLocaleDateString('de-DE');
    setStats({
      total: subs.length,
      sync: subs.filter((s: any) => s.status === 'submitted').length,
      drafts: subs.filter((s: any) => s.status === 'draft').length,
      today: subs.filter((s: any) => new Date(s.created_at).toLocaleDateString('de-DE') === today).length
    });
    setSubmissions(subs);
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchesTab =
        activeTab === 'all' ? true :
          activeTab === 'draft' ? sub.status === 'draft' :
            sub.status === 'submitted';

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (sub.customer_name?.toLowerCase() ?? '').includes(query) ||
        (sub.form_templates?.name?.toLowerCase() ?? '').includes(query) ||
        (sub.user?.email?.toLowerCase() ?? '').includes(query);

      return matchesTab && matchesSearch;
    });
  }, [submissions, activeTab, searchQuery]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '?';
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="150px" height="32px" />
          <Skeleton variant="circular" width="40px" height="40px" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="100px" width="160px" className="rounded-3xl shrink-0" />)}
        </div>
        <div className="space-y-4">
          <Skeleton variant="rectangular" height="56px" className="rounded-2xl" />
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="90px" className="rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-base pt-6 pb-32 pb-safe animate-fade-in">
      <div className="max-w-xl mx-auto space-y-8">

        {/* 🏷️ Minimal Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Ready</span>
            </div>
            {isRefreshing && <Settings2 className="w-4 h-4 text-primary-500 animate-spin" />}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* 📊 KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCardSmall
            label="Einsätze"
            value={stats.total}
            icon={Database}
            color="indigo"
          />
          <StatCardSmall
            label="Heute"
            value={stats.today}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCardSmall
            label="Entwürfe"
            value={stats.drafts}
            icon={Clock}
            color="amber"
          />
        </div>

        {/* ⚡ The action button has been moved to the Layout's bottom navigation to avoid obscuring content */}

        {/* 🔍 Unified Search & Filter */}
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Kunde oder Projekt suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-14 pr-4 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-stroke rounded-[20px] text-sm font-semibold text-slate-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
            />
          </div>

          <div className="flex p-1.5 bg-slate-200/50 dark:bg-dark-input rounded-[18px]">
            <TabPill active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="Alle" />
            <TabPill active={activeTab === 'draft'} onClick={() => setActiveTab('draft')} label="Entwürfe" />
            <TabPill active={activeTab === 'submitted'} onClick={() => setActiveTab('submitted')} label="Synced" />
          </div>
        </div>

        {/* 📋 Submissions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Übersicht</h2>
            <span className="text-[10px] font-bold text-slate-400">{filteredSubmissions.length} Einträge</span>
          </div>

          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-dark-card rounded-[32px] border-2 border-dashed border-slate-100 dark:border-dark-stroke">
                <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-medium">Keine Berichte vorhanden</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                  className="group bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-stroke rounded-[28px] p-4 flex items-center gap-4 active:scale-[0.97] transition-all"
                >
                  {/* Initials Square */}
                  <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center font-black text-xs shrink-0 ${sub.status === 'submitted'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20'
                    }`}>
                    {getInitials(sub.customer_name)}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {sub.status === 'submitted' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate uppercase tracking-tight">{sub.customer_name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(sub.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-200 group-active:text-primary-500" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 📱 Mobile Navigation Safe Area spacer */}
      <div className="h-20" />
    </div>
  );
}

// 🧩 Helper Components
function StatCardSmall({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) {
  const themes: any = {
    indigo: 'bg-indigo-600 border-indigo-500 text-white',
    emerald: 'bg-emerald-600 border-emerald-500 text-white',
    amber: 'bg-amber-500 border-amber-400 text-white'
  };

  return (
    <div className={`min-w-[140px] p-5 rounded-[28px] border-b-4 shadow-lg ${themes[color]} flex flex-col gap-3 transition-transform active:scale-95`}>
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 opacity-60" />
        <span className="text-xl font-black">{value}</span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</span>
    </div>
  );
}

function TabPill({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-11 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${active
        ? 'bg-white dark:bg-dark-card text-primary-600 shadow-sm'
        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
    >
      {label}
    </button>
  );
}
