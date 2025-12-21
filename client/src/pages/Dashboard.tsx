import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

interface Statistics {
  recentVisits: number;
  pendingReports: number;
  syncStatus: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [statistics, setStatistics] = useState<Statistics>({
    recentVisits: 0,
    pendingReports: 0,
    syncStatus: 'Loading...',
  });
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    // Allow viewing dashboard even without auth for development
    loadUserData();
    loadStatistics();
  }, []);

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

