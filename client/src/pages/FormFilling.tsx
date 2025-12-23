import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import ContactSelector from '../components/ContactSelector';
import { GoogleContact } from '../services/google-contacts.service';
import { Save, Send, ArrowLeft, User, Loader, Zap, ClipboardList } from 'lucide-react';

export default function FormFilling() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContactSelector, setShowContactSelector] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_id: '',
  });

  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTemplate(templateId!) as any;
      setTemplate(data);

      // Initialize field values
      const initialValues: Record<string, any> = {};
      if (data.fields) {
        data.fields.forEach((field: any) => {
          if (field.default_value !== undefined) {
            initialValues[field.id] = field.default_value;
          } else if (field.type === 'checkbox' || field.type === 'toggle') {
            initialValues[field.id] = false;
          }
        });
      }
      setFieldValues(initialValues);
    } catch (error: any) {
      console.error('Load template error:', error);
      setError(error.message || 'Laden der Vorlage fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (contact: GoogleContact) => {
    setCustomerInfo({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      contact_id: contact.id,
    });
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues({ ...fieldValues, [fieldId]: value });
  };

  const handleSignatureCapture = (dataUrl: string) => {
    setSignature(dataUrl);
  };

  const validateForm = (): boolean => {
    if (!template) return false;

    // Check required customer fields
    if (!customerInfo.name.trim()) {
      setError('Bitte geben Sie den Kundennamen ein');
      return false;
    }

    // Check required form fields
    for (const field of template.fields || []) {
      if (field.required) {
        const value = fieldValues[field.id];
        if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0)) {
          setError(`Bitte füllen Sie das Pflichtfeld aus: ${field.label}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async (status: 'draft' | 'submitted' = 'draft') => {
    if (!template) return;

    if (status === 'submitted' && !validateForm()) {
      return;
    }

    try {
      if (status === 'draft') {
        setSaving(true);
      } else {
        setSubmitting(true);
      }
      setError(null);

      const submissionData = {
        template_id: template.id,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || null,
        customer_phone: customerInfo.phone || null,
        customer_address: customerInfo.address || null,
        customer_contact_id: customerInfo.contact_id || null,
        field_values: fieldValues,
        signature_url: signature || null,
        status,
      };

      await apiService.createSubmission(submissionData);

      if (status === 'submitted') {
        navigate('/submissions');
      } else {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
        successMsg.textContent = 'Entwurf erfolgreich gespeichert!';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          document.body.removeChild(successMsg);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Save submission error:', error);
      setError(error.message || 'Speichern des Einsatzes fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.id];
    const hasError = field.required && (value === undefined || value === null || value === '');

    switch (field.type) {
      case 'section':
        return (
          <div className="pt-6 pb-2 border-b-2 border-gray-900 mb-2">
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{field.label}</h3>
            {field.help_text && <p className="text-sm text-gray-500 mt-1">{field.help_text}</p>}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
            placeholder={field.placeholder || `${field.label} eingeben...`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
            placeholder={field.placeholder || `${field.label} eingeben...`}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">{field.label}</span>
          </label>
        );

      case 'toggle':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-14 h-7 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-7' : ''
                }`} />
            </div>
            <span className="text-gray-700">{field.label}</span>
          </label>
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
          >
            <option value="">{field.label} auswählen</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
          />
        );

      case 'notes':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
            rows={4}
            placeholder={field.placeholder || `${field.label} eingeben...`}
          />
        );

      case 'signature':
        return (
          <div className="space-y-3">
            {signature ? (
              <div className="relative">
                <img src={signature} alt="Unterschrift" className="w-full max-w-md h-32 object-contain border-2 border-gray-200 rounded-xl bg-white" />
                <button
                  type="button"
                  onClick={() => setSignature(null)}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                >
                  Löschen
                </button>
              </div>
            ) : (
              <SignaturePad onCapture={handleSignatureCapture} />
            )}
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    handleFieldChange(field.id, event.target?.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="input"
            />
            {value && (
              <img src={value} alt="Hochgeladen" className="w-full max-w-md h-48 object-cover rounded-xl border border-gray-200" />
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
            placeholder={field.placeholder || `${field.label} eingeben...`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">{error}</p>
          </div>
          <button onClick={() => navigate('/templates')} className="btn-primary">
            <ArrowLeft className="w-5 h-5" />
            Zurück zu den Vorlagen
          </button>
        </div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="animate-slide-up flex flex-col min-h-full pb-32 lg:pb-8">
      {/* Sticky Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/templates')}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="min-w-0">
          <h1 className="font-black text-slate-900 truncate uppercase text-sm tracking-tight">{template.name}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Formular ausfüllen</p>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-6 mb-12">
          <button
            onClick={() => navigate('/templates')}
            className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">{template.name}</h1>
            <p className="text-slate-500 font-medium text-lg">{template.description || 'Vervollständigen Sie die untenstehenden Informationen'}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-4 shadow-sm">
            <p className="text-red-800 font-bold text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave('submitted'); }} className="space-y-8">
          {/* Section: Customer */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase text-sm tracking-widest">Kunde</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowContactSelector(true)}
                className="btn-secondary h-10 px-4 py-0 text-xs gap-2"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                Google Import
              </button>
            </div>

            <div className="card grid grid-cols-1 md:grid-cols-2 gap-5 bg-white border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vollständiger Name *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="input"
                  placeholder="Max Mustermann"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-Mail</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="input"
                  placeholder="max@beispiel.de"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefonnummer</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="input"
                  placeholder="+49 (0) 123 456789"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Einsatzort / Adresse</label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="input"
                  placeholder="Beispielstraße 1, 12345 Stadt"
                />
              </div>
            </div>
          </section>

          {/* Section: Form Body */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase text-sm tracking-widest">Details</h2>
            </div>

            <div className="card space-y-8 bg-white border-slate-100 shadow-xl shadow-slate-200/50">
              {template.fields?.map((field: any) => (
                <div key={field.id} className="space-y-3">
                  {field.type !== 'section' && (
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 block">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>
          </section>

          {/* Action Bar (Mobile Floating / Desktop Inline) */}
          <div className="fixed bottom-24 left-0 right-0 p-4 lg:relative lg:bottom-0 lg:p-0 z-40 lg:z-auto">
            <div className="max-w-4xl mx-auto flex gap-3 p-3 bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-slate-200 shadow-2xl lg:shadow-none lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:justify-end">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={saving || submitting}
                className="btn-secondary flex-1 lg:flex-none py-4 px-8 rounded-[2rem]"
              >
                {saving ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Entwurf
              </button>
              <button
                type="submit"
                disabled={saving || submitting}
                className="btn-primary flex-[2] lg:flex-none py-4 px-12 rounded-[2rem] bg-indigo-900"
              >
                {submitting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 fill-current" />
                )}
                Abschließen & Senden
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Contact Selector Modal */}
      {showContactSelector && (
        <ContactSelector
          onSelect={handleContactSelect}
          onClose={() => setShowContactSelector(false)}
        />
      )}
    </div>
  );
}

// Simple Signature Pad Component
function SignaturePad({ onCapture }: { onCapture: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    onCapture(dataUrl);
  };

  return (
    <div className="border-2 border-gray-300 rounded-xl bg-white">
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full h-48 cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <p className="text-xs text-gray-500 p-2 text-center">Hier unterschreiben</p>
    </div>
  );
}

