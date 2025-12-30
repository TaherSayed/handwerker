import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Trash2, Save, X,
  Settings, Copy, ChevronUp, ChevronDown, Type, Hash, CheckSquare,
  ToggleLeft, List, Calendar, Clock, StickyNote, PenTool, Camera,
  Heading, Plus, User, Mail, MapPin, Phone, FileText, Radio,
  Upload, Minus, Star, BarChart3, AlignLeft, ListOrdered, FilePlus
} from 'lucide-react';

// Categorized field types like Jotform
const FIELD_CATEGORIES = {
  basic: [
    { value: 'section', label: 'Überschrift', icon: Heading, color: '#6366f1' },
    { value: 'fullname', label: 'Vollständiger Name', icon: User, color: '#3b82f6' },
    { value: 'email', label: 'E-Mail', icon: Mail, color: '#3b82f6' },
    { value: 'address', label: 'Adresse', icon: MapPin, color: '#3b82f6' },
    { value: 'phone', label: 'Telefon', icon: Phone, color: '#3b82f6' },
    { value: 'text', label: 'Kurzer Text', icon: Type, color: '#3b82f6' },
    { value: 'longtext', label: 'Langer Text', icon: FileText, color: '#3b82f6' },
    { value: 'paragraph', label: 'Absatz', icon: AlignLeft, color: '#3b82f6' },
    { value: 'dropdown', label: 'Auswahlliste', icon: List, color: '#8b5cf6' },
    { value: 'radio', label: 'Einzelauswahl', icon: Radio, color: '#8b5cf6' },
    { value: 'checkbox', label: 'Mehrfachauswahl', icon: CheckSquare, color: '#f59e0b' },
    { value: 'number', label: 'Zahl', icon: Hash, color: '#10b981' },
    { value: 'date', label: 'Datumsauswahl', icon: Calendar, color: '#14b8a6' },
    { value: 'time', label: 'Uhrzeit', icon: Clock, color: '#0ea5e9' },
    { value: 'datetime', label: 'Termin', icon: Calendar, color: '#0ea5e9' },
    { value: 'photo', label: 'Bild', icon: Camera, color: '#6366f1' },
    { value: 'fileupload', label: 'Datei-Upload', icon: Upload, color: '#6366f1' },
    { value: 'spinner', label: 'Zahlenfeld', icon: Hash, color: '#10b981' },
  ],
  survey: [
    { value: 'table', label: 'Eingabetabelle', icon: List, color: '#8b5cf6' },
    { value: 'starrating', label: 'Sternebewertung', icon: Star, color: '#f59e0b' },
    { value: 'scalerating', label: 'Skalenbewertung', icon: BarChart3, color: '#14b8a6' },
  ],
  page: [
    { value: 'section', label: 'Abschnitt', icon: ListOrdered, color: '#4f46e5' },
    { value: 'page', label: 'Neue Seite', icon: FilePlus, color: '#4f46e5' },
    { value: 'divider', label: 'Trennlinie', icon: Minus, color: '#64748b' },
  ],
  advanced: [
    { value: 'signature', label: 'Unterschrift', icon: PenTool, color: '#ef4444' },
    { value: 'fillblank', label: 'Lückentext', icon: Type, color: '#3b82f6' },
    { value: 'notes', label: 'Notizen', icon: StickyNote, color: '#64748b' },
    { value: 'toggle', label: 'Ja/Nein Schalter', icon: ToggleLeft, color: '#ec4899' },
  ]
};

