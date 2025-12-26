import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Trash2, Save, X, 
  Settings, Copy, ChevronUp, ChevronDown, Type, Hash, CheckSquare, 
  ToggleLeft, List, Calendar, Clock, StickyNote, PenTool, Camera,
  Heading
} from 'lucide-react';

// Categorized field types like Jotform
const FIELD_CATEGORIES = {
  basic: [
    { value: 'section', label: 'Abschnittsüberschrift', icon: Heading, color: '#6366f1' },
    { value: 'text', label: 'Text', icon: Type, color: '#3b82f6' },
    { value: 'number', label: 'Zahl', icon: Hash, color: '#10b981' },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: '#f59e0b' },
    { value: 'toggle', label: 'Ja/Nein Schalter', icon: ToggleLeft, color: '#ec4899' },
    { value: 'dropdown', label: 'Auswahlliste', icon: List, color: '#8b5cf6' },
    { value: 'date', label: 'Datum', icon: Calendar, color: '#14b8a6' },
    { value: 'datetime', label: 'Datum & Zeit', icon: Clock, color: '#0ea5e9' },
    { value: 'notes', label: 'Notizen', icon: StickyNote, color: '#64748b' },
  ],
  advanced: [
    { value: 'signature', label: 'Unterschrift', icon: PenTool, color: '#ef4444' },
    { value: 'photo', label: 'Foto', icon: Camera, color: '#6366f1' },
  ]
};

