import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { FileText, ClipboardList, Plus, Clock, ChevronRight, Zap, Settings } from 'lucide-react';
import Button from '../components/common/Button';
import { supabase } from '../services/supabase';
import { db, LocalSubmission } from '../services/db.service';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [stats, setStats] = useState({
    templates: 0,
    submissions: 0,
    drafts: 0,
  });
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();

    const templatesSubscription = supabase
      .channel('dashboard-templates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'form_templates' }, loadDashboard)
      .subscribe();

    const submissionsSubscription = supabase
      .channel('dashboard-submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, loadDashboard)
      .subscribe();

    return () => {
      supabase.removeChannel(templatesSubscription);
      supabase.removeChannel(submissionsSubscription);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [templates, submissions, localDrafts] = await Promise.all([
        apiService.getTemplates({ is_archived: false }),
        apiService.getSubmissions({}),
        db.submissions.filter((s: LocalSubmission) => s.status === 'draft').toArray()
      ]) as [any[], any[], LocalSubmission[]];

      const submittedSubmissions = submissions?.filter((s: any) => s.status === 'submitted') || [];
      const remoteDrafts = submissions?.filter((s: any) => s.status === 'draft') || [];

      setStats({
        templates: templates?.length || 0,
        submissions: submittedSubmissions.length || 0,
        drafts: remoteDrafts.length + (localDrafts?.length || 0),
      });

      setRecentTemplates(templates?.slice(0, 4) || []);
      setRecentSubmissions(submissions?.slice(0, 5) || []);
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero / Quick Actions Section */}
      <section className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 card flex flex-col justify-center bg-gradient-to-br from-white to-slate-50">
          <h1 className="text-xl font-bold text-slate-900">Hallo, {profile?.full_name || 'Handwerker'}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Sie haben {stats.drafts} offene Entwürfe und {stats.submissions} erledigte Aufträge.</p>
        </div>
        <div className="md:w-auto">
          <Button
            onClick={() => navigate('/visits/new')}
            variant="primary"
            size="lg"
            className="w-full md:w-auto h-full min-h-[5rem] text-lg shadow-blue-500/20"
            icon={<Plus className="w-6 h-6" />}
          >
            Neuer Einsatz
          </Button>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div
          onClick={() => navigate('/submissions')}
          className="card hover:border-green-300 cursor-pointer group p-4 md:p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Erledigt</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{stats.submissions}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="card border-amber-200/50 hover:border-amber-300 cursor-pointer group p-4 md:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-600/80 text-xs font-bold uppercase tracking-wider">Entwürfe</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{stats.drafts}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="card hover:border-blue-300 cursor-pointer group p-4 md:p-5" onClick={() => navigate('/templates')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Vorlagen</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{stats.templates}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="card hover:border-slate-300 cursor-pointer group p-4 md:p-5" onClick={() => navigate('/settings')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">System</p>
              <p className="text-sm font-bold text-slate-900 mt-2">Einstellungen</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Letzte Aktivitäten
            </h2>
            <Button onClick={() => navigate('/submissions')} variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wide">Alle anzeigen</Button>
          </div>

          <div className="space-y-2">
            {recentSubmissions.length === 0 ? (
              <div className="card py-12 flex flex-col items-center justify-center text-center border-dashed">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <p className="text-slate-900 font-medium">Keine Einsätze</p>
                <p className="text-slate-500 text-sm">Starten Sie Ihren ersten Job.</p>
              </div>
            ) : (
              recentSubmissions.map((sub) => (
                <div key={sub.id}
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                  className="card p-4 flex items-center gap-4 hover:border-blue-400/50 cursor-pointer group hover:-translate-y-0.5 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${sub.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {sub.status === 'submitted' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 truncate">{sub.customer_name || 'Unbekannter Kunde'}</h3>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(sub.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                      <FileText className="w-3 h-3" />
                      {sub.form_templates?.name || 'Formular'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Templates */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 px-1">Schnellstart</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              onClick={() => navigate('/templates/new')}
              className="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-bold text-sm">Neue Vorlage</span>
                <span className="block text-xs text-blue-100">Editor öffnen</span>
              </div>
            </button>

            {recentTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/visits/new?templateId=${t.id}`)}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 text-left group"
              >
                <div className="w-8 h-8 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-slate-900 text-sm truncate group-hover:text-blue-700">{t.name}</span>
                  <span className="block text-xs text-slate-400 truncate">{t.category || 'Allgemein'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
