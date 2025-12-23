import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import SplashScreen from './pages/SplashScreen';
import GoogleSignInScreen from './pages/GoogleSignInScreen';
import Dashboard from './pages/Dashboard';
import FormTemplates from './pages/FormTemplates';
import FormBuilder from './pages/FormBuilder';
import Submissions from './pages/Submissions';
import SubmissionDetail from './pages/SubmissionDetail';
import Settings from './pages/Settings';
import { supabase } from './services/supabase';

// OAuth callback handler
function AuthCallback() {
  const { initialize } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL hash which contains the auth tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = hashParams.get('error');

        if (errorParam) {
          setError(`Authentication error: ${errorParam}`);
          setTimeout(() => window.location.href = '/', 3000);
          return;
        }

        // Wait a bit for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(`Session error: ${sessionError.message}`);
          setTimeout(() => window.location.href = '/', 3000);
          return;
        }

        if (data.session) {
          await initialize();
          window.location.href = '/dashboard';
        } else {
          setError('No session found. Redirecting...');
          setTimeout(() => window.location.href = '/', 2000);
        }
      } catch (err: any) {
        console.error('Callback handler error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => window.location.href = '/', 3000);
      }
    };
    handleCallback();
  }, [initialize]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return <SplashScreen />;
}

function App() {
  const { user, loading, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized || loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<GoogleSignInScreen />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="templates" element={<FormTemplates />} />
          <Route path="templates/new" element={<FormBuilder />} />
          <Route path="templates/:id/edit" element={<FormBuilder />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
