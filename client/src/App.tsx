import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import SplashScreen from './pages/SplashScreen';
import { supabase } from './services/supabase';
import Toaster from './components/Toaster';
import { useNotificationStore } from './store/notificationStore';
import { useThemeStore } from './store/themeStore';
import { WifiOff } from 'lucide-react';

// Lazy load pages for better performance
const GoogleSignInScreen = lazy(() => import('./pages/GoogleSignInScreen'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FormTemplates = lazy(() => import('./pages/FormTemplates'));
const FormBuilder = lazy(() => import('./pages/FormBuilder'));
const FormFilling = lazy(() => import('./pages/FormFilling'));
const Submissions = lazy(() => import('./pages/Submissions'));
const SubmissionDetail = lazy(() => import('./pages/SubmissionDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const VisitWorkflow = lazy(() => import('./pages/VisitWorkflow'));


// OAuth callback handler

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
          setError(`Authentifizierungsfehler: ${errorParam}`);
          setTimeout(() => window.location.href = '/', 3000);
          return;
        }

        // Wait a bit for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(`Sitzungsfehler: ${sessionError.message}`);
          setTimeout(() => window.location.href = '/', 3000);
          return;
        }

        if (data.session) {
          await initialize();
          window.location.href = '/dashboard';
        } else {
          setError('Keine Sitzung gefunden. Weiterleitung...');
          setTimeout(() => window.location.href = '/', 2000);
        }
      } catch (err: any) {
        console.error('Callback handler error:', err);
        setError(err.message || 'Authentifizierung fehlgeschlagen');
        setTimeout(() => window.location.href = '/', 3000);
      }
    };
    handleCallback();
  }, [initialize]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-md border border-slate-100">
          <h2 className="text-2xl font-black text-red-600 mb-4 uppercase tracking-tighter">Authentifizierungsfehler</h2>
          <p className="text-slate-600 font-bold mb-6">{error}</p>
          <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            Weiterleitung zur Startseite...
          </div>
        </div>
      </div>
    );
  }

  return <SplashScreen />;
}

function App() {
  const { user, loading, initialized, initialize } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { warn, success: notifySuccess } = useNotificationStore();

  useEffect(() => {
    initialize();

    const handleOnline = () => {
      setIsOnline(true);
      notifySuccess('Wieder online', 'Ihre Verbindung wurde wiederhergestellt.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      warn('Offline-Modus', 'Sie sind nicht mit dem Internet verbunden. Änderungen werden lokal gespeichert.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initialize, warn, notifySuccess]);

  // Theme support
  const { theme } = useThemeStore();
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!initialized || loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Suspense fallback={<SplashScreen />}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<GoogleSignInScreen />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center z-[2000] flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3" />
          OFFLINE-MODUS AKTIV
        </div>
      )}

      <Suspense fallback={<SplashScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="visits/new" element={<VisitWorkflow />} />
            <Route path="templates" element={<FormTemplates />} />
            <Route path="templates/new" element={<FormBuilder />} />
            <Route path="templates/:id/edit" element={<FormBuilder />} />
            <Route path="templates/:templateId/fill" element={<FormFilling />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="submissions/:id" element={<SubmissionDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
