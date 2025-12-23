import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import {
  ArrowLeft,
  Download,
  Trash2,
  Share2,
  Edit3,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Zap,
  RefreshCw,
  ClipboardList
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
        color: 'bg-amber-100 text-amber-700',
        icon: Clock,
        iconBg: 'bg-amber-50 text-amber-600'
      };
    }

    if (isSynced) {
      return {
        label: 'Synchronisiert',
        color: 'bg-indigo-100 text-indigo-700',
        icon: CheckCircle2,
        iconBg: 'bg-indigo-50 text-indigo-600'
      };
    }

    return {
      label: 'Eingereicht',
      color: 'bg-green-100 text-green-700',
      icon: Zap,
      iconBg: 'bg-green-50 text-green-600'
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Daten werden geladen...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-[3rem] p-16 border border-slate-100 shadow-2xl">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 font-black text-2xl">!</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase">Fehler</h2>
          <p className="text-slate-500 mb-10 font-medium">{error || 'Bericht nicht gefunden'}</p>
          <Button onClick={() => navigate('/submissions')} variant="secondary" icon={<ArrowLeft className="w-5 h-5" />}>
            Zurück zum Verlauf
          </Button>
        </div>
      </div>
    );
  }

  const renderFieldValue = (field: any, value: any) => {
    if (value === undefined || value === null || value === '') return '-';

    switch (field.type) {
      case 'checkbox':
      case 'toggle':
        return (
          <div className={`px-4 py-2 rounded-xl font-bold text-sm w-fit ${value ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
            {value ? 'Aktiviert' : 'Deaktiviert'}
          </div>
        );
      case 'date':
        return format(new Date(value), 'do MMMM yyyy', { locale: de });
      case 'datetime':
        return format(new Date(value), 'do MMMM yyyy HH:mm', { locale: de }) + ' Uhr';
      case 'photo':
        return (
          <div className="relative group/photo w-full max-w-md">
            <img src={value} alt="Dokumentation" className="rounded-3xl border border-slate-200 shadow-lg group-hover/photo:scale-[1.02] transition-transform duration-500" />
          </div>
        );
      case 'signature':
        return (
          <div className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200 inline-block">
            <img src={value} alt="Unterschrift" className="max-h-32 object-contain" />
          </div>
        );
      default:
        return <span className="text-slate-900 font-medium break-words leading-relaxed">{value}</span>;
    }
  };

  const status = getStatusDisplay(submission);

  return (
    <div className="animate-slide-up space-y-8 pb-32">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/submissions')}
            className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${status.color}`}>
                {status.label}
              </span>
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {submission.id.slice(0, 8)}...
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Einsatz-Details
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleShare}
            variant="secondary"
            className="rounded-2xl py-4"
            icon={<Share2 className="w-5 h-5 text-indigo-600" />}
          >
            Teilen
          </Button>

          {submission.status === 'draft' && (
            <Button
              onClick={() => navigate(`/fill/${submission.template_id}?edit=${submission.id}`)}
              variant="secondary"
              className="rounded-2xl py-4 border-indigo-200 bg-indigo-50/50"
              icon={<Edit3 className="w-5 h-5 text-indigo-600" />}
            >
              Bearbeiten
            </Button>
          )}

          {submission.pdf_url ? (
            <Button
              onClick={() => window.open(submission.pdf_url, '_blank')}
              className="rounded-2xl py-4 shadow-indigo-500/20"
              icon={<Download className="w-5 h-5" />}
            >
              PDF Öffnen
            </Button>
          ) : (
            <Button
              onClick={handleGeneratePDF}
              loading={generating}
              className="rounded-2xl py-4 shadow-indigo-500/20"
              icon={<RefreshCw className="w-5 h-5" />}
            >
              Finalisieren
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Card */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Kundeninformationen</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kunde</label>
                <p className="text-xl font-black text-slate-900 uppercase">{submission.customer_name || 'Kein Name'}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vorlagentyp</label>
                <p className="text-xl font-black text-indigo-900 bg-indigo-50 w-fit px-3 py-1 rounded-xl uppercase">
                  {submission.form_templates?.name}
                </p>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-slate-700">{submission.customer_email || 'Nicht hinterlegt'}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-slate-700">{submission.customer_phone || 'Nicht hinterlegt'}</span>
                </div>
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                  <span className="font-bold text-slate-700 break-words flex-1">
                    {submission.customer_address || 'Keine Adresse hinterlegt'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Response Details */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Einsatzprotokoll</h2>
            </div>

            <div className="space-y-10">
              {submission.form_templates?.fields?.map((field: any) => (
                <div key={field.id} className="group/field">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 group-hover/field:text-indigo-600 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/field:bg-indigo-600" />
                    {field.label}
                  </label>
                  <div className="pl-4 border-l-2 border-slate-100 group-hover/field:border-indigo-200 transition-all">
                    {renderFieldValue(field, submission.field_values[field.id])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Meta & Actions */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
            <h3 className="text-lg font-black uppercase tracking-widest mb-8 text-indigo-400">Zeitstempel</h3>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Erstellt am</p>
                  <p className="font-bold">{format(new Date(submission.created_at), 'Pp', { locale: de })}</p>
                </div>
              </div>

              {submission.submitted_at && (
                <div className="flex items-start gap-4 text-green-400">
                  <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-400/40 mb-1">Eingereicht am</p>
                    <p className="font-bold text-white">{format(new Date(submission.submitted_at), 'Pp', { locale: de })}</p>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Einsatz-ID</p>
                <code className="bg-white/5 px-4 py-3 rounded-xl block text-xs font-mono break-all border border-white/5 text-indigo-300">
                  {submission.id}
                </code>
              </div>
            </div>
          </div>

          {submission.status === 'draft' && (
            <div className="bg-red-50 rounded-[2.5rem] p-8 border border-red-100">
              <h3 className="text-lg font-black uppercase tracking-widest mb-4 text-red-600">Gefahrenzone</h3>
              <p className="text-red-700/70 text-sm font-medium mb-6 leading-relaxed">
                Der Entwurf ist noch nicht synchronisiert. Das Löschen entfernt alle lokalen Daten.
              </p>
              <Button
                onClick={handleDelete}
                variant="danger"
                className="w-full py-4 rounded-2xl shadow-red-200 shadow-xl"
                icon={<Trash2 className="w-5 h-5" />}
              >
                Einsatz Löschen
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

