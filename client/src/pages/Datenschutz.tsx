import { useNavigate } from 'react-router-dom';

export default function Datenschutz() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: '#D1D1D6' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-base font-medium"
            style={{ color: '#007AFF' }}
          >
            ← Zurück
          </button>
          <h1 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>
            Datenschutz
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-8" style={{ border: '1px solid #D1D1D6' }}>
          
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1D1D1F' }}>
            Datenschutzerklärung
          </h2>

          <div className="space-y-6" style={{ color: '#3C3C43', lineHeight: '1.6' }}>
            
            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                1. Verantwortliche Stelle
              </h3>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="mt-2">
                <strong>SATA GmbH</strong><br />
                Musterstraße 123<br />
                12345 Musterstadt<br />
                Deutschland
              </p>
              <p className="mt-2">
                E-Mail: datenschutz@sata26.cloud<br />
                Telefon: +49 (0) 123 456789
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                2. Erhobene Daten
              </h3>
              <p>
                OnSite erhebt und verarbeitet folgende personenbezogene Daten:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Google-Kontoinformationen (Name, E-Mail-Adresse)</li>
                <li>Google Kontakte (nur mit Ihrer Zustimmung)</li>
                <li>Von Ihnen erstellte Besuchsformulare und Kundendaten</li>
                <li>Nutzungsdaten (Datum und Uhrzeit der Zugriffe)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                3. Zweck der Datenverarbeitung
              </h3>
              <p>
                Ihre Daten werden ausschließlich für folgende Zwecke verwendet:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Bereitstellung und Verbesserung der App-Funktionen</li>
                <li>Authentifizierung und Benutzerverwaltung</li>
                <li>Import von Kundenkontakten aus Google Contacts</li>
                <li>Erstellung und Speicherung von Besuchsberichten</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                4. Rechtsgrundlage
              </h3>
              <p>
                Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
                <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
                <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                5. Google OAuth & Kontakte
              </h3>
              <p>
                OnSite nutzt Google OAuth zur Authentifizierung. Dabei werden Sie auf eine Google-Seite weitergeleitet, 
                wo Sie der App Zugriff gewähren können. Folgende Berechtigungen werden benötigt:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Basisinformationen:</strong> Name, E-Mail-Adresse, Profilbild</li>
                <li><strong>Google Contacts (lesend):</strong> Zum Import Ihrer Kundenkontakte</li>
              </ul>
              <p className="mt-2">
                Sie können diese Berechtigungen jederzeit in Ihren Google-Kontoeinstellungen widerrufen.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                6. Datenspeicherung
              </h3>
              <p>
                Ihre Daten werden gespeichert bei:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Supabase:</strong> Datenbank und Authentifizierung (EU-Server)</li>
                <li><strong>Coolify:</strong> Anwendungs-Hosting (Deutschland)</li>
              </ul>
              <p className="mt-2">
                Alle Daten werden verschlüsselt übertragen (HTTPS) und gespeichert.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                7. Weitergabe an Dritte
              </h3>
              <p>
                Ihre Daten werden nicht an Dritte weitergegeben, außer:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Es besteht eine gesetzliche Verpflichtung</li>
                <li>Die Weitergabe ist zur Vertragserfüllung erforderlich</li>
                <li>Sie haben ausdrücklich eingewilligt</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                8. Ihre Rechte
              </h3>
              <p>
                Sie haben folgende Rechte bezüglich Ihrer Daten:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Auskunft:</strong> Recht auf Auskunft über gespeicherte Daten</li>
                <li><strong>Berichtigung:</strong> Recht auf Korrektur falscher Daten</li>
                <li><strong>Löschung:</strong> Recht auf Löschung Ihrer Daten</li>
                <li><strong>Einschränkung:</strong> Recht auf Einschränkung der Verarbeitung</li>
                <li><strong>Datenübertragbarkeit:</strong> Recht auf Datenportabilität</li>
                <li><strong>Widerspruch:</strong> Recht auf Widerspruch gegen die Verarbeitung</li>
              </ul>
              <p className="mt-2">
                Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: datenschutz@sata26.cloud
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                9. Datenlöschung
              </h3>
              <p>
                Sie können Ihre Daten jederzeit löschen lassen:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Löschen Sie Ihren Account in den App-Einstellungen</li>
                <li>Kontaktieren Sie uns per E-Mail</li>
                <li>Widerrufen Sie die Google-Berechtigung in Ihren Google-Einstellungen</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                10. Cookies
              </h3>
              <p>
                OnSite verwendet ausschließlich technisch notwendige Cookies für:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Session-Management</li>
                <li>Authentifizierung</li>
              </ul>
              <p className="mt-2">
                Es werden keine Marketing- oder Tracking-Cookies verwendet.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                11. Änderungen der Datenschutzerklärung
              </h3>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen 
                oder Änderungen der App anzupassen. Die jeweils aktuelle Version finden Sie auf dieser Seite.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                12. Beschwerderecht
              </h3>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung 
                Ihrer personenbezogenen Daten durch uns zu beschweren.
              </p>
            </section>

            <div className="pt-6 mt-6 border-t" style={{ borderColor: '#E5E5EA' }}>
              <p className="text-sm" style={{ color: '#86868B' }}>
                Stand: Dezember 2025<br />
                Version: 1.0
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

