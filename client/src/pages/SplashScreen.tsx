import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, initialize, importGoogleContacts } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check if this is an OAuth callback (has code or access_token in URL)
        const code = searchParams.get('code');
        const accessToken = searchParams.get('access_token');
        
        if ((code || accessToken) && user) {
          // User just signed in via OAuth, try to import contacts
          setTimeout(() => {
            importGoogleContacts();
          }, 1500);
        }
        
        navigate('/dashboard');
      } else {
        navigate('/google-sign-in');
      }
    }
  }, [user, loading, navigate, searchParams, importGoogleContacts]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">OnSite</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

