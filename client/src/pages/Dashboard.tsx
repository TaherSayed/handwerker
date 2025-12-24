import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { FileText, ClipboardList, Plus, Clock, ChevronRight, Sparkles, Zap, PlusCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { supabase } from '../services/supabase';
import { db, LocalSubmission } from '../services/db.service';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    templates: 0,
    submissions: 0,
    drafts: 0,
  });
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();

    const templatesSubscription = supabase
      .channel('dashboard-templates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'form_templates' }, () => {
        loadDashboard();
      })
      .subscribe();

    const submissionsSubscription = supabase
      .channel('dashboard-submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        loadDashboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(templatesSubscription);
      supabase.removeChannel(submissionsSubscription);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

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

      setRecentTemplates(templates?.slice(0, 3) || []);
      setRecentSubmissions(submissions?.slice(0, 5) || []);
    } catch (error: any) {
      console.error('Load dashboard error:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Ihr Arbeitstag wird vorbereitet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Start New Visit Hero - Professional & Flat */}
      <div className="bg-white rounded-[2rem] border border-slate-100/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative space-y-2 text-center md:text-left z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Willkommen zurück
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Starten Sie einen neuen Einsatz oder verwalten Sie Ihre laufenden Berichte.
          </p>
        </div>

        <Button
          onClick={() => navigate('/visits/new')}
          size="lg"
          variant="primary"
          className="shrink-0 relative z-10 shadow-blue-500/25"
          icon={<PlusCircle className="w-5 h-5" />}
        >
          Neuer Einsatz
        </Button>
      </div>

      {/* Stats Summary - Neutral Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed */}
        <div className="card flex items-center gap-4 hover:border-green-200/50 transition-colors group cursor-default">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{stats.submissions}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Erledigt</p>
          </div>
        </div>

        {/* Drafts */}
        <div className="card flex items-center gap-4 hover:border-amber-200/50 transition-colors group cursor-default">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{stats.drafts}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Entwürfe</p>
          </div>
        </div>

        {/* Templates */}
        <div className="card flex items-center gap-4 hover:border-blue-200/50 transition-colors group cursor-default">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{stats.templates}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Vorlagen</p>
          </div>
        </div>

        {/* Settings Shortcut */}
        <div
          className="card flex items-center gap-4 cursor-pointer card-hover group"
          onClick={() => navigate('/settings')}
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Einstellungen</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Verwalten</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Column */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900">Letzte Aktivitäten</h2>
            <Button
              onClick={() => navigate('/submissions')}
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="w-4 h-4" />}
              className="text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-wide"
            >
              Alle
            </Button>
          </div>

          <div className="space-y-3">
            {recentSubmissions.length === 0 ? (
              <div className="py-16 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm border border-slate-100">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900">Keine Einsätze gefunden</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">Starten Sie Ihren ersten Einsatz, um hier die Historie zu sehen.</p>
              </div>
            ) : (
              recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                  className="group flex items-center gap-4 p-4 bg-white rounded-[1.5rem] border border-slate-100/80 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${sub.status === 'submitted' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {sub.status === 'submitted' ? <Zap className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {sub.customer_name || 'Laufkunde'}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        {new Date(sub.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-slate-500 truncate">
                        {sub.form_templates?.name || 'Standardformular'}
                      </p>
                      {sub.status !== 'submitted' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Templates Column */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900">Vorlagen</h2>
            <Button
              onClick={() => navigate('/templates')}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-wide"
            >
              Verwalten
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div
              onClick={() => navigate('/templates/new')}
              className="p-4 bg-blue-50/50 rounded-[1.5rem] border border-dashed border-blue-200 flex items-center gap-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group"
            >
              <div className="w-10 h-10 bg-white text-blue-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-blue-700">Neue Vorlage</p>
            </div>

            {recentTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => navigate(`/visits/new?templateId=${template.id}`)}
                className="p-4 bg-white rounded-[1.5rem] border border-slate-100/80 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer group flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 truncate transition-colors">{template.name}</h4>
                  <p className="text-slate-400 text-xs truncate font-medium mt-0.5">{template.category || 'Allgemein'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div >
  );
}
