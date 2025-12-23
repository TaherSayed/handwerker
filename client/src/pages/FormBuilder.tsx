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

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const newFields = [...fields];
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
      setFields(newFields);
    } else if (direction === 'down' && index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setFields(newFields);
    }
  };

  const handleFinish = async () => {
    if (!templateName || fields.length === 0 || !user) return;

    try {
      await apiService.createForm({
        name: templateName,
        description: '',
        fields: fields,
      });
      navigate('/form-template-selection');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Fehler beim Speichern');
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

      <div className="px-6 py-6 max-w-2xl mx-auto">
        
        {/* Template Name */}
        <div className="mb-6">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Name des Besuchsformulars"
            className="w-full px-4 py-4 text-lg font-medium rounded-2xl border-2 focus:outline-none transition"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: templateName ? '#007AFF' : '#E5E5EA',
              color: '#1D1D1F'
            }}
          />
        </div>

        {/* Action Buttons - Add Field Types */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#86868B' }}>
            FELDER HINZUFÜGEN
          </h2>
          <div className="grid grid-cols-2 gap-3">
            
            <button
              onClick={() => addField('text')}
              className="p-4 rounded-2xl text-left hover:opacity-80 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5EA' }}
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="text-base font-medium" style={{ color: '#1D1D1F' }}>Textfeld</div>
              <div className="text-xs" style={{ color: '#86868B' }}>Kurze Antwort</div>
            </button>

            <button
              onClick={() => addField('toggle')}
              className="p-4 rounded-2xl text-left hover:opacity-80 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5EA' }}
            >
              <div className="text-2xl mb-2">✓</div>
              <div className="text-base font-medium" style={{ color: '#1D1D1F' }}>Ja/Nein</div>
              <div className="text-xs" style={{ color: '#86868B' }}>Einfache Auswahl</div>
            </button>

            <button
              onClick={() => addField('date')}
              className="p-4 rounded-2xl text-left hover:opacity-80 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5EA' }}
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="text-base font-medium" style={{ color: '#1D1D1F' }}>Datum</div>
              <div className="text-xs" style={{ color: '#86868B' }}>Tag auswählen</div>
            </button>

            <button
              onClick={() => addField('dropdown')}
              className="p-4 rounded-2xl text-left hover:opacity-80 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5EA' }}
            >
              <div className="text-2xl mb-2">▼</div>
              <div className="text-base font-medium" style={{ color: '#1D1D1F' }}>Auswahl</div>
              <div className="text-xs" style={{ color: '#86868B' }}>Mehrere Optionen</div>
            </button>

            <button
              onClick={() => addField('notes')}
              className="p-4 rounded-2xl text-left hover:opacity-80 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5EA' }}
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="text-base font-medium" style={{ color: '#1D1D1F' }}>Notizen</div>
              <div className="text-xs" style={{ color: '#86868B' }}>Lange Antwort</div>
            </button>

            <button
              onClick={() => addField('signature')}
              className="p-4 rounded-2xl text-left hover:opacity-80 transition"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5EA' }}
            >
              <div className="text-2xl mb-2">✍️</div>
              <div className="text-base font-medium" style={{ color: '#1D1D1F' }}>Unterschrift</div>
              <div className="text-xs" style={{ color: '#86868B' }}>Signatur</div>
            </button>

          </div>
        </div>

        {/* Fields List */}
        {fields.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#86868B' }}>
              FORMULAR FELDER
            </h2>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-white rounded-2xl p-4"
                  style={{ border: '1px solid #E5E5EA' }}
                >
                  <div className="flex items-center gap-3">
                    
                    {/* Drag Handle */}
                    <button
                      className="flex flex-col gap-0.5 p-1 hover:opacity-60"
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

                    {/* Label Input */}
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                      onFocus={() => setEditingFieldId(field.id)}
                      onBlur={() => setEditingFieldId(null)}
                      className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:border-2 transition"
                      style={{
                        backgroundColor: '#F5F5F7',
                        borderColor: editingFieldId === field.id ? '#007AFF' : '#E5E5EA',
                        color: '#1D1D1F',
                        fontSize: '16px'
                      }}
                    />

                    {/* Move Up/Down */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveField(field.id, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:opacity-60 disabled:opacity-20"
                        style={{ color: '#007AFF' }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveField(field.id, 'down')}
                        disabled={index === fields.length - 1}
                        className="p-1 rounded hover:opacity-60 disabled:opacity-20"
                        style={{ color: '#007AFF' }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => removeField(field.id)}
                      className="p-2 rounded-lg hover:opacity-60 transition"
                      style={{ color: '#FF3B30' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {fields.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-base mb-2" style={{ color: '#1D1D1F' }}>
              Keine Felder hinzugefügt
            </p>
            <p className="text-sm" style={{ color: '#86868B' }}>
              Tippe auf die Buttons oben, um Felder hinzuzufügen
            </p>
          </div>
        )}

        {/* Finish Button - Fixed at bottom on mobile */}
        {fields.length > 0 && templateName && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:relative sm:border-t-0 sm:p-0 sm:bg-transparent" style={{ borderColor: '#E5E5EA' }}>
            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: '#007AFF', fontSize: '17px' }}
            >
              Formular verwenden
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
