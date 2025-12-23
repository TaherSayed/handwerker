import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export default function FormBuilder() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Auto-save when fields or template name changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (templateName && fields.length > 0) {
        autoSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [templateName, fields]);

  const autoSave = async () => {
    if (!templateName || fields.length === 0 || !user) return;
    
    try {
      setIsSaving(true);
      // Auto-save logic can be added here if needed
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addField = (type: string) => {
    setValidationError(''); // Clear error when user makes changes
    
    const fieldLabels: Record<string, string> = {
      text: 'Textfeld',
      toggle: 'Ja/Nein',
      date: 'Datum',
      dropdown: 'Auswahl',
      notes: 'Notizen',
      signature: 'Unterschrift'
    };

    const newField: FormField = {
      id: Date.now().toString(),
      type: type,
      label: fieldLabels[type] || 'Neues Feld',
      required: false,
    };

    setFields([...fields, newField]);
    setEditingFieldId(newField.id);
  };

  const updateFieldLabel = (fieldId: string, newLabel: string) => {
    setFields(fields.map(f => 
      f.id === fieldId ? { ...f, label: newLabel } : f
    ));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  // Field type mapping: UI → Backend
  const normalizeFieldType = (uiType: string): string => {
    const typeMap: Record<string, string> = {
      'text': 'text',
      'toggle': 'boolean',
      'date': 'date',
      'dropdown': 'select',
      'notes': 'textarea',
      'signature': 'signature'
    };
    return typeMap[uiType] || 'text';
  };

  // Validate form before saving
  const validateForm = (): string | null => {
    // Check template name
    if (!templateName || templateName.trim() === '') {
      return 'Bitte geben Sie einen Formularnamen ein';
    }

    // Check at least one field exists
    if (fields.length === 0) {
      return 'Fügen Sie mindestens ein Feld hinzu';
    }

    // Check each field has a label
    for (const field of fields) {
      if (!field.label || field.label.trim() === '') {
        return 'Alle Felder müssen einen Namen haben';
      }
    }

    return null;
  };

  const handleFinish = async () => {
    setValidationError('');

    // Validate
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      // Normalize fields for backend
      const normalizedFields = fields.map((field, index) => ({
        id: field.id,
        label: field.label.trim(),
        type: normalizeFieldType(field.type),
        order: index,
        required: field.required || false,
        options: field.options || [],
      }));

      // Create payload
      const payload = {
        name: templateName.trim(),
        description: '',
        fields: normalizedFields,
      };

      console.log('Saving form template:', payload);

      await apiService.createForm(payload);
      navigate('/form-template-selection');
    } catch (error: any) {
      console.error('Failed to save template:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unbekannter Fehler';
      setValidationError(`Speichern fehlgeschlagen: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Simple Header */}
      <div className="bg-white border-b" style={{ borderColor: '#D1D1D6' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: '#1D1D1F' }}>
            OnSite
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium"
            style={{ color: '#007AFF' }}
          >
            Abbrechen
          </button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        
        {/* Template Name - Compact */}
        <div className="mb-5">
          <input
            type="text"
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value);
              setValidationError(''); // Clear error when user makes changes
            }}
            placeholder="Formularname..."
            className="w-full px-3 py-3 text-base font-medium rounded-lg focus:outline-none transition"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D1D6',
              color: '#1D1D1F'
            }}
          />
        </div>

        {/* Compact Action Buttons - Add Field Types */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addField('text')}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D1D6', color: '#1D1D1F' }}
            >
              + Text
            </button>
            <button
              onClick={() => addField('toggle')}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D1D6', color: '#1D1D1F' }}
            >
              + Ja/Nein
            </button>
            <button
              onClick={() => addField('date')}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D1D6', color: '#1D1D1F' }}
            >
              + Datum
            </button>
            <button
              onClick={() => addField('dropdown')}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D1D6', color: '#1D1D1F' }}
            >
              + Auswahl
            </button>
            <button
              onClick={() => addField('notes')}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D1D6', color: '#1D1D1F' }}
            >
              + Notiz
            </button>
            <button
              onClick={() => addField('signature')}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D1D6', color: '#1D1D1F' }}
            >
              + Unterschrift
            </button>
          </div>
        </div>

        {/* Fields List - Clipboard Style */}
        {fields.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-lg" style={{ border: '1px solid #D1D1D6' }}>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ 
                    borderBottom: index < fields.length - 1 ? '1px solid #F0F0F0' : 'none'
                  }}
                >
                  
                  {/* Drag Handle */}
                  <button
                    className="flex flex-col gap-0.5 p-1 hover:opacity-50 transition"
                    style={{ color: '#C7C7CC' }}
                  >
                    <div className="flex gap-0.5">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
                    </div>
                    <div className="flex gap-0.5">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
                    </div>
                  </button>

                  {/* Label Input - Inline Editable */}
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                    onFocus={() => setEditingFieldId(field.id)}
                    onBlur={() => setEditingFieldId(null)}
                    placeholder="Feldname eingeben..."
                    className="flex-1 px-2 py-1.5 rounded focus:outline-none transition"
                    style={{
                      backgroundColor: editingFieldId === field.id ? '#F5F5F7' : 'transparent',
                      borderBottom: editingFieldId === field.id ? '2px solid #007AFF' : '2px solid transparent',
                      color: '#1D1D1F',
                      fontSize: '16px'
                    }}
                  />

                  {/* Delete Button */}
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1.5 rounded hover:bg-red-50 transition"
                    style={{ color: '#FF3B30' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {fields.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#86868B' }}>
              Felder hinzufügen ↑
            </p>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
            <p className="text-sm font-medium" style={{ color: '#C62828' }}>
              {validationError}
            </p>
          </div>
        )}

        {/* Primary Action Button - Fixed at bottom on mobile */}
        {fields.length > 0 && templateName && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:relative sm:border-t-0 sm:p-0 sm:bg-transparent" style={{ borderColor: '#E5E5EA' }}>
            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-xl font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: '#007AFF', fontSize: '17px' }}
            >
              Besuch starten
            </button>
          </div>
        )}

        {/* Spacer for fixed button on mobile */}
        {fields.length > 0 && templateName && (
          <div className="h-20 sm:hidden"></div>
        )}

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed top-20 right-4 px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: '#34C759', color: '#FFFFFF' }}>
            Gespeichert ✓
          </div>
        )}

      </div>
    </div>
  );
}
