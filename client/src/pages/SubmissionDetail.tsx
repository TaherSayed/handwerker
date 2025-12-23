import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const result = await apiService.generatePDF(id!) as any;
      window.open(result.pdf_url, '_blank');
      loadSubmission();
    } catch (error: any) {
      console.error('Generate PDF error:', error);
      setError(error.message || 'PDF konnte nicht erstellt werden');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Einsatzbericht löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    try {
      setError(null);
      await apiService.deleteSubmission(id!);
      navigate('/submissions');
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error.message || 'Löschen des Berichts fehlgeschlagen');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">{error}</p>
          </div>
          <button onClick={() => navigate('/submissions')} className="btn-primary">
            <ArrowLeft className="w-5 h-5" />
            Zurück zum Verlauf
          </button>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  const renderFieldValue = (field: any, value: any) => {
    switch (field.type) {
      case 'checkbox':
      case 'toggle':
        return value ? 'Ja' : 'Nein';
      case 'date':
        return value ? format(new Date(value), 'do MMMM yyyy', { locale: de }) : '-';
      case 'datetime':
        return value ? format(new Date(value), 'do MMMM yyyy HH:mm', { locale: de }) + ' Uhr' : '-';
      case 'photo':
        return value ? (
          <img src={value} alt="Foto" className="w-32 h-32 object-cover rounded" />
        ) : (
          'Kein Foto'
        );
      case 'signature':
        return value ? (
          <img src={value} alt="Unterschrift" className="w-48 h-24 object-contain border rounded" />
        ) : (
          'Keine Unterschrift'
        );
      default:
        return value || '-';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/submissions')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Einsatz-Details</h1>
            <p className="text-gray-600 text-lg">{submission.form_templates?.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {submission.pdf_url ? (
            <a
              href={submission.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <Download className="w-5 h-5" />
              PDF Herunterladen
            </a>
          ) : (
            <button
              onClick={handleGeneratePDF}
              className="btn-primary"
            >
              <Download className="w-5 h-5" />
              PDF Erstellen
            </button>
          )}
          {submission.status === 'draft' && (
            <button
              onClick={handleDelete}
              className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5" />
              Löschen
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`badge ${submission.status === 'submitted'
            ? 'bg-green-100 text-green-700'
            : submission.status === 'draft'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
          {submission.status === 'submitted' ? 'Eingereicht' : 'Entwurf'}
        </span>
      </div>

      {/* Customer Information */}
      {submission.customer_name && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kunden-Informationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <p className="text-base text-gray-900">{submission.customer_name}</p>
            </div>
            {submission.customer_email && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-Mail</label>
                <p className="text-base text-gray-900">{submission.customer_email}</p>
              </div>
            )}
            {submission.customer_phone && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefonnummer</label>
                <p className="text-base text-gray-900">{submission.customer_phone}</p>
              </div>
            )}
            {submission.customer_address && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Einsatzort / Adresse</label>
                <p className="text-base text-gray-900">{submission.customer_address}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Data */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Antworten / Details</h2>
        <div className="space-y-6">
          {submission.form_templates?.fields?.map((field: any) => (
            <div key={field.id} className="border-b border-gray-100 pb-6 last:border-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="text-base text-gray-900 mt-1">
                {renderFieldValue(field, submission.field_values[field.id])}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature */}
      {submission.signature_url && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Unterschrift</h2>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <img
              src={submission.signature_url}
              alt="Unterschrift"
              className="max-w-md h-auto"
            />
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Erstellt am</label>
            <p className="text-base text-gray-900">{format(new Date(submission.created_at), 'Pp', { locale: de })}</p>
          </div>
          {submission.submitted_at && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Eingereicht am</label>
              <p className="text-base text-gray-900">{format(new Date(submission.submitted_at), 'Pp', { locale: de })}</p>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Einsatz-ID</label>
            <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg inline-block">{submission.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

