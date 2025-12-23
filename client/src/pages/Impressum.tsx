import { useNavigate } from 'react-router-dom';

export default function Impressum() {
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
            Impressum
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-8" style={{ border: '1px solid #D1D1D6' }}>
          
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1D1D1F' }}>
            Impressum
          </h2>

          <div className="space-y-6" style={{ color: '#3C3C43', lineHeight: '1.6' }}>
            
            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Angaben gemäß § 5 TMG
              </h3>
              <p>
                <strong>SATA GmbH</strong><br />
                Musterstraße 123<br />
                12345 Musterstadt<br />
                Deutschland
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Kontakt
              </h3>
              <p>
                Telefon: +49 (0) 123 456789<br />
                E-Mail: info@sata26.cloud<br />
                Website: https://hw.sata26.cloud
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Handelsregister
              </h3>
              <p>
                Registergericht: Amtsgericht Musterstadt<br />
                Registernummer: HRB 12345
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Umsatzsteuer-ID
              </h3>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                DE123456789
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Geschäftsführer
              </h3>
              <p>
                Max Mustermann
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h3>
              <p>
                Max Mustermann<br />
                Musterstraße 123<br />
                12345 Musterstadt
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                EU-Streitschlichtung
              </h3>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              </p>
              <p className="mt-2">
                <a 
                  href="https://ec.europa.eu/consumers/odr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#007AFF' }}
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="mt-2">
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Verbraucherstreitbeilegung / Universalschlichtungsstelle
              </h3>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Haftung für Inhalte
              </h3>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
                verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
                zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="mt-2">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen 
                Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt 
                der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden 
                Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Haftung für Links
              </h3>
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
                Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
                verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
              <p className="mt-2">
                Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. 
                Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente 
                inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer 
                Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige 
                Links umgehend entfernen.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>
                Urheberrecht
              </h3>
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem 
                deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
                außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen 
                Autors bzw. Erstellers.
              </p>
              <p className="mt-2">
                Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. 
                Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte 
                Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem 
                auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. 
                Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>
            </section>

            <div className="pt-6 mt-6 border-t" style={{ borderColor: '#E5E5EA' }}>
              <p className="text-sm" style={{ color: '#86868B' }}>
                Quelle: <a href="https://www.e-recht24.de" target="_blank" rel="noopener noreferrer" style={{ color: '#007AFF' }}>e-recht24.de</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

