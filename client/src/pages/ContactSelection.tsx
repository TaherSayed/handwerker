import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';

interface Contact {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  address?: string;
}

export default function ContactSelection() {
  const navigate = useNavigate();
  const { importGoogleContacts } = useAuthStore();
  const [showGoogleContacts, setShowGoogleContacts] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectFromGoogle = async () => {
    setShowGoogleContacts(true);
    setLoading(true);
    
    try {
      // First, import Google contacts
      await importGoogleContacts();
      
      // Then fetch the imported contacts from database
      const data = await apiService.getContacts();
      setContacts(data || []);
      
      if (!data || data.length === 0) {
        alert('Keine Kontakte in Ihrem Google-Konto gefunden.\n\nBitte verwenden Sie "Kunde manuell eingeben".');
        setShowGoogleContacts(false);
      }
    } catch (error: any) {
      console.error('Failed to import Google contacts:', error);
      
      // Show user-friendly error message
      const errorMsg = error.response?.data?.error || error.message;
      if (errorMsg?.includes('provider_token')) {
        alert('Google-Berechtigung fehlt.\n\nBitte melden Sie sich erneut an und erteilen Sie die Berechtigung für Google Contacts.');
      } else {
        alert('Fehler beim Importieren der Google Kontakte.\n\nBitte verwenden Sie "Kunde manuell eingeben".');
      }
      setShowGoogleContacts(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    // Copy contact data into visit (not creating a contact entity)
    navigate('/form-template-selection', { state: { contact } });
  };

  const handleManualEntry = () => {
    navigate('/manual-customer-entry');
  };

  const filteredContacts = contacts.filter(contact =>
    contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Google Contacts Modal
  if (showGoogleContacts) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
        {/* Header */}
        <div className="bg-white border-b" style={{ borderColor: '#D1D1D6' }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setShowGoogleContacts(false)}
              className="text-base font-medium"
              style={{ color: '#007AFF' }}
            >
              ← Zurück
            </button>
            <h1 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>
              Google Kontakte
            </h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border focus:outline-none transition"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5EA',
                color: '#1D1D1F',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#007AFF' }}></div>
              <p className="mt-4 text-sm" style={{ color: '#86868B' }}>Lade Kontakte...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-base mb-2" style={{ color: '#1D1D1F' }}>
                {searchQuery ? 'Kein Kontakt gefunden' : 'Keine Kontakte'}
              </p>
              <p className="text-sm" style={{ color: '#86868B' }}>
                {searchQuery ? 'Versuche eine andere Suche' : 'Importiere zuerst deine Google Kontakte'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className="w-full bg-white rounded-2xl p-4 text-left hover:opacity-80 transition"
                  style={{ border: '1px solid #E5E5EA' }}
                >
                  <h3 className="font-semibold mb-1" style={{ color: '#1D1D1F', fontSize: '17px' }}>
                    {contact.full_name}
                  </h3>
                  {contact.company && (
                    <p className="text-sm mb-1" style={{ color: '#86868B' }}>{contact.company}</p>
                  )}
                  {contact.phone && (
                    <p className="text-sm" style={{ color: '#86868B' }}>{contact.phone}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Selection Screen
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F7' }}>
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
            Kunde auswählen
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-4">
          
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">👤</div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}>
              Neuer Besuch
            </h2>
            <p className="text-base" style={{ color: '#86868B' }}>
              Wähle einen Kunden aus
            </p>
          </div>

          {/* Primary Button - Google Contacts */}
          <button
            onClick={handleSelectFromGoogle}
            className="w-full bg-white rounded-3xl p-6 hover:shadow-xl transition-all"
            style={{ 
              border: '2px solid #007AFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#007AFF' }}>
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                    Kontakt aus Google auswählen
                  </div>
                  <div className="text-sm" style={{ color: '#86868B' }}>
                    Aus deinen gespeicherten Kontakten
                  </div>
                </div>
              </div>
              <svg className="w-6 h-6" style={{ color: '#007AFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E5EA' }}></div>
            <span className="text-sm font-medium" style={{ color: '#86868B' }}>ODER</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E5EA' }}></div>
          </div>

          {/* Secondary Button - Manual Entry */}
          <button
            onClick={handleManualEntry}
            className="w-full bg-white rounded-2xl p-5 hover:shadow-lg transition-all"
            style={{ border: '1px solid #E5E5EA' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F5F7' }}>
                  <svg className="w-5 h-5" style={{ color: '#007AFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-base font-semibold" style={{ color: '#1D1D1F' }}>
                    Kunde manuell eingeben
                  </div>
                  <div className="text-sm" style={{ color: '#86868B' }}>
                    Name und Details eingeben
                  </div>
                </div>
              </div>
              <svg className="w-5 h-5" style={{ color: '#C7C7CC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

        </div>

        {/* Footer with Legal Links */}
        <div className="mt-12 pt-6 border-t text-center" style={{ borderColor: '#E5E5EA' }}>
          <div className="flex justify-center gap-6 text-sm">
            <Link 
              to="/datenschutz" 
              className="hover:opacity-70 transition"
              style={{ color: '#86868B' }}
            >
              Datenschutz
            </Link>
            <Link 
              to="/impressum" 
              className="hover:opacity-70 transition"
              style={{ color: '#86868B' }}
            >
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
