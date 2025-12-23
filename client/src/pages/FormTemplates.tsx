import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { Plus, FileText, Copy, Trash2, Archive, Edit, Play } from 'lucide-react';

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

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.duplicateTemplate(id);
      loadTemplates();
    } catch (error: any) {
      console.error('Duplicate error:', error);
      setError(error.message || 'Failed to duplicate template');
    }
  };

  const handleArchive = async (id: string, archive: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.updateTemplate(id, { is_archived: archive });
      loadTemplates();
    } catch (error: any) {
      console.error('Archive error:', error);
      setError(error.message || `Failed to ${archive ? 'archive' : 'unarchive'} template`);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="animate-slide-up space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Form Templates</h1>
          <p className="text-slate-500 font-medium">Build and manage your professional forms.</p>
        </div>
        <button
          onClick={() => navigate('/templates/new')}
          className="btn-primary w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Create New
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <p className="text-red-800 font-bold text-sm">{error}</p>
          <button onClick={loadTemplates} className="text-red-600 font-black text-xs uppercase tracking-widest px-3 py-1 hover:bg-red-100 rounded-lg">Retry</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${filter === 'active'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${filter === 'archived'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Archived
        </button>
      </div>

      {/* Templates Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-bold text-sm">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="p-12 md:p-20 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-8">
            <FileText className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">No {filter} templates</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">
            {filter === 'active'
              ? "Start your business efficiency by creating your first professional form template today."
              : "You haven't archived any templates yet."}
          </p>
          {filter === 'active' && (
            <button onClick={() => navigate('/templates/new')} className="btn-primary">
              <Plus className="w-5 h-5" />
              Build One Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => navigate(`/templates/${template.id}/fill`)}
              className="group bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/templates/${template.id}/edit`); }}
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Edit Structure"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDuplicate(template.id, e)}
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {filter === 'active' ? (
                    <button
                      onClick={(e) => handleArchive(template.id, true, e)}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleDelete(template.id, e)}
                      className="p-2.5 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{template.name}</h3>
                <p className="text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed">
                  {template.description || 'Professional form ready for use.'}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Questions</span>
                  <span className="text-sm font-black text-slate-900">{template.fields?.length || 0}</span>
                </div>
                {template.category && (
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {template.category}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/templates/${template.id}/fill`); }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Filling
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
