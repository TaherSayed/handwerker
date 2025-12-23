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
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Ihr Arbeitstag wird vorbereitet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Start New Visit Hero - Professional & Flat */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Einsatz starten
            </h1>
            <p className="text-slate-500 text-sm max-w-lg">
              Erstellen Sie einen neuen Bericht, erfassen Sie Fotos und Unterschriften direkt beim Kunden vor Ort.
            </p>
          </div>

          <Button
            onClick={() => navigate('/visits/new')}
            size="lg"
            variant="primary"
            className="shrink-0"
            icon={<PlusCircle className="w-5 h-5" />}
          >
            Neuer Einsatz
          </Button>
        </div>
      </div>

      {/* Stats Summary - Neutral Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Completed */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900 leading-none">{stats.submissions}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Erledigt</p>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900 leading-none">{stats.drafts}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Entwürfe</p>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900 leading-none">{stats.templates}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Vorlagen</p>
          </div>
        </div>

        {/* Settings Shortcut */}
        <div
          className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => navigate('/settings')}
        >
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Einstellungen</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Verwalten</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-black text-slate-900 leading-tight uppercase">Tools &<br />Optionen</p>
      </div>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Letzte Einsätze</h2>
          <Button
            onClick={() => navigate('/submissions')}
            variant="ghost"
            size="sm"
            icon={<ChevronRight className="w-4 h-4" />}
            className="text-slate-500 hover:text-blue-600"
          >
            Alle anzeigen
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentSubmissions.length === 0 ? (
            <div className="md:col-span-2 py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 mb-3 shadow-sm border border-slate-100">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Noch keine Einsätze</h3>
              <p className="text-slate-500 text-xs mt-1">Starten Sie Ihren ersten Einsatz oben.</p>
            </div>
          ) : (
            recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => navigate(`/submissions/${sub.id}`)}
                className="group flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${sub.status === 'submitted' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                  {sub.status === 'submitted' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {sub.customer_name || 'Laufkunde'}
                    </h4>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${sub.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {sub.status === 'submitted' ? 'Fertig' : 'Offen'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {sub.form_templates?.name || 'Standardformular'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {new Date(sub.created_at).toLocaleDateString('de-DE', {
                      day: 'numeric',
                      month: 'short',
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

      {/* Quick Templates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Schnellzugriff Vorlagen</h2>
          <Button
            onClick={() => navigate('/templates')}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-blue-600"
          >
            Verwalten
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => navigate(`/visits/new?templateId=${template.id}`)}
              className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-slate-900 text-sm mb-1 group-hover:text-blue-600 truncate">{template.name}</h4>
              <p className="text-slate-400 text-xs truncate">{template.category || 'Allgemein'}</p>
            </div>
          ))}

          <div
            onClick={() => navigate('/templates/new')}
            className="p-4 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all group text-center h-full min-h-[140px]"
          >
            <div className="w-8 h-8 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:border-blue-200 group-hover:text-blue-500 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-600 group-hover:text-blue-600">Neue Vorlage</p>
          </div>
        </div>
      </section>
    </div >
  );
}