const ALL_FIELD_TYPES = [...FIELD_CATEGORIES.basic, ...FIELD_CATEGORIES.advanced];

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'basic' | 'advanced'>('basic');
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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

  const addField = (type: string, insertIndex?: number) => {
    const fieldType = ALL_FIELD_TYPES.find(t => t.value === type);
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: fieldType?.label || 'Neues Feld',
      sublabel: '',
      required: false,
      options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
      placeholder: '',
      help_text: '',
    };
    
    if (insertIndex !== undefined) {
      const newFields = [...formData.fields];
      newFields.splice(insertIndex, 0, newField);
      setFormData({ ...formData, fields: newFields });
      setSelectedFieldIndex(insertIndex);
    } else {
      setFormData({ ...formData, fields: [...formData.fields, newField] });
      setSelectedFieldIndex(formData.fields.length);
    }
  };

  const duplicateField = (index: number) => {
    const field = formData.fields[index];
    const newField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    const newFields = [...formData.fields];
    newFields.splice(index + 1, 0, newField);
    setFormData({ ...formData, fields: newFields });
    setSelectedFieldIndex(index + 1);
  };

  const updateField = (index: number, updates: any) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
    if (selectedFieldIndex === index) {
      setSelectedFieldIndex(null);
    } else if (selectedFieldIndex !== null && selectedFieldIndex > index) {
      setSelectedFieldIndex(selectedFieldIndex - 1);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, fields: items });
    
    // Update selected index
    if (selectedFieldIndex === result.source.index) {
      setSelectedFieldIndex(result.destination.index);
    } else if (selectedFieldIndex !== null) {
      if (selectedFieldIndex > result.source.index && selectedFieldIndex <= result.destination.index) {
        setSelectedFieldIndex(selectedFieldIndex - 1);
      } else if (selectedFieldIndex < result.source.index && selectedFieldIndex >= result.destination.index) {
        setSelectedFieldIndex(selectedFieldIndex + 1);
      }
    }
  };

  const renderFieldPreview = (field: any) => {
    switch (field.type) {
      case 'section':
        return (
          <div className="pt-4 pb-2 border-b-2 border-slate-300">
            <h3 className="text-lg font-bold text-slate-900">{field.label || 'Abschnittsüberschrift'}</h3>
            {field.sublabel && <p className="text-sm text-slate-500 mt-1">{field.sublabel}</p>}
          </div>
        );
      case 'text':
      case 'number':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Frage'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <input
              type={field.type}
              disabled
              placeholder={field.placeholder || 'Antwort eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
            />
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      case 'checkbox':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Checkbox'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" disabled className="w-4 h-4" />
              <span className="text-sm text-slate-600">Option auswählen</span>
            </label>
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      case 'toggle':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Ja/Nein'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" disabled className="w-4 h-4" />
              <span className="text-sm text-slate-600">Ein/Aus</span>
            </label>
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      case 'dropdown':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Auswahlliste'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <select disabled className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500">
              <option>Auswählen...</option>
              {field.options?.map((opt: string, i: number) => (
                <option key={i}>{opt}</option>
              ))}
            </select>
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      case 'date':
      case 'datetime':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Datum'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <input
              type={field.type === 'datetime' ? 'datetime-local' : 'date'}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
            />
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      case 'notes':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Notizen'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <textarea
              disabled
              placeholder={field.placeholder || 'Notizen eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 min-h-[80px]"
            />
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      case 'signature':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Unterschrift'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center">
              <span className="text-sm text-slate-400">Unterschrift hier</span>
            </div>
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      case 'photo':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Foto'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center">
              <span className="text-sm text-slate-400">Foto hier</span>
            </div>
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      default:
        return null;
    }
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
    <div className="min-h-screen bg-slate-100">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/templates')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                title="Zurück"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {id ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
                </h1>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70"
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
        <div className="max-w-[1920px] mx-auto px-4 pt-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Form Elements */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Form Elements</h2>
            </div>
            
            {/* Category Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
              <button
                onClick={() => setActiveCategory('basic')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeCategory === 'basic'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BASIC
              </button>
              <button
                onClick={() => setActiveCategory('advanced')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeCategory === 'advanced'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ADVANCED
              </button>
            </div>
          </div>

          {/* Field Types List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {FIELD_CATEGORIES[activeCategory].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => addField(type.value)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${type.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: type.color }} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area - Form Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
          <div className="max-w-3xl mx-auto">
            {/* Form Title */}
            <div className="mb-6">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-3xl font-bold text-slate-900 bg-transparent border-none outline-none w-full"
                placeholder="Form"
              />
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px]">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                      {formData.fields.length === 0 ? (
                        <div className="text-center py-16">
                          <p className="text-slate-400 text-sm">Klicken Sie auf ein Element links, um es hinzuzufügen</p>
                        </div>
                      ) : (
                        formData.fields.map((field, index) => {
                          const isSelected = selectedFieldIndex === index;
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`relative group border-2 rounded-lg p-4 transition-all ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50'
                                      : snapshot.isDragging
                                      ? 'border-indigo-500 shadow-xl'
                                      : 'border-transparent hover:border-slate-300'
                                  }`}
                                  onClick={() => setSelectedFieldIndex(index)}
                                >
                                  {/* Field Controls */}
                                  <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addField('text', index);
                                      }}
                                      className="p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                                      title="Feld darüber hinzufügen"
                                    >
                                      <ChevronUp className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateField(index);
                                      }}
                                      className="p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                                      title="Duplizieren"
                                    >
                                      <Copy className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSettings(!showSettings);
                                      }}
                                      className="p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                                      title="Einstellungen"
                                    >
                                      <Settings className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeField(index);
                                      }}
                                      className="p-1.5 bg-white border border-red-200 rounded shadow-sm hover:bg-red-50"
                                      title="Löschen"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addField('text', index + 1);
                                      }}
                                      className="p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                                      title="Feld darunter hinzufügen"
                                    >
                                      <ChevronDown className="w-4 h-4 text-slate-600" />
                                    </button>
                                  </div>

                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 hover:bg-indigo-500 cursor-grab active:cursor-grabbing rounded-l transition-colors"
                                  />

                                  {/* Field Preview */}
                                  <div className="ml-4">
                                    {renderFieldPreview(field)}
                                  </div>

                                  {/* Field Editor (when selected) */}
                                  {isSelected && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                          Frage / Label
                                        </label>
                                        <input
                                          type="text"
                                          value={field.label}
                                          onChange={(e) => updateField(index, { label: e.target.value })}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="Type a question"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                          Untertitel / Sublabel
                                        </label>
                                        <input
                                          type="text"
                                          value={field.sublabel || ''}
                                          onChange={(e) => updateField(index, { sublabel: e.target.value })}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="Type a sublabel"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      {(field.type === 'text' || field.type === 'number' || field.type === 'notes') && (
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Platzhalter
                                          </label>
                                          <input
                                            type="text"
                                            value={field.placeholder || ''}
                                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Placeholder text"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                      )}
                                      {field.type === 'dropdown' && (
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Optionen (kommagetrennt)
                                          </label>
                                          <input
                                            type="text"
                                            value={field.options?.join(', ') || ''}
                                            onChange={(e) => updateField(index, {
                                              options: e.target.value.split(',').map((o: string) => o.trim()).filter(Boolean)
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Option 1, Option 2, Option 3"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                      )}
                                      <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={field.required || false}
                                            onChange={(e) => updateField(index, { required: e.target.checked })}
                                            className="w-4 h-4"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <span className="text-xs font-medium text-slate-700">Pflichtfeld</span>
                                        </label>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                          Hilfetext
                                        </label>
                                        <input
                                          type="text"
                                          value={field.help_text || ''}
                                          onChange={(e) => updateField(index, { help_text: e.target.value })}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="Hilfetext für den Benutzer"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    </div>
                                  )}
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

              {/* Add New Page Section */}
              <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-300 text-center">
                <button
                  onClick={() => addField('text')}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                >
                  + ADD NEW PAGE HERE
                </button>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <button className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
