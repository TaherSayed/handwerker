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
  const [error, setError] = useState<string | null>(null);

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
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Designing your day...</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
            Hey there! <Sparkles className="inline-block w-6 h-6 text-amber-400 mb-1" />
          </h1>
          <p className="text-slate-500 font-medium md:text-lg">Here's a quick look at your business.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 border-none">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <FileText className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest mb-1">Templates</p>
              <h3 className="text-4xl font-black text-white">{stats.templates}</h3>
            </div>
            <p className="mt-4 text-indigo-100/80 text-sm font-medium">Ready for your team</p>
          </div>
        </div>

        <div className="card group relative overflow-hidden bg-white hover:border-violet-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
              <ClipboardList className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.submissions}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Submissions</p>
            <p className="text-slate-400 text-[10px] font-bold mt-1">Successfully completed</p>
          </div>
        </div>

        <div className="card group relative overflow-hidden bg-white hover:border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.drafts}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Unfinished Drafts</p>
            <p className="text-slate-400 text-[10px] font-bold mt-1">Local & Cloud sync</p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Templates Quick Start */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900">Your Templates</h2>
            <button
              onClick={() => navigate('/templates')}
              className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => navigate(`/templates/${template.id}/fill`)}
                className="group flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer"
              >
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{template.name}</h4>
                  <p className="text-slate-400 text-xs font-medium truncate max-w-[200px]">{template.description || 'Quick start template'}</p>
                </div>
                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/templates/new')}
              className="w-full h-16 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Build a New Form
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900">Recent Submissions</h2>
            <button
              onClick={() => navigate('/submissions')}
              className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
            >
              History
            </button>
          </div>

          <div className="space-y-3">
            {recentSubmissions.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <p className="text-slate-400 font-bold text-sm">No activity yet</p>
                <p className="text-slate-300 text-xs mt-1">Start by filling out a template</p>
              </div>
            ) : (
              recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                  className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${sub.status === 'submitted' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {sub.status === 'submitted' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">{sub.customer_name || 'Anonymous Customer'}</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{sub.form_templates?.name || 'Form'}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${sub.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {sub.status}
                    </div>
                    <p className="text-[10px] text-slate-300 font-bold mt-1">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Pro Tip Tooltip-like element */}
      <div className="bg-indigo-900 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500 rounded-full opacity-20 blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-violet-500 rounded-full opacity-20 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">Pro Tip: Offline Sync</h4>
            <p className="text-indigo-200 text-sm font-medium leading-relaxed">You can keep working even without internet. Your forms will automatically save to your phone and sync up the moment you're back online.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
