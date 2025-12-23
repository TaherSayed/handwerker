import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical, Trash2, Save, X, Edit } from 'lucide-react';

const FIELD_TYPES = [
  { value: 'section', label: 'Section Header' },
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'toggle', label: 'Yes/No Toggle' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'notes', label: 'Notes' },
  { value: 'signature', label: 'Signature' },
  { value: 'photo', label: 'Photo' },
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
      setError('Failed to load template');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a template name');
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
      setError(error?.message || 'Failed to save template');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const addField = (type: string) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: type === 'section' ? 'New Section' : `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
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
    <div className="animate-slide-up p-4 md:p-8 max-w-7xl mx-auto pb-40">
      {/* Messages */}
      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-3xl p-6 shadow-xl shadow-red-500/5 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black">!</div>
            <p className="text-red-800 font-bold tracking-tight">{error}</p>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors"
          >
            <X className="w-4 h-4" />
            Discard Changes
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">
            {id ? 'Refine' : 'Architect'} Template
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] ml-1">
            Standardise your service delivery flow
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="group flex items-center justify-center gap-4 bg-indigo-900 text-white w-full md:w-auto px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-800 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          {saving ? 'Saving...' : 'Publish Template'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          {/* Template Info Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Edit className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Identity</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input px-6 py-4 text-lg font-bold placeholder:text-slate-200"
                  placeholder="e.g., Installation Audit"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category / Group</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input px-6 py-4 font-bold placeholder:text-slate-200"
                  placeholder="e.g., Safety & Compliance"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vision / Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input px-6 py-4 font-bold placeholder:text-slate-200 min-h-[100px]"
                  placeholder="What is this form for?"
                />
              </div>
            </div>
          </div>

          {/* Add Fields Palette */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/10 lg:sticky lg:top-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem]" />
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight leading-none">Elements</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addField(type.value)}
                  className={`group flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 active:scale-95
                    ${type.value === 'section'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 col-span-2 py-6 border-b-4 border-indigo-800'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
                >
                  <Plus className={`w-4 h-4 mb-2 transition-transform duration-300 group-hover:rotate-90 ${type.value === 'section' ? 'w-5 h-5' : ''}`} />
                  <span className={`font-black text-[9px] uppercase tracking-widest ${type.value === 'section' ? 'text-[11px]' : ''}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-4 px-4 mb-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <GripVertical className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Blueprint</h2>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {formData.fields.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border-4 border-dashed border-slate-100 py-32 text-center text-slate-300 shadow-inner">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus className="w-10 h-10 opacity-20" />
                      </div>
                      <p className="font-black uppercase tracking-[0.2em] text-sm">Add your first element from the sidebar</p>
                    </div>
                  ) : (
                    formData.fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group bg-white rounded-[2rem] border border-slate-100 transition-all duration-300 shadow-xl shadow-slate-200/20 ${snapshot.isDragging ? 'rotate-1 scale-[1.02] shadow-2xl ring-4 ring-indigo-500/20 z-50' : ''
                              } ${field.type === 'section' ? 'border-l-8 border-l-slate-900 bg-slate-50/50' : 'hover:border-indigo-100 hover:shadow-indigo-500/5'}`}
                          >
                            <div className="flex p-6 md:p-8 gap-6">
                              <div {...provided.dragHandleProps} className="flex items-center text-slate-200 cursor-grab active:cursor-grabbing hover:text-slate-400 transition-colors">
                                <GripVertical className="w-6 h-6" />
                              </div>

                              <div className="flex-1 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                    className={`flex-1 bg-transparent border-none focus:ring-0 font-black p-0 placeholder:text-slate-200 transition-colors
                                      ${field.type === 'section' ? 'text-2xl text-slate-900 uppercase' : 'text-xl text-slate-800'}`}
                                    placeholder={field.type === 'section' ? 'New Section' : 'Field Label'}
                                  />

                                  <div className="flex items-center gap-4">
                                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-sm
                                      ${field.type === 'section' ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                      {field.type}
                                    </span>
                                    {field.type !== 'section' && (
                                      <label className="flex items-center gap-3 cursor-pointer select-none group/req">
                                        <div className="relative">
                                          <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateField(index, { required: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-0 peer opacity-0 absolute cursor-pointer"
                                          />
                                          <div className={`w-5 h-5 border-2 rounded-md transition-all ${field.required ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {field.required && <div className="w-2 h-2 bg-white rounded-full m-auto mt-1" />}
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/req:text-slate-600 transition-colors">Required</span>
                                      </label>
                                    )}
                                    <button
                                      onClick={() => removeField(index)}
                                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>

                                {field.type === 'dropdown' && (
                                  <div className="pl-6 border-l-4 border-indigo-100 py-2 animate-in slide-in-from-left-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Choice Options (comma separated)</label>
                                    <input
                                      type="text"
                                      value={field.options?.join(', ') || ''}
                                      onChange={(e) => updateField(index, {
                                        options: e.target.value.split(',').map((o: string) => o.trim()).filter(Boolean)
                                      })}
                                      className="input px-6 py-4 font-bold text-sm bg-slate-50 border-none placeholder:text-slate-300"
                                      placeholder="Ex: Success, Maintenance Needed, Critial Failure..."
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
    </div>
  );
}
