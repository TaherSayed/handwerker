import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import ContactSelector from '../components/ContactSelector';
import { GoogleContact } from '../services/google-contacts.service';
import { Save, Send, ArrowLeft, User, Zap, ClipboardList, Plus, Trash2 } from 'lucide-react';
import Button from '../components/common/Button';
import { useNotificationStore } from '../store/notificationStore';

export default function FormFilling() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const { success, error: notifyError } = useNotificationStore();

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
      notifyError('Pflichtfeld fehlt', 'Bitte geben Sie den Kundennamen ein');
      setError('Bitte geben Sie den Kundennamen ein');
      return false;
    }

    // Check required form fields
    for (const field of template.fields || []) {
      if (field.required) {
        const value = fieldValues[field.id];
        if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0)) {
          notifyError('Pflichtfeld fehlt', `Bitte füllen Sie das Pflichtfeld aus: ${field.label}`);
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

      const result = await apiService.createSubmission(submissionData);

      if (status === 'submitted') {
        if ((result as any).is_offline) {
          success('Einsatz lokal gespeichert', 'Daten werden übertragen sobald Internet verfügbar ist.');
        } else {
          success('Einsatz eingereicht', 'Bericht wurde erfolgreich gespeichert und archiviert.');
        }
        navigate('/submissions');
      } else {
        success('Entwurf gespeichert', 'Sie können diesen Einsatz später im Verlauf fortsetzen.');
      }
    } catch (error: any) {
      console.error('Save submission error:', error);
      notifyError('Fehler beim Speichern', error.message || 'Die Daten konnten nicht übertragen werden.');
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
              <div className="relative group/sig">
                <img src={signature} alt="Unterschrift" className="w-full max-w-md h-32 object-contain border-2 border-slate-100 rounded-[1.5rem] bg-white shadow-sm" />
                <button
                  type="button"
                  onClick={() => setSignature(null)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover/sig:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
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
              id={`photo-${field.id}`}
              type="file"
              accept="image/*"
              capture="environment"
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
              className="hidden"
            />
            <div className="flex flex-col gap-4">
              {value ? (
                <div className="relative group/photo w-full max-w-md">
                  <img src={value} alt="Hochgeladen" className="w-full h-48 object-cover rounded-[1.5rem] border border-slate-100 shadow-md" />
                  <button
                    type="button"
                    onClick={() => handleFieldChange(field.id, null)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover/photo:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full max-w-md border-dashed border-2 py-8 bg-slate-50/50 hover:bg-white"
                  onClick={() => document.getElementById(`photo-${field.id}`)?.click()}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Foto aufnehmen
                </Button>
              )}
            </div>
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
    <div className="animate-fade-in flex flex-col min-h-full pb-40 lg:pb-12 text-slate-900 dark:text-dark-text-body">
      {/* Sticky Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-dark-background/90 backdrop-blur-xl border-b border-border-light dark:border-dark-stroke px-4 py-4 flex items-center gap-4 transition-colors">
        <button
          onClick={() => navigate('/templates')}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-dark-highlight rounded-2xl transition-all active:scale-90 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-dark-text-muted" />
        </button>
        <div className="min-w-0">
          <h1 className="font-bold text-slate-900 dark:text-white truncate uppercase text-sm tracking-tight leading-none">{template.name}</h1>
          <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-[0.15em] leading-none mt-1.5">Protokoll erstellen</p>
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-4xl mx-auto w-full space-y-12">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-8 mb-16">
          <button
            onClick={() => navigate('/templates')}
            className="w-14 h-14 bg-white dark:bg-dark-card border border-border-light dark:border-dark-stroke rounded-[20px] flex items-center justify-center text-slate-600 dark:text-dark-text-muted hover:border-primary-light transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{template.name}</h1>
            <p className="text-slate-500 dark:text-dark-text-muted font-medium text-lg">{template.description || 'Bitte füllen Sie die Details gewissenhaft aus.'}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-error-dark/10 border-l-4 border-error-light rounded-2xl p-5 shadow-sm animate-shake">
            <p className="text-error-light font-bold text-sm tracking-wide">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave('submitted'); }} className="space-y-12">
          {/* Section: Customer */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark rounded-[22px] flex items-center justify-center border border-primary-light/10">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Kundendaten</h2>
                  <p className="text-[11px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest mt-2">{customerInfo.contact_id ? '✓ Verknüpft mit Google Contacts' : 'Kontaktinformationen'}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-12 px-6 rounded-2xl border-border-light dark:border-dark-stroke dark:bg-dark-card hover:border-primary-light"
                onClick={() => setShowContactSelector(true)}
                icon={<Zap className="w-4 h-4 text-warning-light fill-warning-light/20" />}
              >
                Importieren
              </Button>
            </div>

            <div className="card p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-[32px] shadow-sm">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-[0.2em] px-1">Vollständiger Name *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="input h-14 font-medium"
                  placeholder="Max Mustermann"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-[0.2em] px-1">E-Mail Adresse</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="input h-14 font-medium"
                  placeholder="max@beispiel.de"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-[0.2em] px-1">Telefonnummer</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="input h-14 font-bold"
                  placeholder="+49 (0) 123 456789"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-[0.2em] px-1">Einsatzort / Adresse</label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="input h-14 font-bold"
                  placeholder="Beispielstraße 1, 12345 Stadt"
                />
              </div>
            </div>
          </section>

          {/* Section: Form Body */}
          <section className="space-y-8">
            <div className="flex items-center gap-5 px-1">
              <div className="w-14 h-14 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark rounded-[22px] flex items-center justify-center border border-primary-light/10">
                <ClipboardList className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Berichts-Details</h2>
            </div>

            <div className="card p-8 space-y-10 bg-white dark:bg-dark-card border-border-light dark:border-dark-stroke rounded-[40px] shadow-sm">
              {template.fields?.map((field: any) => (
                <div key={field.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {field.type !== 'section' && (
                    <label className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-[0.25em] px-1 block mb-2">
                      {field.label}
                      {field.required && <span className="text-error-light ml-2 font-bold">*</span>}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>
          </section>

          {/* Action Bar (Mobile Floating / Desktop Inline) */}
          <div className="fixed bottom-24 lg:bottom-0 left-0 right-0 p-4 lg:p-0 z-50 lg:z-auto pointer-events-none lg:pointer-events-auto">
            <div className="max-w-4xl mx-auto flex gap-4 p-4 bg-white/95 dark:bg-dark-background/95 backdrop-blur-2xl rounded-[32px] border border-border-light dark:border-dark-stroke shadow-2xl lg:shadow-none lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:justify-end pointer-events-auto">
              <Button
                type="button"
                onClick={() => handleSave('draft')}
                loading={saving}
                disabled={submitting}
                variant="secondary"
                className="flex-1 lg:flex-none h-14 px-8 rounded-2xl bg-slate-100 dark:bg-dark-highlight hover:bg-slate-200 border-none font-semibold uppercase tracking-widest text-xs"
                icon={<Save className="w-5 h-5" />}
              >
                Als Entwurf
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={saving}
                variant="primary"
                className="flex-[2] lg:flex-none h-14 px-10 rounded-2xl shadow-xl shadow-primary-light/20 font-semibold uppercase tracking-widest text-xs"
                icon={<Send className="w-5 h-5 fill-current" />}
              >
                Abschließen
              </Button>
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
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0f172a'; // slate-900
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent | any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setIsEmpty(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    onCapture(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onCapture('');
  };

  return (
    <div className="relative border-2 border-slate-100 rounded-[2rem] bg-slate-50/50 overflow-hidden group/pad transition-all hover:border-indigo-100">
      <canvas
        ref={canvasRef}
        className="w-full h-56 cursor-crosshair touch-none bg-transparent"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/pad:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={clear}
          className="bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 p-3 rounded-2xl shadow-lg border border-slate-100 transition-all active:scale-95"
          title="Löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${isEmpty ? 'text-slate-400 opacity-60' : 'text-indigo-500 opacity-0 translate-y-2'
          }`}>
          Hier unterschreiben
        </p>
      </div>

      {/* Decorative lines to look like a document */}
      <div className="absolute bottom-10 left-8 right-8 h-[1px] bg-slate-200/50 pointer-events-none" />
    </div>
  );
}

