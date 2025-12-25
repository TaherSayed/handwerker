import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { Plus, FileText, Copy, Trash2, Archive, Edit, MoreVertical } from 'lucide-react';
import Button from '../components/common/Button';
import { useNotificationStore } from '../store/notificationStore';

export default function FormTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: notifyError } = useNotificationStore();
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Formularvorlagen
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
            Verwalten Sie Ihre Berichtsstrukturen
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
              onClick={() => navigate(`/visits/new?templateId=${template.id}`)}
              className="card group hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition-all hover:shadow-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col h-full p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                {template.category && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg">
                    {template.category}
                  </span>
                )}
              </div>

              <div className="flex-1 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate">{template.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                  {template.description || 'Keine Beschreibung verfügbar.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                <div className="text-xs text-slate-400 font-medium">
                  {template.fields?.length || 0} Felder
                </div>

                {/* Context Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === template.id ? null : template.id);
                    }}
                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {openMenuId === template.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
                      <div className="p-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/templates/${template.id}/edit`); }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4 text-slate-400" />
                          Bearbeiten
                        </button>

                        <button
                          onClick={(e) => { handleDuplicate(template.id, e); setOpenMenuId(null); }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4 text-slate-400" />
                          Duplizieren
                        </button>

                        {filter === 'active' ? (
                          <button
                            onClick={(e) => { handleArchive(template.id, true, e); setOpenMenuId(null); }}
                            className="w-full text-left px-3 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Archivieren
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { handleArchive(template.id, false, e); setOpenMenuId(null); }}
                            className="w-full text-left px-3 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Wiederherstellen
                          </button>
                        )}

                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />

                        <button
                          onClick={(e) => { handleDelete(template.id, e); setOpenMenuId(null); }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Löschen
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Overlay to close menu when clicking outside */}
                {openMenuId === template.id && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
