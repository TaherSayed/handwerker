import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import CalendarWidget from '../components/CalendarWidget';

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

  useEffect(() => {
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
      } else {
        setUserName('Benutzer');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
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
    <div style={{ 
      backgroundColor: '#F5F5F7',
      minHeight: '100vh',
      paddingBottom: '2rem'
    }}>
      {/* Clean Apple-style Header */}
      <div className="bg-white border-b" style={{ borderColor: '#D1D1D6' }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#1D1D1F', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Hallo, {userName}
          </h1>
          <p className="text-sm" style={{ color: '#86868B' }}>
            {getCurrentDate()}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Apple-style Simple Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Actions - Large Cards */}
          <div className="lg:col-span-2 space-y-4">

            {/* Apple-style Primary Action Card */}
            <button
              onClick={() => navigate('/contact-selection')}
              className="w-full bg-white rounded-2xl p-8 text-left hover:shadow-xl transition-all group"
              style={{ 
                border: '1px solid #E5E5EA',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                    Neuer Besuch
                  </h2>
                  <p className="text-sm" style={{ color: '#86868B' }}>
                    Kundenbesuch erstellen
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:bg-opacity-90 transition" style={{ backgroundColor: '#007AFF' }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Secondary Action */}
            <button
              onClick={() => navigate('/form-builder')}
              className="w-full bg-white rounded-2xl p-6 text-left hover:shadow-lg transition-all"
              style={{ 
                border: '1px solid #E5E5EA',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                    Formular erstellen
                  </h3>
                  <p className="text-xs" style={{ color: '#86868B' }}>
                    Neue Vorlage
                  </p>
                </div>
                <svg className="w-5 h-5" style={{ color: '#86868B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Statistics Summary */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E5E5EA', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 className="text-base font-semibold mb-4" style={{ color: '#1D1D1F' }}>Übersicht</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#86868B' }}>Besuche</p>
                  <p className="text-3xl font-semibold" style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                    {statistics.recentVisits}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#86868B' }}>Ausstehend</p>
                  <p className="text-3xl font-semibold" style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                    {statistics.pendingReports}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Calendar */}
          <div className="lg:col-span-1">
            <CalendarWidget />
          </div>
        </div>

      </div>
    </div>
  );
}
