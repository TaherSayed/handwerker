import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { FileText, ClipboardList, Plus, Clock } from 'lucide-react';
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

    // Subscribe to real-time updates
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

      setRecentTemplates(templates?.slice(0, 5) || []);
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={loadDashboard}
              className="text-red-600 hover:text-red-800 font-semibold text-sm px-4 py-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Templates</p>
              <p className="text-4xl font-bold text-gray-900">{stats.templates}</p>
              <p className="text-xs text-blue-600 mt-1">Active forms</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Submissions</p>
              <p className="text-4xl font-bold text-gray-900">{stats.submissions}</p>
              <p className="text-xs text-green-600 mt-1">Completed</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Drafts</p>
              <p className="text-4xl font-bold text-gray-900">{stats.drafts}</p>
              <p className="text-xs text-amber-600 mt-1">Local & Remote</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/templates/new')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Create New Template
          </button>
          {recentTemplates.length > 0 && (
            <button
              onClick={() => navigate(`/templates/${recentTemplates[0].id}/fill`)}
              className="btn-primary"
            >
              <ClipboardList className="w-5 h-5" />
              Fill Form
            </button>
          )}
          <button
            onClick={() => navigate('/submissions')}
            className="btn-secondary"
          >
            <ClipboardList className="w-5 h-5" />
            View All Submissions
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          💡 Tip: Create templates and fill forms directly from the web app
        </p>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Templates</h2>
            <button
              onClick={() => navigate('/templates')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </button>
          </div>
          {recentTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No templates yet</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentTemplates.map((template) => (
                <li
                  key={template.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500">{template.description || 'No description'}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Submissions</h2>
            <button
              onClick={() => navigate('/submissions')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </button>
          </div>
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No submissions yet</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentSubmissions.map((submission) => (
                <li
                  key={submission.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                  onClick={() => navigate(`/submissions/${submission.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${submission.status === 'submitted' ? 'bg-green-100' : 'bg-amber-100'
                      }`}>
                      <ClipboardList className={`w-5 h-5 ${submission.status === 'submitted' ? 'text-green-600' : 'text-amber-600'
                        }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {submission.customer_name || 'Unnamed'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {submission.form_templates?.name || 'Template'}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${submission.status === 'submitted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                    {submission.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
