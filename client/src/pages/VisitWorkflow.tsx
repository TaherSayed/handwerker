import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import ContactSelector from '../components/ContactSelector';
import { GoogleContact } from '../services/google-contacts.service';
import { secureStorage } from '../services/secure-storage.service';
import {
    ArrowLeft,
    ArrowRight,
    User,
    FileText,
    ClipboardList,
    CheckCircle2,
    Loader,
    Save,
    Zap,
    Camera,
    Trash2
} from 'lucide-react';

// Steps: 1. Customer, 2. Template, 3. Form, 4. Finish
type WorkflowStep = 'customer' | 'template' | 'form' | 'finish';

export default function VisitWorkflow() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialTemplateId = searchParams.get('templateId');

    const [currentStep, setCurrentStep] = useState<WorkflowStep>('customer');
    const [error, setError] = useState<string | null>(null);

    // Workflow State
    const [customer, setCustomer] = useState<GoogleContact | null>(null);
    const [isManualCustomer, setIsManualCustomer] = useState(false);
    const [manualCustomer, setManualCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
    const [signature, setSignature] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [, setIsSavingDraft] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);

    useEffect(() => {
        if (initialTemplateId) {
            loadInitialTemplate(initialTemplateId);
        }
        loadTemplates();
    }, [initialTemplateId]);

    const loadInitialTemplate = async (id: string) => {
        try {
            const data = await apiService.getTemplate(id);
            setSelectedTemplate(data);
        } catch (err) {
            console.error('Failed to load initial template:', err);
        }
    };

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            // Add a timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 15000)
            );
            const fetchPromise = apiService.getTemplates({ is_archived: false });

            const data = await Promise.race([fetchPromise, timeoutPromise]) as any[];
            setTemplates(data || []);
        } catch (err) {
            console.error('Failed to load templates:', err);
            // Don't show critical error for templates load fail, just empty list
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleContactSelect = (contact: GoogleContact) => {
        setCustomer(contact);
        setIsManualCustomer(false);
        setCurrentStep('template');
    };

    const handleManualCustomerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCustomer.name) {
            setError('Customer name is required');
            return;
        }
        setIsManualCustomer(true);
        setCurrentStep('template');
    };

    const handleTemplateSelect = (template: any) => {
        setSelectedTemplate(template);
        // Initialize fields
        const initialValues: Record<string, any> = {};
        template.fields?.forEach((f: any) => {
            if (f.default_value !== undefined) initialValues[f.id] = f.default_value;
            else if (f.type === 'checkbox' || f.type === 'toggle') initialValues[f.id] = false;
        });
        setFieldValues(initialValues);
        setCurrentStep('form');
    };

    const handleFieldChange = (fieldId: string, value: any) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const validateForm = () => {
        if (!selectedTemplate) return false;
        for (const field of selectedTemplate.fields || []) {
            if (field.required) {
                const value = fieldValues[field.id];
                if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    setError(`Field "${field.label}" is required`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSave = async (status: 'draft' | 'submitted' = 'submitted') => {
        if (!selectedTemplate) return;
        if (status === 'submitted' && !validateForm()) return;

        try {
            if (status === 'submitted') setIsSubmitting(true);
            else setIsSavingDraft(true);

            setError(null);

            const submissionData = {
                template_id: selectedTemplate.id,
                customer_name: isManualCustomer ? manualCustomer.name : customer?.name,
                customer_email: isManualCustomer ? manualCustomer.email : customer?.email,
                customer_phone: isManualCustomer ? manualCustomer.phone : customer?.phone,
                customer_address: isManualCustomer ? manualCustomer.address : customer?.address,
                customer_contact_id: isManualCustomer ? null : customer?.id,
                field_values: fieldValues,
                signature_url: signature,
                status: status,
            };

            const result = await apiService.createSubmission(submissionData);

            if (status === 'submitted') {
                // Trigger PDF generation in background or wait
                try {
                    const pdfResult = await apiService.generatePDF(result.id) as any;
                    const pdfUrl = pdfResult.pdf_url;
                    
                    // Download and store PDF locally
                    let localPdfId = pdfUrl;
                    try {
                        localPdfId = await apiService.downloadAndStorePDF(result.id, pdfUrl);
                    } catch (storeErr) {
                        console.warn('Failed to store PDF locally:', storeErr);
                        // Continue with remote URL if local storage fails
                    }
                    
                    setSubmissionResult({ ...result, pdf_url: localPdfId, remote_pdf_url: pdfUrl });
                } catch (err) {
                    console.warn('PDF generation failed, but submission succeeded:', err);
                    setSubmissionResult(result);
                }
                setCurrentStep('finish');
            } else {
                // Just show a toast or message
                alert('Draft saved!');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save visit');
        } finally {
            setIsSubmitting(false);
            setIsSavingDraft(false);
        }
    };

    const renderField = (field: any) => {
        const value = fieldValues[field.id];
        const hasError = field.required && (value === undefined || value === null || value === '');

        switch (field.type) {
            case 'section':
                return (
                    <div className="pt-8 pb-2 border-b-2 border-slate-900 mb-4 first:pt-0">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{field.label}</h3>
                        {field.help_text && <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{field.help_text}</p>}
                    </div>
                );

            case 'text':
            case 'number':
                return (
                    <input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => handleFieldChange(field.id, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        className={`input ${hasError ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );

            case 'checkbox':
            case 'toggle':
                return (
                    <label className="flex items-center gap-4 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <input
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                            className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-bold text-slate-700 text-sm uppercase tracking-tight">{field.label}</span>
                    </label>
                );

            case 'dropdown':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`input ${hasError ? 'border-red-500 bg-red-50' : ''}`}
                    >
                        <option value="">Select an option</option>
                        {field.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'date':
            case 'datetime':
                return (
                    <input
                        type={field.type === 'datetime' ? 'datetime-local' : 'date'}
                        value={value || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`input ${hasError ? 'border-red-500 bg-red-50' : ''}`}
                    />
                );

            case 'notes':
                return (
                    <textarea
                        value={value || ''}
                        rows={3}
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                        }}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`input min-h-[80px] py-3 resize-none overflow-hidden ${hasError ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder={field.placeholder || 'Type notes here...'}
                    />
                );

            case 'signature':
                return (
                    <div className="space-y-3">
                        {signature ? (
                            <div className="relative overflow-hidden rounded-[2rem] border-2 border-slate-100 bg-white shadow-inner">
                                <img src={signature} alt="Signature" className="w-full h-40 object-contain p-4" />
                                <button
                                    type="button"
                                    onClick={() => setSignature(null)}
                                    className="absolute top-4 right-4 p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="card p-0 overflow-hidden border-2 border-slate-100 bg-white focus-within:border-indigo-500 transition-colors">
                                <SignaturePad onCapture={setSignature} />
                            </div>
                        )}
                    </div>
                );

            case 'photo':
                return (
                    <div className="space-y-4">
                        <div className={`relative h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all ${value ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}>
                            {value ? (
                                <>
                                    <img src={value} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
                                    <button
                                        type="button"
                                        onClick={() => handleFieldChange(field.id, null)}
                                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Capture Photo</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => handleFieldChange(field.id, event.target?.result);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                );

            default:
                return <p className="text-xs text-red-500 italic">Unknown field type: {field.type}</p>;
        }
    };

    const renderStepIndicator = () => {
        const steps: { key: WorkflowStep; label: string; icon: any }[] = [
            { key: 'customer', label: 'Kunde', icon: User },
            { key: 'template', label: 'Vorlage', icon: FileText },
            { key: 'form', label: 'Details', icon: ClipboardList },
            { key: 'finish', label: 'Fertig', icon: CheckCircle2 },
        ];

        return (
            <div className="flex items-center justify-between mb-12 px-2 max-w-sm mx-auto overflow-hidden">
                {steps.map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = currentStep === s.key;
                    const isDone = steps.findIndex(st => st.key === currentStep) > idx;

                    return (
                        <div key={s.key} className="flex flex-col items-center gap-2 relative">
                            {idx > 0 && (
                                <div className={`absolute right-[calc(50%+20px)] top-5 w-full h-[2px] -z-10 transition-colors duration-500 ${isDone || isActive ? 'bg-indigo-600' : 'bg-slate-100'
                                    }`} />
                            )}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110 z-10' :
                                isDone ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'
                                }`}>
                                {isDone ? <CheckCircle2 className="w-5 h-5 animate-in zoom-in" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-indigo-600' : 'text-slate-400'
                                }`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`animate-slide-up max-w-2xl mx-auto py-4 px-3 lg:py-8 lg:px-4 ${currentStep === 'form' ? 'pb-32 has-sticky-bar' : 'pb-24'}`}>
            {/* Navigation Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => {
                        if (currentStep === 'customer') navigate('/dashboard');
                        else if (currentStep === 'template') setCurrentStep('customer');
                        else if (currentStep === 'form') setCurrentStep('template');
                        else if (currentStep === 'finish') navigate('/dashboard');
                    }}
                    className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Neuer Einsatz</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                        {currentStep === 'customer' ? 'Kunde' :
                            currentStep === 'template' ? 'Vorlage' :
                                currentStep === 'form' ? 'Dateneingabe' : 'Abschluss'}
                    </p>
                </div>
            </div>

            {currentStep !== 'finish' && renderStepIndicator()}

            {/* Step Content */}
            <div className="space-y-8">
                {currentStep === 'customer' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-3 mb-4">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wer ist der Kunde?</h2>
                            <p className="text-slate-500 font-medium">Erfassen Sie die Kundendaten für den Bericht.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <ContactSelector onSelect={handleContactSelect} onClose={() => { }} initialContact={null} />

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300"><span className="bg-slate-50 px-6 tracking-[0.2em]">ODER MANUELL</span></div>
                            </div>

                            <form onSubmit={handleManualCustomerSubmit} className="card bg-white dark:bg-dark-card p-8 space-y-6 border-slate-100 dark:border-dark-stroke shadow-2xl shadow-indigo-500/5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kunde / Projektname</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="z.B. Mustermann GmbH Anlage 4"
                                        value={manualCustomer.name}
                                        onChange={e => setManualCustomer({ ...manualCustomer, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Standort / Adresse</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Musterstraße 123, Berlin"
                                        value={manualCustomer.address}
                                        onChange={e => setManualCustomer({ ...manualCustomer, address: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="group flex items-center justify-center gap-3 bg-indigo-900 text-white w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100">
                                    Manuell fortfahren <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {currentStep === 'template' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-3">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vorlage wählen</h2>
                            <p className="text-slate-500 font-medium">Welches Formular soll verwendet werden?</p>
                        </div>

                        {isLoadingTemplates ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTemplateSelect(t)}
                                        className="group flex items-center gap-5 p-6 bg-white dark:bg-dark-input rounded-[2.5rem] border border-slate-100 dark:border-dark-stroke hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all text-left"
                                    >
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-dark-card text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight group-hover:text-indigo-600 transition-colors truncate">{t.name}</h4>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">{t.description || 'Service record template'}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-dark-card flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all shrink-0">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </button>
                                ))}
                                {templates.length === 0 && (
                                    <div className="text-center py-12 bg-slate-50 rounded-[2.5rem]">
                                        <p className="text-slate-400 font-bold">Keine Vorlagen gefunden.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 'form' && selectedTemplate && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-dark-card rounded-[2rem] p-5 md:p-8 space-y-8 border border-slate-100 dark:border-dark-stroke shadow-xl shadow-indigo-500/5">
                            <div className="pb-6 border-b border-slate-100 dark:border-dark-stroke flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em]">
                                    <User className="w-3.5 h-3.5" />
                                    <span className="truncate">{isManualCustomer ? manualCustomer.name : customer?.name}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{selectedTemplate.name}</h2>
                            </div>

                            <div className="space-y-6">
                                {selectedTemplate.fields?.map((field: any) => (
                                    <div key={field.id} className="space-y-1.5">
                                        {field.type !== 'section' && (
                                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.1em] ml-1 block">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                        )}
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sticky Action Bar */}
                        <div className="sticky-action-bar grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleSave('draft')}
                                className="flex items-center justify-center gap-2 bg-white dark:bg-dark-input text-slate-700 dark:text-dark-text-body border border-slate-200 dark:border-dark-stroke py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-dark-highlight transition-all shadow-sm active:scale-[0.98]"
                            >
                                <Save className="w-4 h-4" /> Entwurf
                            </button>
                            <button
                                onClick={() => handleSave('submitted')}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 bg-indigo-900 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                            >
                                {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                                Abschließen
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'finish' && submissionResult && (
                    <FinishStep 
                        submissionResult={submissionResult}
                        onBack={() => navigate('/dashboard')}
                    />
                )}
            </div>

            {error && (
                <div className="fixed bottom-32 left-4 right-4 bg-red-600 text-white p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-300 flex items-center justify-between z-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <span className="font-black text-lg">!</span>
                        </div>
                        <p className="font-bold text-sm tracking-tight">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

// Finish Step Component with PDF handling
function FinishStep({ submissionResult, onBack }: { submissionResult: any; onBack: () => void }) {
    const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

    useEffect(() => {
        // Check if PDF is stored locally
        const checkLocalPDF = async () => {
            if (submissionResult.id && submissionResult.pdf_url) {
                try {
                    // Check if it's a local file ID (starts with pdf_)
                    if (submissionResult.pdf_url.startsWith('pdf_')) {
                        const url = await secureStorage.getFileUrl(submissionResult.pdf_url);
                        if (url) {
                            setLocalPdfUrl(url);
                        }
                    }
                } catch (error) {
                    console.warn('Failed to load local PDF:', error);
                }
            }
        };
        checkLocalPDF();
    }, [submissionResult]);

    const handleViewPDF = async () => {
        try {
            // First, try local PDF if available
            if (localPdfUrl) {
                window.open(localPdfUrl, '_blank', 'noopener,noreferrer');
                return;
            }

            // Check if it's a local file ID
            if (submissionResult.pdf_url && submissionResult.pdf_url.startsWith('pdf_')) {
                const url = await secureStorage.getFileUrl(submissionResult.pdf_url);
                if (url) {
                    setLocalPdfUrl(url);
                    window.open(url, '_blank', 'noopener,noreferrer');
                    return;
                }
            }

            // Get remote URL (either from remote_pdf_url or pdf_url)
            const remoteUrl = (submissionResult as any).remote_pdf_url || submissionResult.pdf_url;
            
            if (remoteUrl && typeof remoteUrl === 'string' && remoteUrl.startsWith('http')) {
                // Open remote PDF immediately
                const newWindow = window.open(remoteUrl, '_blank', 'noopener,noreferrer');
                
                // If popup was blocked, try direct navigation
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    // Fallback: create a temporary link and click it
                    const link = document.createElement('a');
                    link.href = remoteUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                
                // Try to download and store it locally in background
                if (submissionResult.id) {
                    setLoadingPdf(true);
                    apiService.downloadAndStorePDF(submissionResult.id, remoteUrl)
                        .then(async (fileId) => {
                            const url = await secureStorage.getFileUrl(fileId);
                            if (url) setLocalPdfUrl(url);
                        })
                        .catch((error) => {
                            console.warn('Failed to store PDF locally:', error);
                        })
                        .finally(() => {
                            setLoadingPdf(false);
                        });
                }
            } else {
                console.error('No valid PDF URL found:', submissionResult);
                alert('PDF konnte nicht geöffnet werden. Bitte versuchen Sie es später erneut.');
            }
        } catch (error) {
            console.error('Error opening PDF:', error);
            alert('Fehler beim Öffnen des PDFs. Bitte versuchen Sie es erneut.');
        }
    };

    return (
        <div className="text-center space-y-10 py-16 animate-in zoom-in fade-in duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-green-200 blur-3xl rounded-full opacity-30 animate-pulse" />
                <div className="relative w-32 h-32 bg-green-500 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-100">
                    <CheckCircle2 className="w-16 h-16" />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Auftrag erledigt!</h2>
                <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto">
                    Besuchsdokumentation erfolgreich erstellt und gespeichert.
                    {localPdfUrl && <span className="block mt-2 text-xs text-green-600">✓ Lokal gespeichert</span>}
                </p>
            </div>

            <div className="max-w-xs mx-auto space-y-4 pt-6">
                {(submissionResult.pdf_url || localPdfUrl) && (
                    <button
                        onClick={handleViewPDF}
                        disabled={loadingPdf}
                        className="group flex items-center justify-center gap-3 bg-slate-900 text-white w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-70"
                    >
                        {loadingPdf ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                PDF-Bericht ansehen
                            </>
                        )}
                    </button>
                )}
                <button
                    onClick={onBack}
                    className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                    Zurück zur Übersicht
                </button>
            </div>
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

        ctx.strokeStyle = '#1e1b4b'; // indigo-950
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Resize to container
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight || 200;
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const getPos = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: any) => {
        setIsDrawing(true);
        const pos = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            onCapture(canvas.toDataURL());
        }
    };

    return (
        <div className="w-full h-48 relative bg-white dark:bg-white rounded-[2rem] overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="absolute bottom-4 left-0 right-0 pointer-events-none flex justify-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Unterschrift</span>
            </div>
        </div>
    );
}
