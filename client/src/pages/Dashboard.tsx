import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { FileText, ClipboardList, Plus, Clock, ChevronRight, Sparkles, Zap } from 'lucide-react';
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
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Ihr Arbeitstag wird vorbereitet...</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8">
      {/* Start New Visit Hero */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-violet-500 rounded-full opacity-20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Bereit für einen<br />neuen Einsatz?
            </h1>
            <p className="text-indigo-200 font-medium md:text-lg max-w-md">
              Starten Sie einen Einsatz, um Daten, Fotos und Unterschriften direkt vor Ort zu erfassen.
            </p>
          </div>

          <button
            onClick={() => navigate('/visits/new')}
            className="group relative flex items-center justify-center gap-3 bg-white text-indigo-900 px-10 py-6 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/20 shrink-0"
          >
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            EINSATZ STARTEN
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4 bg-white border-slate-100 h-24">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.submissions}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Erledigt</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-white border-slate-100 h-24">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.drafts}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Entwürfe</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-white border-slate-100 h-24">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.templates}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vorlagen</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-white border-slate-100 h-24 cursor-pointer hover:border-indigo-200" onClick={() => navigate('/settings')}>
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 leading-tight uppercase">Tools &<br />Optionen</p>
          </div>
        </div>
      </div>

      {/* Primary Section: Recent Visits */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase text-sm tracking-widest">Letzte Einsätze</h2>
          </div>
          <button
            onClick={() => navigate('/submissions')}
            className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1"
          >
            Verlauf <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentSubmissions.length === 0 ? (
            <div className="md:col-span-2 p-12 bg-white rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Noch keine Einsätze verzeichnet</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Klicken Sie oben auf "Einsatz starten", um Ihren ersten Bericht zu erstellen.</p>
            </div>
          ) : (
            recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => navigate(`/submissions/${sub.id}`)}
                className="group flex items-start gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${sub.status === 'submitted' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                  {sub.status === 'submitted' ? <Zap className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base truncate">
                      {sub.customer_name || 'Laufkunde'}
                    </h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg mt-1 shrink-0 ${sub.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {sub.status === 'submitted' ? 'Eingereicht' : 'Entwurf'}
                    </span>
                  </div>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-0.5">
                    {sub.form_templates?.name || 'Standardformular'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(sub.created_at).toLocaleDateString('de-DE', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Secondary Section: Quick Templates */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase text-sm tracking-widest">Vorlagen</h2>
          </div>
          <button
            onClick={() => navigate('/templates')}
            className="text-slate-500 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            Verwalten
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {recentTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => navigate(`/visits/new?templateId=${template.id}`)}
              className="flex-shrink-0 w-64 p-5 bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer text-center group"
            >
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">{template.name}</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest line-clamp-1">{template.category || 'Standard'}</p>
            </div>
          ))}

          <div
            onClick={() => navigate('/templates/new')}
            className="flex-shrink-0 w-64 p-5 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 group"
          >
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">Neue Vorlage</p>
          </div>
        </div>
      </section>
    </div>
  );
}
