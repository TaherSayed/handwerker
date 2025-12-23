import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';

interface Contact {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
}

export default function ContactSelection() {
  const navigate = useNavigate();
  const { user, importGoogleContacts, importingContacts } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/google-sign-in');
      return;
    }
    loadContacts();
  }, [user, navigate, searchQuery]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getContacts(searchQuery);
      setContacts(data || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportGoogleContacts = async () => {
    try {
      await importGoogleContacts();
      loadContacts(); // Refresh contacts after import
    } catch (error) {
      alert('Fehler beim Importieren der Kontakte');
    }
  };

  const handleSelectContact = (contact: Contact) => {
    navigate('/form-template-selection', { state: { contact } });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold" style={{ color: '#0F172A', fontWeight: 600 }}>Kontakt auswählen</h1>
          <button
            onClick={handleImportGoogleContacts}
            disabled={importingContacts}
            className="btn-primary"
            style={{ opacity: importingContacts ? 0.6 : 1 }}
          >
            {importingContacts ? 'Importiere...' : 'Google Kontakte importieren'}
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Kontakte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-4 rounded-lg border focus:outline-none focus:ring-2 transition"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              borderWidth: '1px',
              fontSize: '14px',
              color: '#0F172A',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563EB';
              e.target.style.borderWidth = '2px';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E2E8F0';
              e.target.style.borderWidth = '1px';
            }}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563EB' }}></div>
            <p className="mt-4 text-sm" style={{ color: '#475569' }}>Laden...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#475569' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            <p className="text-base" style={{ color: '#475569' }}>Keine Kontakte gefunden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className="card p-4 cursor-pointer hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold mb-1" style={{ color: '#0F172A', fontSize: '16px' }}>{contact.full_name}</h3>
                {contact.email && (
                  <p className="text-sm mb-1" style={{ color: '#475569' }}>{contact.email}</p>
                )}
                {contact.phone && (
                  <p className="text-sm" style={{ color: '#475569' }}>{contact.phone}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

