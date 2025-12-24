import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { FileText, Clock, AlertTriangle, Plus, ArrowRight, ChevronRight, Zap, Settings } from 'lucide-react';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import { supabase } from '../services/supabase';
import { db } from '../services/db.service';
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
  const { user } = useAuthStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Stats (with timeout)
      const today = new Date().toISOString().split('T')[0];

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000));

      const [subs, temps] = await Promise.race([
        Promise.all([apiService.getSubmissions(), apiService.getTemplates()]),
        timeoutPromise
      ]) as [any[], any[]];

      const todayCount = subs.filter((s: any) => s.created_at.startsWith(today)).length;
      const activeCount = subs.filter((s: any) => s.status !== 'submitted').length;

      setStats({
        todayVisits: todayCount,
        activeVisits: activeCount,
        templates: temps.length,
        openTasks: 3 // Mocked for now
      });

      setRecentSubmissions(subs.slice(0, 5));
      setTemplates(temps);

      // 2. Check Local DB for unsynced
      const localSubs = await db.submissions.toArray();
      const unsyncedCount = localSubs.filter(s => !s.is_synced).length;

      if (unsyncedCount > 0) {
        // Show sync alert?
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Fallback values on error
      setStats({ todayVisits: 0, activeVisits: 0, templates: 0, openTasks: 0 });
      setRecentSubmissions([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-in fade-in duration-500">
        <div className="card p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-xl">
          <Skeleton variant="text" width="60%" className="h-7 mb-2" />
          <Skeleton variant="text" width="40%" height="16px" />
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Skeleton variant="rectangular" height="44px" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <Skeleton variant="text" width="50%" height="10px" className="mb-2" />
              <div className="flex items-end justify-between mt-1">
                <Skeleton variant="text" width="30px" height="24px" />
                <Skeleton variant="circular" width="20px" height="20px" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <Skeleton variant="text" width="100px" height="16px" />
              <Skeleton variant="text" width="40px" height="20px" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-3 flex items-center gap-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <Skeleton variant="circular" width="40px" height="40px" />
                  <div className="flex-1">
                    <Skeleton variant="text" width="60%" height="14px" className="mb-2" />
                    <Skeleton variant="text" width="30%" height="10px" />
                  </div>
                  <Skeleton variant="circular" width="20px" height="20px" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">

      {/* 1. Mobile Welcome & Quick Actions */}
      <div className="flex flex-col gap-4">
        {/* Welcome Header */}
        <div className="card p-5 bg-white border-slate-200 shadow-sm rounded-xl dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hallo, {user?.user_metadata?.full_name || 'Benutzer'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bereit für den heutigen Einsatz?</p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
            <Button
              onClick={() => navigate('/visits/new')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Neuer Einsatz
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Condensed) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div onClick={() => navigate('/submissions')} className="card p-4 hover:border-blue-400 cursor-pointer group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Einsätze Heute</p>
          <div className="flex items-end justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayVisits}</span>
            <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-1" />
          </div>
        </div>

        <div onClick={() => navigate('/submissions')} className="card p-4 hover:border-amber-400 cursor-pointer group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Aktiv</p>
          </div>
          <div className="flex items-end justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeVisits}</span>
            <AlertTriangle className="w-5 h-5 text-amber-500 mb-1" />
          </div>
        </div>

        <div onClick={() => navigate('/templates')} className="card p-4 hover:border-blue-400 cursor-pointer group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Vorlagen</p>
          <div className="flex items-end justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.templates}</span>
            <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-1" />
          </div>
        </div>

        <div onClick={() => navigate('/settings')} className="card p-4 hover:border-slate-400 cursor-pointer group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">System</p>
          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white leading-7">Optionen</span>
            <Settings className="w-5 h-5 text-slate-400 mb-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Recent Activity (List View) */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Letzte Einsätze</h2>
            <Button onClick={() => navigate('/submissions')} variant="ghost" size="sm" className="text-xs h-8">Alle</Button>
          </div>

          <div className="space-y-3">
            {recentSubmissions.length === 0 ? (
              <div className="card py-8 flex flex-col items-center justify-center text-center border-dashed bg-slate-50 dark:bg-slate-800/50">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Keine Einsätze gefunden.</p>
                <Button onClick={() => navigate('/visits/new')} variant="ghost" size="sm" className="mt-2 text-blue-600">Ersten starten</Button>
              </div>
            ) : (
              recentSubmissions.map((sub) => (
                <div key={sub.id}
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                  className="card p-3 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${sub.status === 'submitted'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}>
                    {sub.status === 'submitted' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">{sub.customer_name || 'Unbekannt'}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {sub.form_templates?.name || 'Formular'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* 4. Quick Templates */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Schnellstart</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {templates.slice(0, 4).map(t => (
              <button
                key={t.id}
                onClick={() => navigate(`/visits/new?template=${t.id}`)}
                className="card p-3 text-left hover:border-blue-400 transition-colors group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 -mr-1" />
                </div>
                <p className="font-bold text-xs text-slate-700 dark:text-slate-200 truncate select-none">{t.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 select-none">{t.description || 'Standardvorlage'}</p>
              </button>
            ))}
            <button
              onClick={() => navigate('/templates')}
              className="card p-3 flex flex-col items-center justify-center gap-2 border-dashed bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Plus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Mehr Vorlagen</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

