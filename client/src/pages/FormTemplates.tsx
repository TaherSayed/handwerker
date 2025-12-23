import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { Plus, FileText, Copy, Trash2, Archive, Edit } from 'lucide-react';

export default function FormTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'archived'>('active');

  useEffect(() => {
    loadTemplates();
  }, [filter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTemplates({
        is_archived: filter === 'archived',
      }) as any[];
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Load templates error:', error);
      setError(error.message || 'Failed to load templates. Please try again.');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiService.duplicateTemplate(id);
      loadTemplates();
    } catch (error: any) {
      console.error('Duplicate error:', error);
      setError(error.message || 'Failed to duplicate template');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiService.updateTemplate(id, { is_archived: true });
      loadTemplates();
    } catch (error: any) {
      console.error('Archive error:', error);
      setError(error.message || 'Failed to archive template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await apiService.deleteTemplate(id);
      loadTemplates();
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error.message || 'Failed to delete template');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Form Templates</h1>
          <p className="text-gray-600 text-lg">Create and manage your form templates</p>
        </div>
        <button
          onClick={() => navigate('/templates/new')}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          New Template
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={loadTemplates}
              className="text-red-600 hover:text-red-800 font-semibold text-sm px-4 py-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            filter === 'active'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            filter === 'archived'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Create your first form template to get started with OnSite Forms</p>
          <button
            onClick={() => navigate('/templates/new')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="card p-6 hover:scale-[1.02] transition-transform duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/templates/${template.id}/edit`)}
                    className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {filter === 'active' ? (
                    <button
                      onClick={() => handleArchive(template.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                {template.description || 'No description'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">{template.fields?.length || 0} fields</span>
                {template.category && (
                  <span className="badge bg-blue-100 text-blue-700">{template.category}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

