import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { FileText, ClipboardList, Plus } from 'lucide-react';

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
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [templates, submissions] = await Promise.all([
        apiService.getTemplates({ is_archived: false }),
        apiService.getSubmissions({}),
      ]) as [any[], any[]];

      setStats({
        templates: templates?.length || 0,
        submissions: submissions?.filter((s: any) => s.status === 'submitted').length || 0,
        drafts: submissions?.filter((s: any) => s.status === 'draft').length || 0,
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to OnSite Forms</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadDashboard}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Templates</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.templates}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Submissions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.submissions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.drafts}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/templates/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Template
          </button>
        </div>
      </div>

      {/* Recent Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Templates</h2>
          {recentTemplates.length === 0 ? (
            <p className="text-gray-500 text-sm">No templates yet</p>
          ) : (
            <ul className="space-y-3">
              {recentTemplates.map((template) => (
                <li
                  key={template.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                >
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.description || 'No description'}</p>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h2>
          {recentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-sm">No submissions yet</p>
          ) : (
            <ul className="space-y-3">
              {recentSubmissions.map((submission) => (
                <li
                  key={submission.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => navigate(`/submissions/${submission.id}`)}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {submission.customer_name || 'Unnamed'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {submission.form_templates?.name || 'Template'}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      submission.status === 'submitted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
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
