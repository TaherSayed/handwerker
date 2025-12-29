import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import {
  Search, CheckCircle2, FileText, Plus,
  BarChart3, Clock, ChevronRight, LayoutGrid,
  Settings2, Calendar, TrendingUp, History
} from 'lucide-react';
import Skeleton from '../components/common/Skeleton';
import { useNotificationStore } from '../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Dashboard() {
  const navigate = useNavigate();
  const { error: notifyError } = useNotificationStore();

  const [stats, setStats] = useState({
    total: 0,
    sync: 0,
    drafts: 0
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
    setStats({
      total: subs.length,
      sync: subs.filter((s: any) => s.status === 'submitted').length,
      drafts: subs.filter((s: any) => s.status === 'draft').length
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
        sub.customer_name?.toLowerCase().includes(query) ||
        sub.form_templates?.name?.toLowerCase().includes(query) ||
        sub.user?.email?.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [submissions, activeTab, searchQuery]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '?';
  };

  if (loading) {
    return (
      <div className="space-y-8 p-1 md:p-4">
        <div className="space-y-4">
          <Skeleton variant="text" width="200px" height="40px" />
          <Skeleton variant="text" width="300px" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="120px" className="rounded-[32px]" />)}
        </div>
        <div className="space-y-4 pt-8">
          <Skeleton variant="rectangular" height="60px" className="rounded-2xl" />
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height="100px" className="rounded-[24px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-28 md:pb-12 animate-fade-in max-w-6xl mx-auto">

      {/* 🚀 Header & Main Action */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary-500 font-bold text-xs uppercase tracking-[0.2em]">
            <TrendingUp className="w-4 h-4" />
            Live Übersicht
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-dark-text-muted font-medium">
            Verwalten Sie Ihre Berichte und Dokumentationen.
          </p>
        </div>
        <button
          onClick={() => navigate('/visits/new')}
          className="group relative flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-2xl hover:shadow-primary-600/30 hover:-translate-y-1 active:scale-95 w-full md:w-auto overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>Neuer Einsatz</span>
        </button>
      </div>

      {/* 📊 KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CardKPI
          value={stats.total}
          label="Gesamt"
          icon={BarChart3}
          color="blue"
          trend="Alle Berichte"
        />
        <CardKPI
          value={stats.sync}
          label="Synchronisiert"
          icon={CheckCircle2}
          color="emerald"
          trend="Upload vollständig"
        />
        <CardKPI
          value={stats.drafts}
          label="Entwürfe"
          icon={Clock}
          color="amber"
          trend="Noch in Arbeit"
        />
      </div>

      <div className="space-y-6">
        {/* 🔍 Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Suchen nach Kunde oder Projekt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-14 pr-6 bg-white dark:bg-dark-card border-2 border-slate-100 dark:border-dark-stroke rounded-[24px] font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-dark-input rounded-[22px] min-w-[320px]">
            <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="Alle" />
            <TabButton active={activeTab === 'draft'} onClick={() => setActiveTab('draft')} label="Entwürfe" />
            <TabButton active={activeTab === 'submitted'} onClick={() => setActiveTab('submitted')} label="Eingereicht" />
          </div>
        </div>

        {/* 📋 Submissions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.2em]">
              Zuletzt bearbeitet
            </h3>
            {isRefreshing && (
              <div className="flex items-center gap-2 text-primary-500">
                <Settings2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Wird aktualisiert</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50 dark:bg-dark-input/20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-dark-stroke text-center">
                <div className="w-20 h-20 rounded-3xl bg-white dark:bg-dark-card shadow-sm flex items-center justify-center mb-6 text-slate-300">
                  <LayoutGrid className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Keine Berichte gefunden</h4>
                <p className="text-slate-500 dark:text-dark-text-muted text-sm max-w-xs mx-auto">
                  Versuchen Sie einen anderen Suchbegriff oder erstellen Sie einen neuen Bericht.
                </p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/ submissions / ${sub.id} `)}
                  className="group relative bg-white dark:bg-dark-card border-2 border-slate-100 dark:border-dark-stroke rounded-[32px] p-5 md:p-6 transition-all hover:border-primary-400 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 cursor-pointer flex items-center gap-5"
                >
                  {/* Status Visual */}
                  <div className={`w - 14 h - 14 md: w - 16 md: h - 16 rounded - [24px] flex items - center justify - center shrink - 0 shadow - inner font - black text - lg md: text - xl transition - transform group - hover: scale - 110 ${sub.status === 'submitted'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    } `}>
                    {getInitials(sub.customer_name)}
                  </div>

                  {/* Info Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                        {sub.customer_name || 'Unbekannter Kunde'}
                      </h4>
                      <BadgeStatus status={sub.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-dark-text-muted text-xs font-semibold">
                        <FileText className="w-3.5 h-3.5 text-primary-500" />
                        <span className="truncate max-w-[150px] md:max-w-none">{sub.form_templates?.name || 'Standard-Bericht'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-dark-text-muted text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(sub.created_at).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-slate-400 dark:text-dark-text-muted text-xs font-medium">
                        <History className="w-3.5 h-3.5" />
                        <span>{formatDistanceToNow(new Date(sub.created_at), { addSuffix: true, locale: de })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-dark-stroke hidden sm:flex items-center justify-center text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 📱 Floating Mobile Button */}
      <button
        onClick={() => navigate('/visits/new')}
        className="fixed right-6 bottom-24 w-16 h-16 bg-primary-600 text-white rounded-[24px] shadow-2xl shadow-primary-600/40 z-40 lg:hidden flex items-center justify-center animate-bounce-subtle active:scale-90 transition-transform"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}

// 🧩 Shared Sub-components
function CardKPI({ value, label, icon: Icon, color, trend }: { value: number, label: string, icon: any, color: 'blue' | 'emerald' | 'amber', trend: string }) {
  const colors = {
    blue: 'from-blue-600 to-indigo-600 shadow-blue-500/20 text-blue-100',
    emerald: 'from-emerald-600 to-teal-600 shadow-emerald-500/20 text-emerald-100',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/20 text-amber-100'
  };

  return (
    <div className={`relative overflow - hidden bg - gradient - to - br ${colors[color]} p - 6 rounded - [32px] shadow - 2xl transition - transform hover: -translate - y - 1 h - 36 flex flex - col justify - between group`}>
      <Icon className="absolute -right-4 -top-4 w-24 h-24 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">{label}</span>
        <div className="text-4xl font-black text-white tracking-tight">{value}</div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/10 w-fit px-3 py-1 rounded-full border border-white/20">
        {trend}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex - 1 h - 12 rounded - [18px] text - sm font - black uppercase tracking - widest transition - all ${active
          ? 'bg-white dark:bg-dark-card text-primary-600 shadow-xl shadow-slate-200/50 dark:shadow-none'
          : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-white'
        } `}
    >
      {label}
    </button>
  );
}

function BadgeStatus({ status }: { status: string }) {
  if (status === 'submitted') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
        <CheckCircle2 className="w-3 h-3" />
        Synced
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
      <Clock className="w-3 h-3" />
      Draft
    </div>
  );
}
