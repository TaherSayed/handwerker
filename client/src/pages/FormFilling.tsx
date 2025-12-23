import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import ContactSelector from '../components/ContactSelector';
import { googleContactsService, GoogleContact } from '../services/google-contacts.service';
import { Save, Send, ArrowLeft, User, Mail, Phone, MapPin, Loader } from 'lucide-react';

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
      setError(error.message || 'Failed to load template');
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
      setError('Please enter customer name');
      return false;
    }

    // Check required form fields
    for (const field of template.fields || []) {
      if (field.required) {
        const value = fieldValues[field.id];
        if (value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          setError(`Please fill in required field: ${field.label}`);
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
        successMsg.textContent = 'Draft saved successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          document.body.removeChild(successMsg);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Save submission error:', error);
      setError(error.message || 'Failed to save submission. Please try again.');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.id];
    const hasError = field.required && (value === undefined || value === null || value === '');

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            className={`input ${hasError ? 'border-red-500' : ''}`}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
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
            <div className={`relative w-14 h-7 rounded-full transition-colors ${
              value ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                value ? 'translate-x-7' : ''
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
            <option value="">Select {field.label}</option>
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
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'signature':
        return (
          <div className="space-y-3">
            {signature ? (
              <div className="relative">
                <img src={signature} alt="Signature" className="w-full max-w-md h-32 object-contain border-2 border-gray-200 rounded-xl bg-white" />
                <button
                  type="button"
                  onClick={() => setSignature(null)}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                >
                  Clear
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
              <img src={value} alt="Uploaded" className="w-full max-w-md h-48 object-cover rounded-xl border border-gray-200" />
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
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
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
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <button
          onClick={() => navigate('/templates')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{template.name}</h1>
          <p className="text-gray-600 text-lg">{template.description || 'Fill out the form below'}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave('submitted'); }}>
        {/* Customer Information */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
            <button
              type="button"
              onClick={() => setShowContactSelector(true)}
              className="btn-secondary text-sm"
            >
              <User className="w-4 h-4" />
              Import from Google
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="input"
                placeholder="Customer name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="input"
                placeholder="customer@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="input"
                placeholder="123 Main St, City, State ZIP"
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Form Fields</h2>
          <div className="space-y-6">
            {template.fields?.map((field: any) => (
              <div key={field.id}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving || submitting}
            className="btn-secondary"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Draft
              </>
            )}
          </button>
          <button
            type="submit"
            disabled={saving || submitting}
            className="btn-primary"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Form
              </>
            )}
          </button>
        </div>
      </form>

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
      <p className="text-xs text-gray-500 p-2 text-center">Sign above</p>
    </div>
  );
}

