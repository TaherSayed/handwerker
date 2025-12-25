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
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

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

  const handleRename = async (id: string, name: string) => {
    try {
      await apiService.updateTemplate(id, { name });
      setTemplates(templates.map(t => t.id === id ? { ...t, name } : t));
      success('Vorlage umbenannt');
      setEditingTemplateId(null);
    } catch (error: any) {
      notifyError('Fehler', 'Umbenennen fehlgeschlagen');
    }
  };

  return (
    <div className="space-y-8 pb-32 lg:pb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
            Formularvorlagen
          </h1>
          <p className="text-slate-400 dark:text-dark-text-muted font-medium text-sm mt-0.5">
            Verwalten Sie Ihre Berichtsstrukturen
          </p>
        </div>
        <Button
          onClick={() => navigate('/templates/new')}
          variant="secondary"
          className="w-full md:w-auto justify-center bg-white dark:bg-dark-card border border-border-light dark:border-dark-stroke text-slate-700 dark:text-dark-text-body hover:bg-slate-50 dark:hover:bg-dark-highlight shadow-sm h-12"
          icon={<Plus className="w-5 h-5 text-slate-400" />}
        >
          Neue Vorlage
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border-light dark:border-dark-stroke px-1">
        <div className="flex gap-8">
          {[
            { id: 'active', label: 'Aktiv' },
            { id: 'archived', label: 'Archiviert' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`pb-4 text-sm font-medium transition-all relative ${filter === f.id
                ? 'text-primary-light dark:text-primary-dark'
                : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {f.label}
              {filter === f.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light dark:bg-primary-dark rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex items-center justify-between mx-1">
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
          <button onClick={loadTemplates} className="text-red-600 dark:text-red-400 text-xs font-bold hover:underline px-2 py-1">Wiederholen</button>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-50 dark:bg-dark-card rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-dark-card text-slate-300 dark:text-dark-text-muted rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Keine {filter === 'active' ? 'aktiven' : 'archivierten'} Vorlagen</h3>
          <p className="text-slate-500 dark:text-dark-text-muted max-w-sm mx-auto mb-8 text-sm px-4">
            {filter === 'active'
              ? "Erstellen Sie Ihre erste Vorlage, um standardisierte Berichte zu ermöglichen."
              : "Hier finden Sie Ihre archivierten Vorlagen."}
          </p>
          {filter === 'active' && (
            <Button
              onClick={() => navigate('/templates/new')}
              variant="primary"
              className="px-10 h-14 shadow-xl shadow-primary-light/20 mx-auto"
            >
              Vorlage erstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-1">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => navigate(`/visits/new?templateId=${template.id}`)}
              className="card group hover:border-primary-light dark:hover:border-primary-dark cursor-pointer transition-all hover:shadow-xl hover:shadow-primary-light/5 bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke flex flex-col h-full p-6 lg:p-7 rounded-3xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark rounded-2xl flex items-center justify-center shrink-0 border border-primary-light/10">
                  <FileText className="w-6 h-6" />
                </div>
                {template.category && (
                  <span className="badge badge-success">
                    {template.category}
                  </span>
                )}
              </div>

              <div className="flex-1 mb-5">
                {editingTemplateId === template.id ? (
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => handleRename(template.id, newName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(template.id, newName);
                      if (e.key === 'Escape') setEditingTemplateId(null);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-primary-light outline-none bg-white dark:bg-dark-input dark:text-white font-bold mb-2"
                  />
                ) : (
                  <h3 className="text-lg font-medium text-slate-900 dark:text-dark-text-head mb-2 truncate group-hover:text-primary-light transition-colors">{template.name}</h3>
                )}
                <p className="text-slate-500 dark:text-dark-text-muted text-sm line-clamp-2 leading-relaxed font-medium">
                  {template.description || 'Keine Beschreibung verfügbar.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-border-light dark:border-dark-stroke mt-auto">
                <div className="text-[11px] text-slate-400 dark:text-dark-text-muted font-medium">
                  {template.fields?.length || 0} Felder
                </div>

                {/* Context Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === template.id ? null : template.id);
                    }}
                    className="p-3 -mr-3 text-slate-400 dark:text-dark-text-muted hover:text-primary-light dark:hover:text-primary-dark rounded-full hover:bg-slate-50 dark:hover:bg-dark-highlight transition-all active:scale-90"
                  >
                    <MoreVertical className="w-6 h-6" />
                  </button>

                  {openMenuId === template.id && (
                    <div className="absolute right-0 bottom-full mb-3 w-56 bg-white dark:bg-dark-card rounded-2xl shadow-2xl shadow-black/20 border border-border-light dark:border-dark-stroke z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
                      <div className="p-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/templates/${template.id}/edit`); }}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-dark-text-body hover:bg-slate-50 dark:hover:bg-dark-highlight rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-400" />
                          Design Bearbeiten
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewName(template.name);
                            setEditingTemplateId(template.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-dark-text-body hover:bg-slate-50 dark:hover:bg-dark-highlight rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-400" />
                          Umbenennen
                        </button>

                        <button
                          onClick={(e) => { handleDuplicate(template.id, e); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-dark-text-body hover:bg-slate-50 dark:hover:bg-dark-highlight rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <Copy className="w-4 h-4 text-slate-400" />
                          Duplizieren
                        </button>

                        <div className="h-px bg-border-light dark:bg-dark-stroke my-2 mx-2" />

                        {filter === 'active' ? (
                          <button
                            onClick={(e) => { handleArchive(template.id, true, e); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-warning-light dark:text-warning-dark hover:bg-warning-light/5 rounded-xl flex items-center gap-3 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                            Archivieren
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { handleArchive(template.id, false, e); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-success-light dark:text-success-dark hover:bg-success-light/5 rounded-xl flex items-center gap-3 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                            Wiederherstellen
                          </button>
                        )}

                        <button
                          onClick={(e) => { handleDelete(template.id, e); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-error-light hover:bg-error-light/5 rounded-xl flex items-center gap-3 transition-colors"
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
          ))
          }
        </div >
      )}
    </div >
  );
}
