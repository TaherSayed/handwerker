import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { generatePDF } from '../utils/pdfGenerator';
import Skeleton from '../components/common/Skeleton';

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
  Zap,
  RefreshCw,
  WifiOff
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
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch submission first to allow offline fallback
      const submissionData = await apiService.getSubmission(id!) as any;

      // Check if it's cached/offline data
      const isOfflineData = submissionData._is_cached || submissionData.is_offline || false;
      setIsCached(isOfflineData);
      setSubmission(submissionData);

      // Try to fetch company profile for PDF (soft fail if offline)
      try {
        const profileData = await apiService.getMe() as any;
        setCompanySettings(profileData.company_info || {});
      } catch (err) {
        console.warn('[SubmissionDetail] Could not fetch company settings (likely offline)');
        // Keep existing or empty settings
      }

    } catch (error: any) {
      console.error('Load data error:', error);
      setError(error.message || 'Laden des Einsatzberichts fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!submission) return;

    try {
      setGenerating(true);
      success('PDF Export', 'Bericht wird erstellt...');

      // Ensure we have at least partial company settings if offline
      const settingsToUse = companySettings || { name: 'Offline User' };

      await generatePDF(submission, settingsToUse);

      success('Erfolgreich', 'PDF wurde heruntergeladen');
    } catch (error: any) {
      console.error('Generate PDF error:', error);
      notifyError('Fehler', error.message || 'PDF konnte nicht erstellt werden');
    } finally {
      setGenerating(false);
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
      title: `Einsatzbericht - ${submission?.customer_name || 'Bericht'}`,
      text: `Einsatzbericht für ${submission?.customer_name} vom ${submission?.created_at ? format(new Date(submission.created_at), 'dd.MM.yyyy') : ''}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        success('Link kopiert', 'Link zum Bericht wurde in die Zwischenablage kopiert');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const getStatusDisplay = (sub: any) => {
    if (!sub) return { label: '-', color: 'bg-slate-100', icon: Clock };

    const isSynced = !sub.id.toString().startsWith('draft_') && !sub.is_offline;

    // Explicit offline/cached check
    if (isCached || !isSynced) {
      return {
        label: 'Offline / Nicht synchronisiert',
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
        icon: WifiOff
      };
    }

    if (sub.status === 'draft') {
      return {
        label: 'Entwurf',
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
        icon: Clock
      };
    }

    return {
      label: 'Abgeschlossen',
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
      icon: CheckCircle2
    };
  };

  const renderFieldValue = (field: any, value: any) => {
    if (value === undefined || value === null || value === '') return <span className="text-slate-400 dark:text-slate-500">—</span>;

    switch (field.type) {
      case 'checkbox':
      case 'toggle':
        return (
          <div className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${value ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            {value ? 'Ja' : 'Nein'}
          </div>
        );
      case 'date':
        try { return format(new Date(value), 'dd.MM.yyyy', { locale: de }); } catch { return value; }
      case 'datetime':
        try { return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: de }); } catch { return value; }
      case 'photo':
        return (
          <div className="mt-2">
            <img src={value} alt="Foto" className="h-32 w-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm object-cover bg-slate-50 dark:bg-slate-800" />
          </div>
        );
      case 'signature':
        return (
          <div className="mt-2 p-2 bg-white dark:bg-white rounded-lg inline-block border border-slate-200 dark:border-slate-700">
            <img src={value} alt="Unterschrift" className="h-16 object-contain" />
          </div>
        );
      default:
        return <span className="text-slate-900 dark:text-slate-100 font-medium break-words">{value}</span>;
    }
  };

  if (loading) {
    return (
      <div className="pb-32 max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between py-2 -mx-2 px-2">
          <Skeleton variant="circular" width="40px" height="40px" />
          <Skeleton variant="text" width="150px" height="24px" />
          <div className="flex gap-1">
            <Skeleton variant="circular" width="40px" height="40px" />
            <Skeleton variant="circular" width="40px" height="40px" />
          </div>
        </div>

        <div className="card p-4 py-3 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-stroke">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="rectangular" width="32px" height="32px" className="rounded-lg" />
              <div>
                <Skeleton variant="text" width="40px" height="10px" className="mb-1" />
                <Skeleton variant="text" width="80px" height="16px" />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-stroke">
          <Skeleton variant="text" width="100%" height="100px" />
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <WifiOff className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Daten konnten nicht geladen werden</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
          {error || 'Einsatzbericht konnte nicht abgerufen werden. Bitte überprüfen Sie Ihre Verbindung.'}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={loadData} variant="primary" size="lg" className="w-full justify-center" icon={<RefreshCw className="w-5 h-5" />}>
            Erneut versuchen
          </Button>
          <Button onClick={() => navigate('/submissions')} variant="ghost" size="lg" className="w-full justify-center">
            Zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  const status = getStatusDisplay(submission);

  return (
    <div className="pb-32 max-w-2xl mx-auto space-y-4 animate-in slide-in-from-bottom-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between py-2 -mx-2 px-2">
        <button
          onClick={() => navigate('/submissions')}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Einsatzdetails</h1>

        {/* Secondary Actions (Top Right) */}
        <div className="flex gap-1">
          {submission.status === 'draft' && (
            <button
              onClick={() => navigate(`/fill/${submission.template_id}?edit=${submission.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Bearbeiten"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors"
            title="Teilen"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meta Status Card */}
      <div className="card flex items-center justify-between p-4 py-3 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-stroke">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status.color}`}>
            <status.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{status.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ID</p>
          <p className="text-sm font-mono text-slate-600 dark:text-slate-300 font-medium">#{submission.id.slice(0, 6)}</p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="card p-5 space-y-4 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-stroke">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 
        border-b border-slate-50 dark:border-dark-stroke">
          <User className="w-4 h-4 text-slate-400" />
          Kunde
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-0.5">Name</label>
            <p className="text-base font-bold text-slate-900 dark:text-white">{submission.customer_name || '— Nicht verfügbar —'}</p>
          </div>

          {(submission.customer_email || submission.customer_phone) && (
            <div className="grid grid-cols-2 gap-4">
              {submission.customer_email && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-0.5">Email</label>
                  <a href={`mailto:${submission.customer_email}`} className="text-sm font-medium text-blue-600 hover:underline truncate block dark:text-blue-400">
                    {submission.customer_email}
                  </a>
                </div>
              )}
              {submission.customer_phone && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-0.5">Telefon</label>
                  <a href={`tel:${submission.customer_phone}`} className="text-sm font-medium text-slate-700 hover:text-blue-600 block dark:text-slate-300 dark:hover:text-blue-400">
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
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">{submission.customer_address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Data */}
      <div className="card p-5 space-y-4 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-stroke">
        <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-dark-stroke">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Protokoll</h2>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
            {submission.form_templates?.name || 'Formular'}
          </span>
        </div>

        <div className="flex flex-col gap-5 divide-y divide-slate-50 dark:divide-slate-800">
          {submission.form_templates?.fields ? (
            submission.form_templates.fields.map((field: any) => (
              <div key={field.id} className="pt-4 first:pt-0">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
                  {field.label}
                </label>
                <div className="text-sm text-slate-900 dark:text-slate-100">
                  {renderFieldValue(field, submission.field_values?.[field.id])}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center">
              <p className="text-slate-400 italic text-sm">Formulardefinition nicht verfügbar.</p>
              {/* Fallback to raw values dump if template is missing but values exist */}
              {Object.keys(submission.field_values || {}).length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-xs font-bold mb-2 uppercase text-slate-500">Rohdaten:</p>
                  <pre className="text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded overflow-auto">
                    {JSON.stringify(submission.field_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timestamp Footer */}
      <div className="px-4 py-2 text-center text-xs text-slate-400 font-medium">
        Erstellt: {submission.created_at ? format(new Date(submission.created_at), 'dd.MM.yyyy HH:mm') + ' Uhr' : '-'}
      </div>

      {/* Safe Bottom Action Area - Mobile Optimized */}
      <div className="sticky-action-bar grid grid-cols-1 lg:grid-cols-2 gap-3 lg:static lg:bg-transparent lg:border-0 lg:p-0">
        {submission.status === 'draft' ? (
          <div className="flex gap-3 w-full">
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="w-14 justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 shrink-0"
              icon={<Trash2 className="w-5 h-5" />}
            >
            </Button>
            <Button
              onClick={handleDownloadPDF}
              loading={generating}
              variant="primary"
              className="flex-1 justify-center shadow-lg shadow-blue-500/20 text-base font-bold h-14"
              size="lg"
              icon={<Zap className="w-5 h-5" />}
            >
              Abschließen & Export
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="w-14 justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
              icon={<Trash2 className="w-5 h-5" />}
            />
            <Button
              onClick={handleDownloadPDF}
              loading={generating}
              variant="primary"
              className="flex-1 justify-center shadow-lg shadow-blue-500/20 text-base font-bold h-14"
              size="lg"
              icon={<Download className="w-5 h-5" />}
            >
              PDF Herunterladen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

