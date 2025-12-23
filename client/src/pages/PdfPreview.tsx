import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';

export default function PdfPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { visit, contact, template } = location.state || {};
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!visit || !contact || !template) {
      navigate('/dashboard');
      return;
    }

    // Auto-generate PDF when page loads
    generatePDF();
  }, [visit, contact, template, navigate]);

  const generatePDF = async () => {
    if (!visit?.id) {
      setError('Besuch-ID fehlt');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      
      const result = await apiService.generatePDF(visit.id);
      setPdfUrl(result.pdfUrl);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setError(err.response?.data?.error || 'Fehler beim Generieren des PDFs');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (!visit || !contact || !template) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #E5E5EA' }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold" style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}>
              PDF Vorschau
            </h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium hover:opacity-70 transition"
              style={{ color: '#007AFF' }}
            >
              ← Zurück
            </button>
          </div>

          {/* Status */}
          {generating && (
            <div className="flex items-center gap-3 py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#007AFF' }}></div>
              <p className="text-sm" style={{ color: '#86868B' }}>PDF wird generiert...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={generatePDF}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Erneut versuchen
              </button>
            </div>
          )}

          {pdfUrl && !generating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#F5F5F7' }}>
                <svg className="w-5 h-5" style={{ color: '#34C759' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium" style={{ color: '#1D1D1F' }}>PDF erfolgreich erstellt</p>
              </div>

              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-xl font-medium text-white hover:opacity-90 transition"
                style={{ backgroundColor: '#007AFF' }}
              >
                PDF öffnen / herunterladen
              </button>
            </div>
          )}
        </div>

        {/* Visit Details Preview */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E5E5EA' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}>
            Besuchsbericht
          </h2>
          
          {/* Customer Info */}
          <div className="mb-6 pb-6 border-b" style={{ borderColor: '#E5E5EA' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#86868B' }}>KUNDE</h3>
            <p className="text-base font-medium mb-1" style={{ color: '#1D1D1F' }}>{contact.full_name}</p>
            {contact.email && <p className="text-sm" style={{ color: '#86868B' }}>{contact.email}</p>}
            {contact.phone && <p className="text-sm" style={{ color: '#86868B' }}>{contact.phone}</p>}
            {contact.address && <p className="text-sm" style={{ color: '#86868B' }}>{contact.address}</p>}
          </div>

          {/* Form Data */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#86868B' }}>FORMULAR DATEN</h3>
            <div className="space-y-4">
              {template.fields?.map((field: any) => {
                const value = visit.form_data?.[field.id] || '-';
                return (
                  <div key={field.id}>
                    <h4 className="text-sm font-medium mb-1" style={{ color: '#86868B' }}>{field.label}</h4>
                    <p className="text-base" style={{ color: '#1D1D1F' }}>{String(value)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: '#E5E5EA' }}>
            <p className="text-xs" style={{ color: '#86868B' }}>
              Erstellt am {new Date(visit.created_at || Date.now()).toLocaleString('de-DE')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
