import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

interface Statistics {
  recentVisits: number;
  pendingReports: number;
  syncStatus: string;
}

interface GoogleContact {
  resourceName: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  avatar_url: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();
  const [statistics, setStatistics] = useState<Statistics>({
    recentVisits: 0,
    pendingReports: 0,
    syncStatus: 'Loading...',
  });
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [googleContacts, setGoogleContacts] = useState<GoogleContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [loadingGoogleContacts, setLoadingGoogleContacts] = useState(false);
  const [importingContacts, setImportingContacts] = useState(false);
  const [showGoogleContacts, setShowGoogleContacts] = useState(false);

  useEffect(() => {
    // Allow viewing dashboard even without auth for development
    loadUserData();
    loadStatistics();
  }, []);

  const loadGoogleContacts = async () => {
    if (!session?.provider_token) {
      alert('Bitte melden Sie sich zuerst mit Google an, um Kontakte zu sehen');
      return;
    }

    try {
      setLoadingGoogleContacts(true);
      const response = await axios.get(`/api/google/contacts/list?accessToken=${session.provider_token}`);
      setGoogleContacts(response.data || []);
      setShowGoogleContacts(true);
    } catch (error: any) {
      console.error('Failed to load Google contacts:', error);
      alert('Fehler beim Laden der Google Kontakte: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoadingGoogleContacts(false);
    }
  };

  const handleToggleContact = (resourceName: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceName)) {
        newSet.delete(resourceName);
      } else {
        newSet.add(resourceName);
      }
      return newSet;
    });
  };

  const handleImportSelected = async () => {
    if (selectedContacts.size === 0) {
      alert('Bitte wählen Sie mindestens einen Kontakt aus');
      return;
    }

    if (!session?.provider_token || !user?.id) {
      alert('Fehler: Keine Berechtigung');
      return;
    }

    try {
      setImportingContacts(true);
      const response = await axios.post('/api/google/contacts/import-selected', {
        accessToken: session.provider_token,
        userId: user.id,
        resourceNames: Array.from(selectedContacts),
      });
      
      alert(`✅ ${response.data?.length || 0} Kontakt(e) erfolgreich importiert`);
      setSelectedContacts(new Set());
      setShowGoogleContacts(false);
      // Refresh statistics to show updated contact count
      loadStatistics();
    } catch (error: any) {
      console.error('Failed to import contacts:', error);
      alert('Fehler beim Importieren: ' + (error.response?.data?.error || error.message));
    } finally {
      setImportingContacts(false);
    }
  };

  const loadUserData = async () => {
    try {
      if (user) {
        const name = user?.user_metadata?.full_name || 
                     user?.user_metadata?.name || 
                     user?.email?.split('@')[0] || 
                     'User';
        setUserName(name);

        // Load company name from profile
        if (user?.id) {
          try {
            const response = await axios.get(`/api/user/profile?userId=${user.id}`);
            if (response.data?.company_name) {
              setCompanyName(response.data.company_name);
            } else {
              setCompanyName('Ihr Unternehmen');
            }
          } catch (error) {
            // Profile might not exist yet
            setCompanyName('Ihr Unternehmen');
          }
        }
      } else {
        // Development mode - use default values
        setUserName('Benutzer');
        setCompanyName('Ihr Unternehmen');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      setCompanyName('Ihr Unternehmen');
    }
  };

  const loadStatistics = async () => {
    try {
      if (user?.id) {
        const response = await axios.get(`/api/visits?userId=${user.id}&limit=100`);
        const visits = response.data || [];
        const pendingReports = visits.filter((v: any) => v.status === 'draft').length;

        setStatistics({
          recentVisits: visits.length,
          pendingReports,
          syncStatus: 'Alles synchronisiert',
        });
      } else {
        // Development mode - use default values
        setStatistics({
          recentVisits: 0,
          pendingReports: 0,
          syncStatus: 'Alles synchronisiert',
        });
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
      setStatistics(prev => ({ ...prev, syncStatus: 'Fehler beim Laden' }));
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${now.getDate()}. ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  return (
    <>
      {/* Welcome Section */}
      <div className="bg-white border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1" style={{ color: '#0F172A', fontWeight: 600 }}>
                Hallo, {userName}
              </h1>
              <p className="text-base mb-2" style={{ color: '#2563EB', fontWeight: 500 }}>
                {companyName}
              </p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: '#475569' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm" style={{ color: '#475569' }}>{getCurrentDate()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-6">
            <h3 className="text-sm font-medium mb-2" style={{ color: '#475569' }}>Besuche</h3>
            <p className="text-3xl font-bold" style={{ color: '#0F172A' }}>{statistics.recentVisits}</p>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-medium mb-2" style={{ color: '#475569' }}>Ausstehende Berichte</h3>
            <p className="text-3xl font-bold" style={{ color: '#0F172A' }}>{statistics.pendingReports}</p>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-medium mb-2" style={{ color: '#475569' }}>Sync-Status</h3>
            <p className="text-lg font-semibold" style={{ color: '#059669' }}>{statistics.syncStatus}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/contact-selection')}
            className="card p-6 text-left hover:shadow-lg transition-shadow"
            style={{ backgroundColor: '#2563EB', color: 'white' }}
          >
            <h2 className="text-xl font-semibold mb-2">Neuer Besuch</h2>
            <p className="text-sm opacity-90">Erstellen Sie einen neuen Kundenbesuch</p>
          </button>

          <button
            onClick={() => navigate('/form-builder')}
            className="card p-6 text-left hover:shadow-lg transition-shadow"
            style={{ borderColor: '#2563EB', borderWidth: '2px' }}
          >
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#2563EB' }}>Formular erstellen</h2>
            <p className="text-sm" style={{ color: '#475569' }}>Erstellen Sie eine neue Formularvorlage</p>
          </button>
        </div>

        {/* Google Contacts Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: '#0F172A' }}>Google Kontakte</h2>
            {!showGoogleContacts ? (
              <button
                onClick={loadGoogleContacts}
                disabled={loadingGoogleContacts || !session?.provider_token}
                className="btn-outlined text-sm"
                style={{ opacity: (!session?.provider_token || loadingGoogleContacts) ? 0.5 : 1 }}
              >
                {loadingGoogleContacts ? 'Laden...' : 'Kontakte anzeigen'}
              </button>
            ) : (
              <button
                onClick={() => setShowGoogleContacts(false)}
                className="text-sm font-medium"
                style={{ color: '#475569' }}
              >
                Ausblenden
              </button>
            )}
          </div>

          {showGoogleContacts && (
            <div className="card p-6">
              {googleContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: '#475569' }}>Keine Google Kontakte gefunden</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm" style={{ color: '#475569' }}>
                      {selectedContacts.size} von {googleContacts.length} ausgewählt
                    </p>
                    {selectedContacts.size > 0 && (
                      <button
                        onClick={handleImportSelected}
                        disabled={importingContacts}
                        className="btn-primary text-sm"
                        style={{ opacity: importingContacts ? 0.6 : 1 }}
                      >
                        {importingContacts ? 'Importiere...' : `Ausgewählte importieren (${selectedContacts.size})`}
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {googleContacts.map((contact) => {
                      const isSelected = selectedContacts.has(contact.resourceName);
                      return (
                        <div
                          key={contact.resourceName}
                          onClick={() => handleToggleContact(contact.resourceName)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          style={{ border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0' }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleContact(contact.resourceName)}
                            className="w-5 h-5 rounded"
                            style={{ accentColor: '#2563EB' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {contact.avatar_url ? (
                            <img
                              src={contact.avatar_url}
                              alt={contact.full_name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ backgroundColor: '#2563EB' }}>
                              {contact.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm" style={{ color: '#0F172A' }}>{contact.full_name}</p>
                            {contact.email && (
                              <p className="text-xs truncate" style={{ color: '#475569' }}>{contact.email}</p>
                            )}
                            {contact.phone && (
                              <p className="text-xs" style={{ color: '#475569' }}>{contact.phone}</p>
                            )}
                            {contact.company && (
                              <p className="text-xs" style={{ color: '#64748B' }}>{contact.company}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Recent Visits Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: '#0F172A' }}>Kürzliche Besuche</h2>
            <button className="text-sm font-medium" style={{ color: '#2563EB' }}>
              Alle anzeigen
            </button>
          </div>
          
          <div className="text-center py-12">
            <svg className="w-20 h-20 mx-auto mb-4 opacity-30" style={{ color: '#475569' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0F172A' }}>Noch keine Besuche</h3>
            <p className="text-base mb-6" style={{ color: '#475569' }}>
              Starten Sie Ihren ersten Kundenbesuch, um ihn hier zu sehen
            </p>
            <button
              onClick={() => navigate('/contact-selection')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ersten Besuch erstellen
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/contact-selection')}
        className="fixed bottom-6 right-6 btn-primary rounded-2xl px-6 py-4 flex items-center gap-2 shadow-lg z-40"
        style={{ borderRadius: '16px' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Besuch starten</span>
      </button>
    </>
  );
}

