import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical, Trash2, Save, X, Edit, Grid3x3, FileText, Sparkles } from 'lucide-react';

const FIELD_TYPES = [
  { value: 'section', label: 'Abschnittsüberschrift', icon: FileText, color: 'from-indigo-500 to-purple-600' },
  { value: 'text', label: 'Text', icon: FileText, color: 'from-blue-500 to-cyan-500' },
  { value: 'number', label: 'Zahl', icon: FileText, color: 'from-green-500 to-emerald-500' },
  { value: 'checkbox', label: 'Checkbox', icon: FileText, color: 'from-amber-500 to-orange-500' },
  { value: 'toggle', label: 'Ja/Nein Schalter', icon: FileText, color: 'from-pink-500 to-rose-500' },
  { value: 'dropdown', label: 'Auswahlliste', icon: FileText, color: 'from-violet-500 to-purple-500' },
  { value: 'date', label: 'Datum', icon: FileText, color: 'from-teal-500 to-cyan-500' },
  { value: 'datetime', label: 'Datum & Zeit', icon: FileText, color: 'from-sky-500 to-blue-500' },
  { value: 'notes', label: 'Notizen', icon: FileText, color: 'from-slate-500 to-gray-500' },
  { value: 'signature', label: 'Unterschrift', icon: FileText, color: 'from-red-500 to-pink-500' },
  { value: 'photo', icon: FileText, label: 'Foto', color: 'from-indigo-500 to-blue-500' },
];

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showElementPalette, setShowElementPalette] = useState(false);

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
      label: FIELD_TYPES.find(t => t.value === type)?.label || 'Neues Feld',
      required: false,
      options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
      placeholder: '',
      help_text: '',
    };
    setFormData({ ...formData, fields: [...formData.fields, newField] });
    setShowElementPalette(false); // Hide palette after adding field
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Lade Vorlage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/templates')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                title="Zurück"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {id ? 'Bearbeiten' : 'Erstellen'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Vorlage {id ? 'bearbeiten' : 'erstellen'}</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all active:scale-95 disabled:opacity-70"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Template Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Basisdaten</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                    Vorlagen Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="z.B. Installations Protokoll"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                    Kategorie / Gruppe
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="z.B. Sicherheit & Wartung"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none min-h-[100px]"
                    placeholder="Wofür wird dieses Formular verwendet?"
                  />
                </div>
              </div>
            </div>

            {/* Add Fields Palette */}
            {showElementPalette && (
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl lg:sticky lg:top-24 border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Elemente</h2>
                  </div>
                  <button
                    onClick={() => setShowElementPalette(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
                    title="Schließen"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Section Header - Special Styling */}
                  <button
                    onClick={() => addField('section')}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-[0.98] border-2 border-indigo-500/50"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      <span>Abschnittsüberschrift</span>
                    </div>
                  </button>

                  {/* Other Field Types */}
                  <div className="grid grid-cols-2 gap-2">
                    {FIELD_TYPES.filter(t => t.value !== 'section').map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => addField(type.value)}
                          className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white p-3 rounded-xl transition-all active:scale-95 backdrop-blur-sm"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-[10px] uppercase tracking-wide text-center leading-tight">
                              {type.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Add Element Button - Show when palette is hidden */}
            {!showElementPalette && (
              <button
                onClick={() => setShowElementPalette(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-[0.98] border-2 border-indigo-500/50 flex items-center justify-center gap-3"
              >
                <Plus className="w-6 h-6" />
                <span>Element hinzufügen</span>
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 min-h-[600px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Grid3x3 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Struktur</h2>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {formData.fields.length === 0 ? (
                        <div className="border-3 border-dashed border-slate-200 rounded-2xl p-16 text-center bg-gradient-to-br from-slate-50 to-white">
                          <button
                            onClick={() => setShowElementPalette(true)}
                            className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95"
                          >
                            <Plus className="w-10 h-10 text-indigo-600" />
                          </button>
                        </div>
                      ) : (
                        formData.fields.map((field, index) => {
                          const fieldType = FIELD_TYPES.find(t => t.value === field.type);
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`group bg-white rounded-xl border-2 transition-all duration-200 ${
                                    snapshot.isDragging
                                      ? 'border-indigo-500 shadow-2xl scale-[1.02] rotate-1 z-50'
                                      : field.type === 'section'
                                      ? 'border-slate-900 bg-gradient-to-r from-slate-50 to-slate-100'
                                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                                  }`}
                                >
                                  <div className="p-5">
                                    <div className="flex items-start gap-4">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="flex items-center text-slate-300 cursor-grab active:cursor-grabbing hover:text-indigo-500 transition-colors pt-1"
                                      >
                                        <GripVertical className="w-5 h-5" />
                                      </div>

                                      <div className="flex-1 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                          <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) => updateField(index, { label: e.target.value })}
                                            className={`flex-1 bg-transparent border-none focus:ring-0 p-0 font-bold transition-colors outline-none ${
                                              field.type === 'section'
                                                ? 'text-xl text-slate-900 uppercase tracking-tight'
                                                : 'text-base text-slate-800'
                                            }`}
                                            placeholder={field.type === 'section' ? 'Neuer Abschnitt' : 'Feld Bezeichnung'}
                                          />

                                          <div className="flex items-center gap-2">
                                            {fieldType && (
                                              <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${fieldType.color} text-white text-xs font-bold uppercase tracking-wide shadow-md`}>
                                                {field.type}
                                              </div>
                                            )}
                                            {field.type !== 'section' && (
                                              <button
                                                onClick={() => updateField(index, { required: !field.required })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                                                  field.required
                                                    ? 'bg-red-50 text-red-600 border-2 border-red-200'
                                                    : 'bg-slate-100 text-slate-500 border-2 border-transparent hover:bg-slate-200'
                                                }`}
                                              >
                                                {field.required ? 'Pflicht' : 'Optional'}
                                              </button>
                                            )}
                                            <button
                                              onClick={() => removeField(index)}
                                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                              title="Löschen"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>

                                        {field.type === 'dropdown' && (
                                          <div className="pl-4 border-l-3 border-indigo-200 bg-indigo-50/50 rounded-lg p-3">
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                                              Optionen
                                            </label>
                                            <input
                                              type="text"
                                              value={field.options?.join(', ') || ''}
                                              onChange={(e) => updateField(index, {
                                                options: e.target.value.split(',').map((o: string) => o.trim()).filter(Boolean)
                                              })}
                                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                              placeholder="Kommagetrennt: Option A, Option B..."
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-200 p-4 shadow-2xl">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-70"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Speichert...' : 'Vorlage speichern'}
        </button>
      </div>
    </div>
  );
}
