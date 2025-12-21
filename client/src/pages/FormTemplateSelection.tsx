import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: any[];
}

export default function FormTemplateSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const contact = location.state?.contact;

  useEffect(() => {
    if (!user) {
      navigate('/google-sign-in');
      return;
    }
    loadTemplates();
  }, [user, navigate]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/forms?userId=${user?.id}`);
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: FormTemplate) => {
    navigate('/visit-form-filling', { state: { contact, template } });
  };

  const handleCreateNew = () => {
    navigate('/form-builder');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold" style={{ color: '#0F172A', fontWeight: 600 }}>Formularvorlage auswählen</h1>
          <button
            onClick={handleCreateNew}
            className="btn-primary"
          >
            Neue Vorlage erstellen
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563EB' }}></div>
            <p className="mt-4 text-sm" style={{ color: '#475569' }}>Laden...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#475569' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <p className="text-base mb-6" style={{ color: '#475569' }}>Keine Formularvorlagen gefunden</p>
            <button
              onClick={handleCreateNew}
              className="btn-primary"
            >
              Erste Vorlage erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="card p-6 cursor-pointer hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold mb-2" style={{ color: '#0F172A', fontSize: '16px' }}>{template.name}</h3>
                {template.description && (
                  <p className="text-sm mb-2" style={{ color: '#475569' }}>{template.description}</p>
                )}
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  {template.fields?.length || 0} Felder
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

