import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { Plus, FileText, Copy, Trash2, Archive, Edit, Play } from 'lucide-react';
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
    <div className="animate-slide-up space-y-12 pb-32 lg:pb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 uppercase tracking-tighter leading-none">
            Formularvorlagen
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] ml-1">
            Erstellen und verwalten Sie Ihre professionellen Einsatz-Formulare
          </p>
        </div>
        <Button
          onClick={() => navigate('/templates/new')}
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />}
        >
          Neu erstellen
        </Button>
      </div>

      {/* Filter & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Filter Tabs */}
        <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
          {[
            { id: 'active', label: 'Aktiv' },
            { id: 'archived', label: 'Archiviert' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f.id
                ? 'bg-white text-indigo-600 shadow-xl shadow-slate-200'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-3xl p-6 shadow-sm flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black">!</div>
            <p className="text-red-800 font-bold text-sm tracking-tight">{error}</p>
          </div>
          <button onClick={loadTemplates} className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 hover:bg-red-100 rounded-xl transition-colors">Wiederholen</button>
        </div>
      )}

      {/* Templates Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-80 bg-slate-50 border-none animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="p-16 md:p-32 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center text-center shadow-2xl shadow-slate-200/50">
          <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-10 transform -rotate-6">
            <FileText className="w-14 h-14" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Keine {filter === 'active' ? 'aktiven' : 'archivierten'} Vorlagen</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mb-12 text-lg">
            {filter === 'active'
              ? "Bereit für mehr Struktur? Erstellen Sie Ihre erste professionelle Berichts-Vorlage."
              : "Archivierte Vorlagen werden hier zur Referenz angezeigt."}
          </p>
          {filter === 'active' && (
            <button onClick={() => navigate('/templates/new')} className="btn-primary px-12 py-6 rounded-[2.5rem] bg-indigo-900 text-lg">
              <Plus className="w-6 h-6" />
              Jetzt erstellen
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => navigate(`/templates/${template.id}/fill`)}
              className="group bg-white rounded-[3rem] p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500 -z-0" />

              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/templates/${template.id}/edit`); }}
                    className="w-11 h-11 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg rounded-xl flex items-center justify-center transition-all"
                    title="Struktur bearbeiten"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDuplicate(template.id, e)}
                    className="w-11 h-11 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 hover:shadow-lg rounded-xl flex items-center justify-center transition-all"
                    title="Kopieren"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {filter === 'active' ? (
                    <button
                      onClick={(e) => handleArchive(template.id, true, e)}
                      className="w-11 h-11 bg-white border border-slate-100 text-slate-400 hover:text-amber-600 hover:border-amber-100 hover:shadow-lg rounded-xl flex items-center justify-center transition-all"
                      title="Archivieren"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleDelete(template.id, e)}
                      className="w-11 h-11 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg rounded-xl flex items-center justify-center transition-all"
                      title="Endgültig löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  {template.category && (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {template.category}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none">{template.name}</h3>
                <p className="text-slate-400 text-sm font-bold line-clamp-2 leading-relaxed uppercase tracking-tight opacity-70">
                  {template.description || 'Professionelles Formular, bereit für den Einsatz.'}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-slate-50/50 flex items-center justify-between relative z-10">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900 leading-none">{template.fields?.length || 0}</span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Felder</span>
                </div>
                <div className="flex -space-x-3">
                  {[1, 2].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-4 border-white" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border-4 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">+</div>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <Button
                  onClick={(e) => { e.stopPropagation(); navigate(`/templates/${template.id}/fill`); }}
                  variant="primary"
                  className="w-full bg-slate-900 text-white hover:bg-indigo-600 py-5"
                  icon={<Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />}
                >
                  Einsatz starten
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
