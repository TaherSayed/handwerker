import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import {
  ArrowLeft,
  Download,
  Trash2,
  Share2,
  Edit3,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Button from '../components/common/Button';
import { useNotificationStore } from '../store/notificationStore';

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotificationStore();

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSubmission(id!) as any;
      setSubmission(data);
    } catch (error: any) {
      console.error('Load submission error:', error);
      setError(error.message || 'Laden des Einsatzberichts fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);
      success('PDF Erstellung', 'Vorgang wird gestartet...');
      const result = await apiService.generatePDF(id!) as any;
      window.open(result.pdf_url, '_blank');
      loadSubmission();
    } catch (error: any) {
      console.error('Generate PDF error:', error);
      notifyError('Fehler', error.message || 'PDF konnte nicht erstellt werden');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPDF = async () => {
    try {
      const { url } = await apiService.getPDFDownloadUrl(id!) as any;
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Download PDF error:', error);
      notifyError('Fehler', 'PDF konnte nicht geöffnet werden. ' + (error.message || ''));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Einsatzbericht löschen möchten?')) return;
    try {
      await apiService.deleteSubmission(id!);
      success('Gelöscht', 'Der Einsatzbericht wurde entfernt');
      navigate('/submissions');
    } catch (error: any) {
      notifyError('Fehler', error.message || 'Löschen fehlgeschlagen');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Einsatzbericht - ${submission.customer_name}`,
      text: `Einsatzbericht für ${submission.customer_name} vom ${format(new Date(submission.created_at), 'dd.MM.yyyy')}`,
      url: submission.pdf_url || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        success('Link kopiert', 'Dokumenten-Link wurde in die Zwischenablage kopiert');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const getStatusDisplay = (sub: any) => {
    const isSynced = !sub.id.toString().startsWith('draft_') && !sub.is_offline;

    if (sub.status === 'draft') {
      return {
        label: 'Entwurf',
        color: 'text-amber-600 bg-amber-50',
        icon: Clock
      };
    }
    if (isSynced) {
      return {
        label: 'Synchronisiert',
        color: 'text-indigo-600 bg-indigo-50',
        icon: CheckCircle2
      };
    }
    return {
      label: 'Eingereicht',
      color: 'text-green-600 bg-green-50',
      icon: Zap
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Lade Vorgang...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">!</div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Fehler</h2>
        <p className="text-slate-500 mb-6 text-sm">{error || 'Bericht nicht gefunden'}</p>
        <Button onClick={() => navigate('/submissions')} variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Zurück
        </Button>
      </div>
    );
  }

  const renderFieldValue = (field: any, value: any) => {
    if (value === undefined || value === null || value === '') return <span className="text-slate-400">-</span>;

    switch (field.type) {
      case 'checkbox':
      case 'toggle':
        return (
          <div className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {value ? 'Ja' : 'Nein'}
          </div>
        );
      case 'date':
        return format(new Date(value), 'dd.MM.yyyy', { locale: de });
      case 'datetime':
        return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: de });
      case 'photo':
        return (
          <div className="mt-2">
            <img src={value} alt="Foto" className="h-32 w-auto rounded-lg border border-slate-200 shadow-sm object-cover bg-slate-50" />
          </div>
        );
      case 'signature':
        return (
          <div className="mt-2 p-2 bg-white border border-slate-200 rounded-lg inline-block">
            <img src={value} alt="Unterschrift" className="h-16 object-contain" />
          </div>
        );
      default:
        return <span className="text-slate-900 font-medium break-words">{value}</span>;
    }
  };

  const status = getStatusDisplay(submission);

  return (
    <div className="pb-32 max-w-2xl mx-auto space-y-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between py-2 -mx-2 px-2">
        <button
          onClick={() => navigate('/submissions')}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 active:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Einsatzdetails</h1>

        {/* Secondary Actions (Top Right) */}
        <div className="flex gap-1">
          {submission.status === 'draft' && (
            <button
              onClick={() => navigate(`/fill/${submission.template_id}?edit=${submission.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Bearbeiten"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-blue-600 active:bg-slate-100 rounded-lg transition-colors"
            title="Teilen"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meta Status Card */}
      <div className="card flex items-center justify-between p-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status.color}`}>
            <status.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
            <p className="text-sm font-bold text-slate-900">{status.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</p>
          <p className="text-sm font-mono text-slate-600 font-medium">#{submission.id.slice(0, 6)}</p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-50">
          <User className="w-4 h-4 text-slate-400" />
          Kunde
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-0.5">Name</label>
            <p className="text-base font-bold text-slate-900">{submission.customer_name || 'Kein Name'}</p>
          </div>

          {(submission.customer_email || submission.customer_phone) && (
            <div className="grid grid-cols-2 gap-4">
              {submission.customer_email && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-0.5">Email</label>
                  <a href={`mailto:${submission.customer_email}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">
                    {submission.customer_email}
                  </a>
                </div>
              )}
              {submission.customer_phone && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-0.5">Telefon</label>
                  <a href={`tel:${submission.customer_phone}`} className="text-sm font-medium text-slate-700 hover:text-blue-600 block">
                    {submission.customer_phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {submission.customer_address && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-0.5">Adresse</label>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-slate-700 leading-snug">{submission.customer_address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Data */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Protokoll</h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
            {submission.form_templates?.name}
          </span>
        </div>

        <div className="flex flex-col gap-5 divide-y divide-slate-50">
          {submission.form_templates?.fields?.map((field: any) => (
            <div key={field.id} className="pt-4 first:pt-0">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                {field.label}
              </label>
              <div className="text-sm">
                {renderFieldValue(field, submission.field_values[field.id])}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamp Footer */}
      <div className="px-4 py-2 text-center text-xs text-slate-400 font-medium">
        Erstellt: {format(new Date(submission.created_at), 'dd.MM.yyyy HH:mm')} Uhr
      </div>

      {/* Safe Bottom Action Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-white border-t border-slate-200 lg:static lg:bg-transparent lg:border-0 lg:p-0 z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          {submission.status === 'draft' ? (
            <>
              <Button
                onClick={handleDelete}
                variant="ghost"
                className="text-red-500 hover:bg-red-50 hover:text-red-700 shrink-0"
                icon={<Trash2 className="w-5 h-5" />}
              >
              </Button>
              <Button
                onClick={handleGeneratePDF}
                loading={generating}
                variant="primary"
                className="flex-1 w-full justify-center shadow-lg shadow-blue-500/20"
                size="lg"
                icon={<Zap className="w-5 h-5" />}
              >
                Abschließen & PDF
              </Button>
            </>
          ) : (
            <Button
              onClick={submission.pdf_url ? handleViewPDF : handleGeneratePDF}
              loading={generating}
              variant="primary"
              className="w-full justify-center shadow-lg shadow-blue-500/20"
              size="lg"
              icon={<Download className="w-5 h-5" />}
            >
              {submission.pdf_url ? 'PDF Anzeigen' : 'PDF Generieren'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

