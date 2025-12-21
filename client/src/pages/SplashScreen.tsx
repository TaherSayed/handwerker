import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/google-sign-in');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">OnSite</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

