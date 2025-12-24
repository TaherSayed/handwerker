import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { Plus, FileText, Copy, Trash2, Archive, Edit } from 'lucide-react';
import Button from '../components/common/Button';
import { useNotificationStore } from '../store/notificationStore';

export default function FormTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: notifyError } = useNotificationStore();
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
      setError(error.message || 'Laden der Vorlagen fehlgeschlagen. Bitte erneut versuchen.');
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
      success('Vorlage dupliziert', 'Eine Kopie wurde erfolgreich erstellt.');
    } catch (error: any) {
      console.error('Duplicate error:', error);
      notifyError('Fehler', error.message || 'Duplizieren fehlgeschlagen');
    }
  };

  const handleArchive = async (id: string, archive: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.updateTemplate(id, { is_archived: archive });
      loadTemplates();
      success(archive ? 'Vorlage archiviert' : 'Vorlage aktiviert');
    } catch (error: any) {
      console.error('Archive error:', error);
      notifyError('Fehler', error.message || `Vorlage konnte nicht ${archive ? 'archiviert' : 'aktiviert'} werden`);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Sind Sie sicher, dass Sie diese Vorlage endgültig löschen möchten?')) return;
    try {
      await apiService.deleteTemplate(id);
      loadTemplates();
      success('Vorlage gelöscht', 'Die Vorlage wurde dauerhaft entfernt.');
    } catch (error: any) {
      console.error('Delete error:', error);
      notifyError('Fehler', error.message || 'Löschen fehlgeschlagen');
    }
  };

  return (
    <div className="space-y-8 pb-32 lg:pb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Formularvorlagen
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Verwalten Sie Ihre Vorlagen für Berichte und Protokolle.
          </p>
        </div>
        <Button
          onClick={() => navigate('/templates/new')}
          variant="secondary"
          className="w-full md:w-auto justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          icon={<Plus className="w-4 h-4 text-slate-500" />}
        >
          Neue Vorlage
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {[
            { id: 'active', label: 'Aktiv' },
            { id: 'archived', label: 'Archiviert' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${filter === f.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
          <button onClick={loadTemplates} className="text-red-600 text-xs font-bold hover:underline">Wiederholen</button>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Keine {filter === 'active' ? 'aktiven' : 'archivierten'} Vorlagen</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm">
            {filter === 'active'
              ? "Erstellen Sie Ihre erste Vorlage, um standardisierte Berichte zu ermöglichen."
              : "Hier finden Sie Ihre archivierten Vorlagen."}
          </p>
          {filter === 'active' && (
            <Button
              onClick={() => navigate('/templates/new')}
              variant="primary"
            >
              Erste Vorlage erstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => navigate(`/templates/${template.id}/fill`)}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                {template.category && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                    {template.category}
                  </span>
                )}
              </div>

              <div className="flex-1 mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{template.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                  {template.description || 'Keine Beschreibung verfügbar.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                <div className="text-xs text-slate-400 font-medium">
                  {template.fields?.length || 0} Felder
                </div>

                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/templates/${template.id}/edit`); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDuplicate(template.id, e)}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Kopieren"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {filter === 'active' ? (
                    <button
                      onClick={(e) => handleArchive(template.id, true, e)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Archivieren"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleDelete(template.id, e)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
