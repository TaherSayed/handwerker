import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

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
  const [currentField, setCurrentField] = useState<Partial<FormField>>({
    type: 'text',
    label: '',
    required: false,
  });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'date', label: 'Date' },
  ];

  const addField = () => {
    if (!currentField.label) return;

    const newField: FormField = {
      id: Date.now().toString(),
      type: currentField.type || 'text',
      label: currentField.label,
      required: currentField.required || false,
      placeholder: currentField.placeholder,
      options: currentField.type === 'dropdown' ? currentField.options : undefined,
    };

    setFields([...fields, newField]);
    setCurrentField({ type: 'text', label: '', required: false });
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleSave = async () => {
    if (!templateName || fields.length === 0 || !user) return;

    try {
      await axios.post('/api/forms', {
        userId: user.id,
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Formularvorlage erstellen</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vorlagenname
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="z.B. Erstbesuch, Wartung, Reparatur..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Feld hinzufügen</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feldtyp</label>
              <select
                value={currentField.type}
                onChange={(e) => setCurrentField({ ...currentField, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={currentField.label}
                onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={currentField.required}
                onChange={(e) => setCurrentField({ ...currentField, required: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="ml-2 text-sm text-gray-700">Pflichtfeld</label>
            </div>

            <button
              onClick={addField}
              className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
            >
              Feld hinzufügen
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Felder ({fields.length})</h2>
          {fields.length === 0 ? (
            <p className="text-gray-500">Noch keine Felder hinzugefügt</p>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{field.label}</span>
                    <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <button
                    onClick={() => removeField(field.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Entfernen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!templateName || fields.length === 0}
            className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-400"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

