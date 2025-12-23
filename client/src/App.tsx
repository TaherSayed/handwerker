import { useEffect } from 'react';
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

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth callback error:', error);
        window.location.href = '/';
        return;
      }
      if (data.session) {
        await initialize();
        window.location.href = '/dashboard';
      }
    };
    handleCallback();
  }, [initialize]);

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
