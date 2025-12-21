import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

export default function PdfPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { visit, contact, template } = location.state || {};
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visit || !contact || !template) {
      navigate('/dashboard');
    }
  }, [visit, contact, template, navigate]);

  const generatePDF = () => {
    if (!pdfRef.current) return;

    const pdf = new jsPDF();

    // Simple PDF generation - you might want to use html2canvas for better rendering
    pdf.text('OnSite - Besuchsbericht', 20, 20);
    pdf.text(`Kunde: ${contact.full_name}`, 20, 30);
    pdf.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 20, 40);

    let yPos = 50;
    template.fields?.forEach((field: any) => {
      const value = visit.form_data?.[field.id] || '';
      pdf.text(`${field.label}: ${value}`, 20, yPos);
      yPos += 10;
    });

    pdf.save(`besuch-${contact.full_name}-${Date.now()}.pdf`);
  };

  const handleShare = () => {
    generatePDF();
    alert('PDF wurde generiert. Teilen-Funktion wird implementiert.');
  };

  if (!visit || !contact || !template) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">PDF Vorschau</h1>
          <div className="flex gap-2">
            <button
              onClick={generatePDF}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              PDF herunterladen
            </button>
            <button
              onClick={handleShare}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Teilen
            </button>
          </div>
        </div>

        <div ref={pdfRef} className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">OnSite - Besuchsbericht</h2>
          <div className="mb-6">
            <p className="text-gray-600">Kunde: <span className="font-semibold">{contact.full_name}</span></p>
            {contact.email && <p className="text-gray-600">Email: {contact.email}</p>}
            {contact.phone && <p className="text-gray-600">Telefon: {contact.phone}</p>}
            <p className="text-gray-600">Datum: {new Date().toLocaleDateString('de-DE')}</p>
          </div>

          <div className="border-t pt-6 space-y-4">
            {template.fields?.map((field: any) => {
              const value = visit.form_data?.[field.id] || '';
              return (
                <div key={field.id}>
                  <h3 className="font-semibold text-gray-900">{field.label}</h3>
                  <p className="text-gray-700">{String(value)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

