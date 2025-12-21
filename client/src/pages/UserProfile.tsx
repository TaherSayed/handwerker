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
    companyName: 'Ihr Unternehmen',
  });

  useEffect(() => {
    if (!user) {
      navigate('/google-sign-in');
      return;
    }

    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      const name = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'User';
      setUserData(prev => ({ ...prev, name, email: user?.email || '' }));

      if (user?.id) {
        try {
          const response = await axios.get(`/api/user/profile?userId=${user.id}`);
          if (response.data?.company_name) {
            setUserData(prev => ({ ...prev, companyName: response.data.company_name }));
          }
        } catch (error) {
          // Profile might not exist yet
          console.log('Profile not found, using default');
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/google-sign-in');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: '#0F172A', fontWeight: 600 }}>Profil</h1>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#0F172A' }}>Kontoinformationen</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>Name</label>
              <p className="text-base" style={{ color: '#0F172A' }}>{userData.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>Email</label>
              <p className="text-base" style={{ color: '#0F172A' }}>{userData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>Unternehmen</label>
              <p className="text-base" style={{ color: '#0F172A' }}>{userData.companyName}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <button
            onClick={handleSignOut}
            className="px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
            style={{ backgroundColor: '#DC2626', color: 'white', minHeight: '48px' }}
          >
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}

