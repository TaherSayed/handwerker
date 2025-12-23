import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/google-sign-in');
      return;
    }

    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const name = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'User';
      setUserData(prev => ({ ...prev, name, email: user?.email || '' }));

      if (user?.id) {
        try {
          const response = await axios.get(`/api/user/profile?userId=${user.id}`);
          if (response.data) {
            setUserData(prev => ({
              ...prev,
              companyName: response.data.company_name || '',
              phone: response.data.phone || '',
              address: response.data.address || '',
            }));
          }
        } catch (error) {
          // Profile might not exist yet
          console.log('Profile not found, using default');
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (user?.id) {
        await axios.put(`/api/user/profile`, {
          userId: user.id,
          company_name: userData.companyName,
          phone: userData.phone,
          address: userData.address,
        });
        setIsEditing(false);
        alert('Profil erfolgreich aktualisiert');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Fehler beim Speichern des Profils');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563EB' }}></div>
          <p className="mt-4 text-sm" style={{ color: '#475569' }}>Laden...</p>
        </div>
      </div>
    );
  }

  const userInitials = userData.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: '#0F172A', fontWeight: 600 }}>Profil</h1>
        <p className="text-sm" style={{ color: '#475569' }}>Verwalten Sie Ihre Kontoinformationen und Einstellungen</p>
      </div>

      {/* Profile Header Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: '#2563EB' }}>
            {userInitials}
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#0F172A' }}>{userData.name}</h2>
            <p className="text-sm" style={{ color: '#475569' }}>{userData.email}</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: '#0F172A' }}>Kontoinformationen</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: '#2563EB', color: 'white' }}
            >
              Bearbeiten
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Name</label>
            <p className="text-base" style={{ color: '#0F172A' }}>{userData.name}</p>
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Der Name kann nicht geändert werden</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Email</label>
            <p className="text-base" style={{ color: '#0F172A' }}>{userData.email}</p>
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Die E-Mail-Adresse kann nicht geändert werden</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Unternehmen</label>
            {isEditing ? (
              <input
                type="text"
                value={userData.companyName}
                onChange={(e) => setUserData(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderWidth: '1px',
                  fontSize: '14px',
                  color: '#0F172A',
                }}
                placeholder="Ihr Unternehmen"
              />
            ) : (
              <p className="text-base" style={{ color: '#0F172A' }}>{userData.companyName || 'Nicht angegeben'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Telefon</label>
            {isEditing ? (
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderWidth: '1px',
                  fontSize: '14px',
                  color: '#0F172A',
                }}
                placeholder="+49 123 456789"
              />
            ) : (
              <p className="text-base" style={{ color: '#0F172A' }}>{userData.phone || 'Nicht angegeben'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>Adresse</label>
            {isEditing ? (
              <textarea
                value={userData.address}
                onChange={(e) => setUserData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderWidth: '1px',
                  fontSize: '14px',
                  color: '#0F172A',
                  minHeight: '80px',
                }}
                placeholder="Straße, PLZ Ort"
              />
            ) : (
              <p className="text-base" style={{ color: '#0F172A' }}>{userData.address || 'Nicht angegeben'}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#2563EB', color: 'white', minHeight: '48px' }}
              >
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadUserData(); // Reset to original values
                }}
                className="px-6 py-3 rounded-lg font-medium transition hover:bg-gray-100"
                style={{ color: '#475569', border: '1px solid #E2E8F0', minHeight: '48px' }}
              >
                Abbrechen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings / Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#0F172A' }}>Einstellungen</h2>
        
        <button
          onClick={async () => {
            if (confirm('Möchten Sie sich wirklich abmelden?')) {
              try {
                await signOut();
                navigate('/google-sign-in');
              } catch (error) {
                console.error('Logout failed:', error);
                alert('Fehler beim Abmelden');
              }
            }
          }}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition hover:opacity-90"
          style={{ 
            backgroundColor: '#FFF1F0',
            color: '#FF3B30',
            border: '1px solid #FFCCCB'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Abmelden
        </button>
      </div>

    </div>
  );
}

