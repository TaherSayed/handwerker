import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserData();
  }, [user]);

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
      minHeight: '100vh'
    }}>
      {/* Clean Header */}
      <div className="bg-white border-b" style={{ borderColor: '#D1D1D6' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#1D1D1F', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Hallo, {userName}
          </h1>
          <p className="text-sm" style={{ color: '#86868B' }}>
            {getCurrentDate()}
          </p>
        </div>
      </div>

      {/* Centered Simple Actions */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="space-y-6">
          
          {/* Primary Action: New Visit */}
          <button
            onClick={() => navigate('/contact-selection')}
            className="w-full bg-white rounded-3xl p-10 text-left hover:shadow-2xl transition-all group"
            style={{ 
              border: '1px solid #E5E5EA',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold mb-2" style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                  Neuer Besuch
                </h2>
                <p className="text-base" style={{ color: '#86868B' }}>
                  Kunde auswählen und Besuch dokumentieren
                </p>
              </div>
              <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform" style={{ backgroundColor: '#007AFF' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </button>


        </div>
      </div>
    </div>
  );
}