const ALL_FIELD_TYPES = [
  ...FIELD_CATEGORIES.basic,
  ...FIELD_CATEGORIES.survey,
  ...FIELD_CATEGORIES.page,
  ...FIELD_CATEGORIES.advanced
];

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'basic' | 'survey' | 'page' | 'advanced'>('basic');
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showElementPalette, setShowElementPalette] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobileState = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On desktop, always show palette; on mobile, hide by default
      if (!mobile) {
        setShowElementPalette(true);
      } else {
        setShowElementPalette(false);
      }
    };

    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    return () => window.removeEventListener('resize', updateMobileState);
  }, []);

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

  useEffect(() => {
    if (showElementPalette && isMobile) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [showElementPalette, isMobile]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTemplate(id!) as any;
      setFormData({
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        tags: data.tags || [],
        fields: data.fields || [],
      });
    } catch (error: any) {
      console.error('Load template error:', error);
      setError('Fehler beim Laden der Vorlage');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Bitte geben Sie einen Vorlagennamen ein');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (id) {
        await apiService.updateTemplate(id, formData);
      } else {
        await apiService.createTemplate(formData);
      }

      navigate('/templates');
    } catch (error: any) {
      console.error('Save template error:', error);
      setError(error?.message || 'Fehler beim Speichern der Vorlage');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const addField = (type: string, insertIndex?: number) => {
    const fieldType = ALL_FIELD_TYPES.find(t => t.value === type);
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: fieldType?.label || 'Neues Feld',
      sublabel: '',
      required: false,
      options: (type === 'dropdown' || type === 'radio' || type === 'checkbox') ? ['Option 1', 'Option 2'] : undefined,
      placeholder: '',
      help_text: '',
    };

    if (insertIndex !== undefined) {
      const newFields = [...formData.fields];
      newFields.splice(insertIndex, 0, newField);
      setFormData({ ...formData, fields: newFields });
      setSelectedFieldIndex(insertIndex);
    } else {
      setFormData({ ...formData, fields: [...formData.fields, newField] });
      setSelectedFieldIndex(formData.fields.length);
    }

    // Close palette on mobile after adding field
    setShowElementPalette(false);
  };

  const duplicateField = (index: number) => {
    const field = formData.fields[index];
    const newField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    const newFields = [...formData.fields];
    newFields.splice(index + 1, 0, newField);
    setFormData({ ...formData, fields: newFields });
    setSelectedFieldIndex(index + 1);
  };

  const updateField = (index: number, updates: any) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
    if (selectedFieldIndex === index) {
      setSelectedFieldIndex(null);
    } else if (selectedFieldIndex !== null && selectedFieldIndex > index) {
      setSelectedFieldIndex(selectedFieldIndex - 1);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, fields: items });

    // Update selected index
    if (selectedFieldIndex === result.source.index) {
      setSelectedFieldIndex(result.destination.index);
    } else if (selectedFieldIndex !== null) {
      if (selectedFieldIndex > result.source.index && selectedFieldIndex <= result.destination.index) {
        setSelectedFieldIndex(selectedFieldIndex - 1);
      } else if (selectedFieldIndex < result.source.index && selectedFieldIndex >= result.destination.index) {
        setSelectedFieldIndex(selectedFieldIndex + 1);
      }
    }
  };

  const renderFieldPreview = (field: any) => {
    switch (field.type) {
      case 'section':
        return (
          <div className="pt-4 pb-2 border-b-2 border-slate-300 dark:border-dark-stroke">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{field.label || 'Abschnittsüberschrift'}</h3>
            {field.sublabel && <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">{field.sublabel}</p>}
          </div>
        );
      case 'text':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Kurzer Text'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="text"
              placeholder={field.placeholder || 'Text eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'fullname':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Vollständiger Name'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="text"
              placeholder={field.placeholder || 'Vor- und Nachname eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'email':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'E-Mail'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="email"
              placeholder={field.placeholder || 'E-Mail-Adresse eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'phone':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Telefon'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="tel"
              placeholder={field.placeholder || 'Telefonnummer eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'fillblank':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Lückentext'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="text"
              placeholder={field.placeholder || 'Text eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'spinner':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Zahlenfeld'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="number"
              placeholder={field.placeholder || 'Zahl eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'number':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Zahl'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="number"
              placeholder={field.placeholder || 'Zahl eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'address':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Adresse'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <textarea
              placeholder={field.placeholder || 'Adresse eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white min-h-[80px]"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'longtext':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Langer Text'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <textarea
              placeholder={field.placeholder || 'Text eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white min-h-[100px]"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'paragraph':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Absatz'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <textarea
              placeholder={field.placeholder || 'Text eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input text-slate-700 dark:text-white min-h-[100px]"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'checkbox':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Mehrfachauswahl'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <div className="space-y-2">
              {field.options?.map((opt: string, i: number) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'radio':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {field.label || 'Einzelauswahl'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 mb-2">{field.sublabel}</p>}
            <div className="space-y-2">
              {field.options?.map((opt: string, i: number) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name={`radio_${field.id}`} className="w-4 h-4" />
                  <span className="text-sm text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
            {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
          </div>
        );
      case 'toggle':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Ja/Nein'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-dark-stroke bg-white dark:bg-dark-input" />
              <span className="text-sm text-slate-600 dark:text-dark-text-body">Ein/Aus</span>
            </label>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'dropdown':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Auswahlliste'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-white dark:bg-dark-input text-slate-900 dark:text-white">
              <option className="dark:bg-dark-card">Auswählen...</option>
              {field.options?.map((opt: string, i: number) => (
                <option key={i} className="dark:bg-dark-card">{opt}</option>
              ))}
            </select>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'date':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Datumsauswahl'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="date"
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-white dark:bg-dark-input text-slate-900 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'time':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Uhrzeit'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="time"
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-white dark:bg-dark-input text-slate-900 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'datetime':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Termin'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-white dark:bg-dark-input text-slate-900 dark:text-white"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'notes':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Notizen'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <textarea
              placeholder={field.placeholder || 'Notizen eingeben...'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-white dark:bg-dark-input text-slate-900 dark:text-white min-h-[80px]"
            />
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'signature':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Unterschrift'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input flex items-center justify-center">
              <span className="text-sm text-slate-400 dark:text-dark-text-muted">Unterschrift hier</span>
            </div>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'photo':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Bild'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input flex items-center justify-center">
              <span className="text-sm text-slate-400 dark:text-dark-text-muted">Bild hier</span>
            </div>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'fileupload':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Datei-Upload'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-dark-stroke rounded-lg bg-slate-50 dark:bg-dark-input flex items-center justify-center">
              <span className="text-sm text-slate-400 dark:text-dark-text-muted">Datei hier hochladen</span>
            </div>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'table':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Eingabetabelle'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <div className="border border-slate-300 dark:border-dark-stroke rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-dark-highlight">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-white border-r border-slate-300 dark:border-dark-stroke">Spalte 1</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-white">Spalte 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border-r border-t border-slate-300 dark:border-dark-stroke">
                      <input type="text" placeholder="Eingabe..." className="w-full px-2 py-1 border border-slate-300 dark:border-dark-stroke rounded bg-white dark:bg-dark-input text-slate-900 dark:text-white text-xs" />
                    </td>
                    <td className="px-3 py-2 border-t border-slate-300 dark:border-dark-stroke">
                      <input type="text" placeholder="Eingabe..." className="w-full px-2 py-1 border border-slate-300 dark:border-dark-stroke rounded bg-white dark:bg-dark-input text-slate-900 dark:text-white text-xs" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'starrating':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Sternebewertung'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl text-slate-300 dark:text-dark-stroke cursor-pointer hover:text-yellow-400 transition-colors">★</span>
              ))}
            </div>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'scalerating':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Skalenbewertung'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.sublabel && <p className="text-xs text-slate-500 dark:text-dark-text-muted mb-2">{field.sublabel}</p>}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-dark-text-muted">1</span>
              <div className="flex-1 h-2 bg-slate-200 dark:bg-dark-highlight rounded-full">
                <div className="h-full w-0 bg-indigo-500 rounded-full"></div>
              </div>
              <span className="text-xs text-slate-500 dark:text-dark-text-muted">10</span>
            </div>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'divider':
        return (
          <div className="py-4">
            <div className="border-t-2 border-slate-300 dark:border-dark-stroke"></div>
            {field.help_text && <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-2 text-center">{field.help_text}</p>}
          </div>
        );
      case 'section':
        return (
          <div className="pt-6 pb-2 border-b-2 border-slate-900 dark:border-white mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {field.label || 'Abschnitt Name'}
            </h3>
            {field.help_text && <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-1">{field.help_text}</p>}
          </div>
        );
      case 'page':
        return (
          <div className="pt-10 pb-4 border-b-4 border-primary-500 mb-4 bg-primary-50/30 dark:bg-primary-900/10 -mx-4 px-4">
            <h2 className="text-xl font-black text-primary-700 dark:text-primary-400 uppercase tracking-tighter flex items-center gap-3">
              <span className="bg-primary-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">P</span>
              {field.label || 'Neue Seite'}
            </h2>
            {field.help_text && <p className="text-sm text-slate-500 dark:text-dark-text-muted mt-2 font-medium">{field.help_text}</p>}
          </div>
        );
      case 'spinner':
        return (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-dark-text-body mb-1">
              {field.label || 'Zahlenfeld'} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 border border-slate-300 dark:border-dark-stroke rounded-lg bg-white dark:bg-dark-input text-slate-900 dark:text-white flex justify-between items-center">
                <span>0</span>
                <div className="flex gap-2">
                  <button className="w-6 h-6 rounded bg-slate-100 dark:bg-dark-highlight hover:bg-slate-200 dark:hover:bg-dark-stroke flex items-center justify-center font-bold transition-colors text-slate-700 dark:text-white">-</button>
                  <button className="w-6 h-6 rounded bg-slate-100 dark:bg-dark-highlight hover:bg-slate-200 dark:hover:bg-dark-stroke flex items-center justify-center font-bold transition-colors text-slate-700 dark:text-white">+</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Lade Vorlage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-dark-bg">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-stroke shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/templates')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                title="Zurück"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {id ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
                </h1>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-[1920px] mx-auto px-4 pt-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-73px)] relative">
        {/* Left Sidebar - Form Elements (Hidden on mobile, visible on desktop) */}
        {(!isMobile || showElementPalette) && (
          <>
            {/* Mobile Overlay */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
                onClick={() => setShowElementPalette(false)}
              />
            )}

            {/* Sidebar */}
            <div className={`${isMobile ? 'fixed' : 'static'} inset-y-0 left-0 w-80 bg-white border-r border-slate-200 flex flex-col z-[2001] ${isMobile ? 'shadow-2xl' : ''}`}>
              <div className={`p-4 border-b border-slate-200 ${isMobile ? 'pt-safe' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 truncate mr-2">Form Elements</h2>
                  <button
                    onClick={() => setShowElementPalette(false)}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
                  <button
                    onClick={() => setActiveCategory('basic')}
                    className={`flex-shrink-0 px-3 py-2 text-sm font-medium transition-colors ${activeCategory === 'basic'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    BASIC
                  </button>
                  <button
                    onClick={() => setActiveCategory('survey')}
                    className={`flex-shrink-0 px-3 py-2 text-sm font-medium transition-colors ${activeCategory === 'survey'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    SURVEY
                  </button>
                  <button
                    onClick={() => setActiveCategory('page')}
                    className={`flex-shrink-0 px-3 py-2 text-sm font-medium transition-colors ${activeCategory === 'page'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    PAGE
                  </button>
                  <button
                    onClick={() => setActiveCategory('advanced')}
                    className={`flex-shrink-0 px-3 py-2 text-sm font-medium transition-colors ${activeCategory === 'advanced'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    ADVANCED
                  </button>
                </div>
              </div>

              {/* Field Types List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {FIELD_CATEGORIES[activeCategory].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => addField(type.value)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${type.color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: type.color }} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content Area - Form Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Mobile Add Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowElementPalette(true)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Element hinzufügen</span>
              </button>
            </div>

            {/* Form Title */}
            <div className="mb-6">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-2xl lg:text-3xl font-bold text-slate-900 bg-transparent border-none outline-none w-full"
                placeholder="Form"
              />
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-lg shadow-lg p-4 lg:p-8 min-h-[400px]">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 lg:space-y-6">
                      {formData.fields.length === 0 ? (
                        <div className="text-center py-12 lg:py-16">
                          <button
                            onClick={() => setShowElementPalette(true)}
                            className="mb-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-all lg:hidden"
                          >
                            <Plus className="w-5 h-5" />
                            <span>Element hinzufügen</span>
                          </button>
                          <p className="text-slate-400 text-sm">
                            {!isMobile
                              ? 'Klicken Sie auf ein Element links, um es hinzuzufügen'
                              : 'Klicken Sie auf "Element hinzufügen", um zu beginnen'}
                          </p>
                        </div>
                      ) : (
                        formData.fields.map((field, index) => {
                          const isSelected = selectedFieldIndex === index;
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`relative group border-2 rounded-lg p-4 transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : snapshot.isDragging
                                      ? 'border-indigo-500 shadow-xl'
                                      : 'border-transparent hover:border-slate-300'
                                    }`}
                                  onClick={() => setSelectedFieldIndex(index)}
                                >
                                  {/* Field Controls */}
                                  <div className={`absolute -right-2 -top-2 flex gap-1 transition-opacity ${isSelected
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100'
                                    }`}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addField('text', index);
                                      }}
                                      className="p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                                      title="Feld darüber hinzufügen"
                                    >
                                      <ChevronUp className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateField(index);
                                      }}
                                      className="p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                                      title="Duplizieren"
                                    >
                                      <Copy className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSettings(!showSettings);
                                      }}
                                      className="p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                                      title="Einstellungen"
                                    >
                                      <Settings className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeField(index);
                                      }}
                                      className="p-1.5 bg-white border border-red-200 rounded shadow-sm hover:bg-red-50"
                                      title="Löschen"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addField('text', index + 1);
                                      }}
                                      className="p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50"
                                      title="Feld darunter hinzufügen"
                                    >
                                      <ChevronDown className="w-4 h-4 text-slate-600" />
                                    </button>
                                  </div>

                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 hover:bg-indigo-500 cursor-grab active:cursor-grabbing rounded-l transition-colors"
                                  />

                                  {/* Field Preview */}
                                  <div className="ml-4">
                                    {renderFieldPreview(field)}
                                  </div>

                                  {/* Field Editor (when selected) */}
                                  {isSelected && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 text-sm lg:text-base">
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                          Frage / Label
                                        </label>
                                        <input
                                          type="text"
                                          value={field.label}
                                          onChange={(e) => updateField(index, { label: e.target.value })}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="Frage eingeben"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                          Untertitel / Sublabel
                                        </label>
                                        <input
                                          type="text"
                                          value={field.sublabel || ''}
                                          onChange={(e) => updateField(index, { sublabel: e.target.value })}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="Untertitel eingeben"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      {(field.type === 'text' || field.type === 'number' || field.type === 'notes' || field.type === 'fullname' || field.type === 'email' || field.type === 'phone' || field.type === 'address' || field.type === 'longtext' || field.type === 'paragraph' || field.type === 'fillblank' || field.type === 'spinner') && (
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Platzhalter
                                          </label>
                                          <input
                                            type="text"
                                            value={field.placeholder || ''}
                                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Platzhaltertext eingeben"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                      )}
                                      {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
                                        <div>
                                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Optionen (kommagetrennt)
                                          </label>
                                          <input
                                            type="text"
                                            value={field.options?.join(', ') || ''}
                                            onChange={(e) => updateField(index, {
                                              options: e.target.value.split(',').map((o: string) => o.trim()).filter(Boolean)
                                            })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Option 1, Option 2, Option 3"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                      )}
                                      <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={field.required || false}
                                            onChange={(e) => updateField(index, { required: e.target.checked })}
                                            className="w-4 h-4"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <span className="text-xs font-medium text-slate-700">Pflichtfeld</span>
                                        </label>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                          Hilfetext
                                        </label>
                                        <input
                                          type="text"
                                          value={field.help_text || ''}
                                          onChange={(e) => updateField(index, { help_text: e.target.value })}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="Hilfetext für den Benutzer"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Add New Page Section */}
              <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-300 text-center">
                <button
                  onClick={() => addField('section')}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  NEUEN ABSCHNITT HINZUFÜGEN
                </button>
              </div>

              {/* Submit Button */}
              <div className="mt-12 flex justify-center pb-20">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {saving ? 'Speichert...' : 'Vorlage Speichern'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
