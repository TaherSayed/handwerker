import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical, Trash2, Save, X, FileText } from 'lucide-react';

const FIELD_TYPES = [
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
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
        name: data.name,
        description: data.description || '',
        category: data.category || '',
        tags: data.tags || [],
        fields: data.fields || [],
      });
    } catch (error) {
      console.error('Load template error:', error);
      alert('Failed to load template');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a template name');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      if (id) {
        await apiService.updateTemplate(id, formData);
      } else {
        await apiService.createTemplate(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/templates');
      }, 500);
    } catch (error: any) {
      console.error('Save template error:', error);
      const errorMessage = error?.message || error?.error || 'Failed to save template. Please try again.';
      setError(errorMessage);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const addField = (type: string) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
      default_value: undefined,
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-xl p-4 shadow-sm">
          <p className="text-green-800 font-medium">Template saved successfully!</p>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {id ? 'Edit Template' : 'New Template'}
          </h1>
          <p className="text-gray-600 text-lg">Design your form template</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/templates')}
            className="btn-secondary"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Template Information</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Site Inspection Form"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Describe what this form is used for"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              placeholder="e.g., Inspection, Safety, Maintenance"
            />
            <p className="text-xs text-gray-500 mt-1">Categorize your templates for easier organization</p>
          </div>
        </div>
      </div>

      {/* Field Palette */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Fields</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {FIELD_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => addField(type.value)}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fields List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Form Fields</h2>
          {formData.fields.length > 0 && (
            <span className="text-sm text-gray-500 font-medium">
              {formData.fields.length} {formData.fields.length === 1 ? 'field' : 'fields'}
            </span>
          )}
        </div>
        {formData.fields.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No fields yet</p>
            <p className="text-sm text-gray-500">Add fields from the palette above to build your form</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided: any) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {formData.fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`card p-4 transition-all duration-200 ${
                            snapshot.isDragging ? 'shadow-lg scale-[1.02]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div {...provided.dragHandleProps} className="pt-2 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  className="flex-1 min-w-[200px] input text-sm"
                                  placeholder="Field label"
                                />
                                <span className="badge bg-blue-100 text-blue-700 font-medium">
                                  {field.type}
                                </span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) =>
                                      updateField(index, { required: e.target.checked })
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium text-gray-700">Required</span>
                                </label>
                                <button
                                  onClick={() => removeField(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                  title="Delete field"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {field.type === 'dropdown' && (
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Dropdown Options
                                  </label>
                                  <input
                                    type="text"
                                    value={field.options?.join(', ') || ''}
                                    onChange={(e) =>
                                      updateField(index, {
                                        options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                                      })
                                    }
                                    className="input text-sm"
                                    placeholder="Option 1, Option 2, Option 3"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Separate options with commas</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
