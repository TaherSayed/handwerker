import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical, Trash2, Save, X, Edit } from 'lucide-react';

const FIELD_TYPES = [
  { value: 'section', label: 'Abschnittsüberschrift' },
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Zahl' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'toggle', label: 'Ja/Nein Schalter' },
  { value: 'dropdown', label: 'Auswahlliste' },
  { value: 'date', label: 'Datum' },
  { value: 'datetime', label: 'Datum & Zeit' },
  { value: 'notes', label: 'Notizen' },
  { value: 'signature', label: 'Unterschrift' },
  { value: 'photo', label: 'Foto' },
];

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    fields: [] as any[],
  });

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTemplate(id!) as any;
      setFormData({
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        tags: data.tags || [],
        fields: data.fields || [],
      });
    } catch (error: any) {
      console.error('Load template error:', error);
      setError('Fehler beim Laden der Vorlage');
      navigate('/templates');
    } finally {
      setLoading(false);
    }

  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Bitte geben Sie einen Vorlagennamen ein');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (id) {
        await apiService.updateTemplate(id, formData);
      } else {
        await apiService.createTemplate(formData);
      }

      navigate('/templates');
    } catch (error: any) {
      console.error('Save template error:', error);
      setError(error?.message || 'Fehler beim Speichern der Vorlage');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const addField = (type: string) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: type === 'section' ? 'Neuer Abschnitt' : `${type.charAt(0).toUpperCase() + type.slice(1)} Feld`,
      required: false,
      options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
      placeholder: '',
      help_text: '',
    };
    setFormData({ ...formData, fields: [...formData.fields, newField] });
  };

  const updateField = (index: number, updates: any) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, fields: items });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up p-3 md:p-8 max-w-7xl mx-auto pb-32 has-sticky-bar">
      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-3xl p-5 shadow-xl shadow-red-500/5 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black text-sm">!</div>
            <p className="text-red-800 font-bold tracking-tight text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-3 transition-colors"
          >
            <X className="w-4 h-4" />
            Änderungen verwerfen
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-1 uppercase tracking-tighter leading-none">
            {id ? 'Bearbeiten' : 'Erstellen'}
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] ml-1">
            Standardisieren Sie Ihre Arbeitsabläufe
          </p>
        </div>

        {/* Helper for desktop, but main action is now sticky for mobile */}
        <div className="hidden lg:block">
          <button
            onClick={handleSave}
            disabled={saving}
            className="group flex items-center justify-center gap-4 bg-indigo-900 text-white px-12 py-4 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        <div className="lg:col-span-4 space-y-6">
          {/* Template Info Card */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Edit className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Basisdaten</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vorlagen Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input px-4 py-3 text-base font-bold placeholder:text-slate-200"
                  placeholder="z.B. Installations Protokoll"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategorie / Gruppe</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input px-4 py-3 font-bold placeholder:text-slate-200"
                  placeholder="z.B. Sicherheit & Wartung"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Beschreibung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input px-4 py-3 font-bold placeholder:text-slate-200 min-h-[80px]"
                  placeholder="Wofür wird dieses Formular verwendet?"
                />
              </div>
            </div>
          </div>

          {/* Add Fields Palette */}
          <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl shadow-slate-900/10 lg:sticky lg:top-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem]" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-8 h-8 bg-white/10 text-white rounded-xl flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-white uppercase tracking-tight leading-none">Elemente</h2>
            </div>

            <div className="grid grid-cols-2 gap-2 relative z-10">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addField(type.value)}
                  className={`group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 active:scale-95
                    ${type.value === 'section'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 col-span-2 py-4 border-b-4 border-indigo-800'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
                >
                  <Plus className={`w-3.5 h-3.5 mb-1.5 transition-transform duration-300 group-hover:rotate-90 ${type.value === 'section' ? 'w-4 h-4' : ''}`} />
                  <span className={`font-black text-[9px] uppercase tracking-widest ${type.value === 'section' ? 'text-[10px]' : ''}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <GripVertical className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Struktur</h2>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {formData.fields.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 py-24 text-center text-slate-300 shadow-inner">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="font-black uppercase tracking-[0.2em] text-xs">Fügen Sie Ihr erstes Element hinzu</p>
                    </div>
                  ) : (
                    formData.fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group bg-white rounded-[1.5rem] border border-slate-100 transition-all duration-300 shadow-xl shadow-slate-200/20 ${snapshot.isDragging ? 'rotate-1 scale-[1.02] shadow-2xl ring-4 ring-indigo-500/20 z-50' : ''
                              } ${field.type === 'section' ? 'border-l-8 border-l-slate-900 bg-slate-50/50' : 'hover:border-indigo-100 hover:shadow-indigo-500/5'}`}
                          >
                            <div className="flex p-4 md:p-6 gap-3">
                              <div {...provided.dragHandleProps} className="flex items-center text-slate-200 cursor-grab active:cursor-grabbing hover:text-slate-400 transition-colors pt-1">
                                <GripVertical className="w-5 h-5" />
                              </div>

                              <div className="flex-1 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                    className={`flex-1 bg-transparent border-none focus:ring-0 p-0 transition-colors
                                      ${field.type === 'section'
                                        ? 'text-lg font-bold text-slate-900 uppercase tracking-tight'
                                        : 'text-base font-semibold text-slate-800 placeholder:font-normal'}`}
                                    placeholder={field.type === 'section' ? 'Neuer Abschnitt' : 'Feld Bezeichnung'}
                                  />

                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm
                                      ${field.type === 'section' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                      {field.type}
                                    </span>
                                    {field.type !== 'section' && (
                                      <label className="flex items-center gap-2 cursor-pointer select-none group/req">
                                        <div className="relative flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateField(index, { required: e.target.checked })}
                                            className="sr-only"
                                          />
                                          <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors
                                            ${field.required
                                              ? 'bg-red-50 text-red-600 border border-red-100'
                                              : 'bg-transparent text-slate-300 border border-transparent hover:bg-slate-50'}`}>
                                            {field.required ? 'Pflicht' : 'Optional'}
                                          </div>
                                        </div>
                                      </label>
                                    )}
                                    <button
                                      onClick={() => removeField(index)}
                                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                      title="Löschen"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {field.type === 'dropdown' && (
                                  <div className="pl-4 border-l-2 border-indigo-100 py-1 animate-in slide-in-from-left-4">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">Optionen</label>
                                    <input
                                      type="text"
                                      value={field.options?.join(', ') || ''}
                                      onChange={(e) => updateField(index, {
                                        options: e.target.value.split(',').map((o: string) => o.trim()).filter(Boolean)
                                      })}
                                      className="input px-4 py-3 font-normal text-sm bg-slate-50 border-none placeholder:text-slate-300 placeholder:font-light"
                                      placeholder="Kommagetrennt: Option A, Option B..."
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky-action-bar flex justify-center pb-safe">
        <button
          onClick={handleSave}
          disabled={saving}
          className="template-save-btn w-full max-w-[420px] mx-auto flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Speichert...' : 'Vorlage speichern'}
        </button>
      </div>

    </div>
  );
}
