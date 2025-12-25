import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { FileText, Clock, Plus, ArrowRight, ChevronRight, Zap, Settings } from 'lucide-react';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayVisits: 0,
    activeVisits: 0,
    templates: 0,
    openTasks: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuthStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel fetch with cached fallback logic inside apiService
      const [subs, temps] = await Promise.all([
        apiService.getSubmissions(),
        apiService.getTemplates()
      ]) as [any[], any[]];

      const today = new Date().toISOString().split('T')[0];
      const todayCount = subs.filter((s: any) => s.created_at.startsWith(today)).length;
      const activeCount = subs.filter((s: any) => s.status !== 'submitted').length;

      setStats({
        todayVisits: todayCount,
        activeVisits: activeCount,
        templates: temps.length,
        openTasks: subs.filter((s: any) => s.status === 'draft').length
      });

      setRecentSubmissions(subs.slice(0, 5));
      setTemplates(temps);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Stats remain 0 by default
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-32 animate-in fade-in duration-700">
        {/* Welcome Skeleton */}
        <div className="card p-6 bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-3xl">
          <Skeleton variant="text" width="40%" className="h-8 mb-2" />
          <Skeleton variant="text" width="30%" className="h-4" />
          <div className="mt-6 pt-6 border-t border-border-light dark:border-dark-stroke">
            <Skeleton variant="rectangular" height="56px" className="rounded-2xl" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-3xl">
              <Skeleton variant="text" width="60%" className="h-3 mb-4" />
              <div className="flex items-end justify-between">
                <Skeleton variant="text" width="40px" className="h-8" />
                <Skeleton variant="circular" width="24px" height="24px" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-4">
            <Skeleton variant="text" width="120px" className="h-4 px-1" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-4 flex items-center gap-4 bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-2xl">
                  <Skeleton variant="rectangular" width="48px" height="48px" className="rounded-xl" />
                  <div className="flex-1">
                    <Skeleton variant="text" width="50%" className="h-4 mb-2" />
                    <Skeleton variant="text" width="30%" className="h-3" />
                  </div>
                  <Skeleton variant="circular" width="24px" height="24px" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Handwerker';

  return (
    <div className="space-y-8 pb-32 animate-fade-in">

      {/* 1. Welcome & Primary Action */}
      <div className="card p-6 bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-3xl shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hallo, {displayName}</h1>
            <p className="text-slate-500 dark:text-dark-text-muted font-semibold text-sm">Bereit für Ihren nächsten Einsatz?</p>
          </div>
          {profile?.company_logo_url && (
            <img
              src={profile.company_logo_url}
              alt="Logo"
              className="h-12 w-auto object-contain rounded-lg opacity-80"
            />
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border-light dark:border-dark-stroke">
          <Button
            onClick={() => navigate('/visits/new')}
            variant="primary"
            className="w-full h-14 text-base font-bold shadow-xl shadow-primary-light/20 rounded-2xl"
            icon={<Plus className="w-6 h-6 mr-1" />}
          >
            Neuer Einsatzbericht
          </Button>
        </div>
      </div>

      {/* 2. Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/submissions')} className="card p-5 hover:border-primary-light dark:hover:border-primary-dark cursor-pointer group bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-3xl transition-all active:scale-[0.98]">
          <p className="text-slate-400 dark:text-dark-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">Heute</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.todayVisits}</span>
            <FileText className="w-6 h-6 text-primary-light dark:text-primary-dark opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div onClick={() => navigate('/submissions')} className="card p-5 hover:border-warning-light dark:hover:border-warning-dark cursor-pointer group bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-3xl transition-all active:scale-[0.98]">
          <p className="text-slate-400 dark:text-dark-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">Entwürfe</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.openTasks}</span>
            <Clock className="w-6 h-6 text-warning-light dark:text-warning-dark opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div onClick={() => navigate('/templates')} className="card p-5 hover:border-primary-light dark:hover:border-primary-dark cursor-pointer group bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-3xl transition-all active:scale-[0.98]">
          <p className="text-slate-400 dark:text-dark-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">Vorlagen</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.templates}</span>
            <Zap className="w-6 h-6 text-primary-light dark:text-primary-dark opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div onClick={() => navigate('/settings')} className="card p-5 hover:border-slate-400 cursor-pointer group bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-3xl transition-all active:scale-[0.98]">
          <p className="text-slate-400 dark:text-dark-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">Profil</p>
          <div className="flex items-end justify-between">
            <span className="text-lg font-black text-slate-900 dark:text-white mb-1">Optionen</span>
            <Settings className="w-6 h-6 text-slate-300 dark:text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Recent Activity */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em]">Letzte Einsätze</h2>
            <Button onClick={() => navigate('/submissions')} variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-8 px-3">Alle Berichte</Button>
          </div>

          <div className="space-y-3">
            {recentSubmissions.length === 0 ? (
              <div className="card py-12 flex flex-col items-center justify-center text-center border-dashed border-2 bg-slate-50 dark:bg-dark-card/30 rounded-3xl border-border-light dark:border-dark-stroke">
                <FileText className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4" />
                <p className="text-slate-500 dark:text-dark-text-muted text-sm font-semibold max-w-[200px]">Noch keine Einsätze erfasst.</p>
                <Button onClick={() => navigate('/visits/new')} variant="ghost" className="mt-4 text-primary-light">Jetzt starten</Button>
              </div>
            ) : (
              recentSubmissions.map((sub) => (
                <div key={sub.id}
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                  className="card p-4 flex items-center gap-4 active:scale-[0.99] transition-all cursor-pointer bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-2xl hover:border-primary-light dark:hover:border-primary-dark"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${sub.status === 'submitted'
                    ? 'bg-success-light/10 border-success-light/20 text-success-light'
                    : 'bg-warning-light/10 border-warning-light/20 text-warning-light'
                    }`}>
                    {sub.status === 'submitted' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-base leading-tight mb-1">{sub.customer_name || 'Unbekannt'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-success !bg-slate-100 dark:!bg-dark-input !text-[9px] !text-slate-500 dark:!text-dark-text-muted truncate max-w-[140px]">
                        {sub.form_templates?.name || 'Protokoll'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(sub.created_at).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* 4. Quick Start Templates */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em]">Schnellstart</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {templates.slice(0, 4).map(t => (
              <button
                key={t.id}
                onClick={() => navigate(`/templates/${t.id}/fill`)}
                className="card p-4 text-left hover:border-primary-light dark:hover:border-primary-dark transition-all group bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-2xl active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light/5 dark:bg-primary-dark/5 flex items-center justify-center text-primary-light dark:text-primary-dark group-hover:bg-primary-light/10 transition-colors border border-primary-light/10">
                    <FileText className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-200 dark:text-slate-800 group-hover:text-primary-light transition-all -mr-1" />
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-dark-text-body truncate select-none mb-1">{t.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-semibold uppercase tracking-wider select-none truncate">
                  {t.fields?.length || 0} Felder
                </p>
              </button>
            ))}
            <button
              onClick={() => navigate('/templates')}
              className="card p-5 flex flex-col items-center justify-center gap-3 border-dashed border-2 bg-slate-50 dark:bg-dark-card/30 hover:bg-slate-100 dark:hover:bg-dark-highlight border-border-light dark:border-dark-stroke rounded-2xl transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <Plus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">Mehr</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

