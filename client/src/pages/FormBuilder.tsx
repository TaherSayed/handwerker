import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical, Trash2, Save, X } from 'lucide-react';

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32">
      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            {id ? 'Edit Template' : 'New Template'}
          </h1>
          <p className="text-gray-600">Design your professional form template</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/templates')} className="btn-secondary flex-1 md:flex-none justify-center">
            <X className="w-5 h-5" />
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 md:flex-none justify-center">
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Template Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input px-4 py-3 text-lg"
                  placeholder="e.g., Daily Site Report"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  placeholder="e.g., Safety"
                />
              </div>
            </div>
          </div>

          <div className="card p-6 lg:sticky lg:top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Fields</h2>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addField(type.value)}
                  className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl transition-all duration-200 text-sm font-medium
                    ${type.value === 'section'
                      ? 'bg-gray-900 border-gray-900 text-white hover:bg-gray-800 col-span-2'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                  <Plus className="w-4 h-4 mb-1" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {formData.fields.length === 0 ? (
                    <div className="card border-dashed border-2 py-20 text-center text-gray-400">
                      <Plus className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Start adding fields to your form</p>
                    </div>
                  ) : (
                    formData.fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`card overflow-hidden transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 z-50' : ''
                              } ${field.type === 'section' ? 'border-l-8 border-l-gray-900 bg-gray-50' : ''}`}
                          >
                            <div className="flex p-4 gap-4">
                              <div {...provided.dragHandleProps} className="flex items-center text-gray-400 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5" />
                              </div>

                              <div className="flex-1 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                    className={`flex-1 bg-transparent border-b-2 border-transparent focus:border-blue-500 transition-colors font-semibold py-1 px-0 focus:ring-0
                                      ${field.type === 'section' ? 'text-xl text-gray-900' : 'text-lg text-gray-800'}`}
                                    placeholder={field.type === 'section' ? 'Section Title' : 'Field Label'}
                                  />

                                  <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider
                                      ${field.type === 'section' ? 'bg-gray-900 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                      {field.type}
                                    </span>
                                    {field.type !== 'section' && (
                                      <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={field.required}
                                          onChange={(e) => updateField(index, { required: e.target.checked })}
                                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                        />
                                        <span className="text-xs font-semibold text-gray-600">Required</span>
                                      </label>
                                    )}
                                    <button
                                      onClick={() => removeField(index)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {field.type === 'dropdown' && (
                                  <div className="pl-4 border-l-2 border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Options (comma separated)</label>
                                    <input
                                      type="text"
                                      value={field.options?.join(', ') || ''}
                                      onChange={(e) => updateField(index, {
                                        options: e.target.value.split(',').map((o: string) => o.trim()).filter(Boolean)
                                      })}
                                      className="input text-sm p-2"
                                      placeholder="Option 1, Option 2..."
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
