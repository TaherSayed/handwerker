import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSubmission(id!);
      setSubmission(data);
    } catch (error) {
      console.error('Load submission error:', error);
      alert('Failed to load submission');
      navigate('/submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const result = await apiService.generatePDF(id!);
      alert('PDF generated successfully!');
      window.open(result.pdf_url, '_blank');
      loadSubmission();
    } catch (error) {
      console.error('Generate PDF error:', error);
      alert('Failed to generate PDF');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    try {
      await apiService.deleteSubmission(id!);
      navigate('/submissions');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete submission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!submission) return null;

  const renderFieldValue = (field: any, value: any) => {
    switch (field.type) {
      case 'checkbox':
      case 'toggle':
        return value ? 'Yes' : 'No';
      case 'date':
        return value ? format(new Date(value), 'MMM d, yyyy') : 'N/A';
      case 'datetime':
        return value ? format(new Date(value), 'MMM d, yyyy h:mm a') : 'N/A';
      case 'photo':
        return value ? (
          <img src={value} alt="Photo" className="w-32 h-32 object-cover rounded" />
        ) : (
          'No photo'
        );
      case 'signature':
        return value ? (
          <img src={value} alt="Signature" className="w-48 h-24 object-contain border rounded" />
        ) : (
          'No signature'
        );
      default:
        return value || 'N/A';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/submissions')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submission Details</h1>
            <p className="text-gray-600 mt-1">{submission.form_templates?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {submission.pdf_url ? (
            <a
              href={submission.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </a>
          ) : (
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
              Generate PDF
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
            submission.status === 'submitted'
              ? 'bg-green-100 text-green-800'
              : submission.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {submission.status}
        </span>
      </div>

      {/* Customer Information */}
      {submission.customer_name && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{submission.customer_name}</p>
            </div>
            {submission.customer_email && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{submission.customer_email}</p>
              </div>
            )}
            {submission.customer_phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{submission.customer_phone}</p>
              </div>
            )}
            {submission.customer_address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{submission.customer_address}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Data */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Data</h2>
        <div className="space-y-4">
          {submission.form_templates?.fields?.map((field: any) => (
            <div key={field.id} className="border-b border-gray-200 pb-4 last:border-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <div className="text-sm text-gray-900">
                {renderFieldValue(field, submission.field_values[field.id])}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature */}
      {submission.signature_url && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Signature</h2>
          <img
            src={submission.signature_url}
            alt="Signature"
            className="border rounded p-4 bg-gray-50"
          />
        </div>
      )}

      {/* Photos */}
      {submission.submission_photos && submission.submission_photos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {submission.submission_photos.map((photo: any) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.photo_url}
                  alt={photo.field_name}
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-xs text-gray-600 mt-1">{photo.field_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-gray-700 font-medium">Created</label>
            <p className="text-gray-900">{format(new Date(submission.created_at), 'PPpp')}</p>
          </div>
          {submission.submitted_at && (
            <div>
              <label className="block text-gray-700 font-medium">Submitted</label>
              <p className="text-gray-900">{format(new Date(submission.submitted_at), 'PPpp')}</p>
            </div>
          )}
          <div>
            <label className="block text-gray-700 font-medium">Submission ID</label>
            <p className="text-gray-900 font-mono text-xs">{submission.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

