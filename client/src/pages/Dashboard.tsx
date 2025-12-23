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

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Create Form Template */}
            <button
              onClick={() => navigate('/form-builder')}
              className="bg-white rounded-2xl p-6 text-left hover:shadow-lg transition-all"
              style={{ 
                border: '1px solid #E5E5EA',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#007AFF15' }}>
                  <svg className="w-6 h-6" style={{ color: '#007AFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Formular erstellen
                </h3>
                <p className="text-sm" style={{ color: '#86868B' }}>
                  Neue Vorlage anlegen
                </p>
              </div>
            </button>

            {/* Manage Contacts */}
            <button
              onClick={() => navigate('/contacts')}
              className="bg-white rounded-2xl p-6 text-left hover:shadow-lg transition-all"
              style={{ 
                border: '1px solid #E5E5EA',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#34C75915' }}>
                  <svg className="w-6 h-6" style={{ color: '#34C759' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Kontakte
                </h3>
                <p className="text-sm" style={{ color: '#86868B' }}>
                  Kundenliste verwalten
                </p>
              </div>
            </button>

          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl p-6 text-center" style={{ 
            border: '1px solid #E5E5EA',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <p className="text-sm" style={{ color: '#86868B' }}>
              <strong style={{ color: '#1D1D1F' }}>OnSite</strong> – Kundenbesuche dokumentieren und professionelle PDFs erstellen
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
