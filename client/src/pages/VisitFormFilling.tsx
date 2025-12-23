import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';

export default function VisitFormFilling() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { contact, template } = location.state || {};
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !contact || !template) {
      navigate('/contact-selection');
      return;
    }
  }, [user, contact, template, navigate]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    autoSave();
  };

  const autoSave = async () => {
    if (!user || !template) return;
    
    try {
      setSaving(true);
      const visitData = {
        contact_id: contact.id,
        form_template_id: template.id,
        form_data: formData,
        contact_data: contact,
        status: 'draft',
      };

      // Check if visit exists, update or create
      await apiService.createVisit(visitData);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !template || !contact) return;

    try {
      const visitData = {
        contact_id: contact.id,
        form_template_id: template.id,
        form_data: formData,
        contact_data: contact,
        status: 'completed',
      };

      const visit = await apiService.createVisit(visitData);
      navigate('/pdf-preview', { state: { visit, contact, template } });
    } catch (error) {
      console.error('Failed to save visit:', error);
      alert('Fehler beim Speichern');
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleFieldChange(field.id, e.target.checked)}
            className="w-4 h-4"
          />
        );
      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select...</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        );
      default:
        return null;
    }
  };

  if (!template) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h1>
          <p className="text-gray-600">Kunde: {contact.full_name}</p>
          {saving && <p className="text-sm text-green-600">Wird gespeichert...</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {template.fields?.map((field: any) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Zurück
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Abschließen & PDF erstellen
          </button>
        </div>
      </div>
    </div>
  );
}

