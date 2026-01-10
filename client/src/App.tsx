import { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Toaster from './components/Toaster';
import { useNotificationStore } from './store/notificationStore';
import { useThemeStore } from './store/themeStore';
import { WifiOff } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';
import { googleContactsService } from './services/google-contacts.service';

// Lazy load sync service to avoid blocking initial load
let syncServiceLoaded = false;
const loadSyncService = () => {
  if (!syncServiceLoaded) {
    import('./services/sync.service');
    syncServiceLoaded = true;
  }
};

// Lazy loading pages with min-h-screen to prevent layout shift
const GoogleSignInScreen = lazy(() => import('./pages/GoogleSignInScreen'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FormTemplates = lazy(() => import('./pages/FormTemplates'));
const FormBuilder = lazy(() => import('./pages/FormBuilder'));
const FormFilling = lazy(() => import('./pages/FormFilling'));
const Submissions = lazy(() => import('./pages/Submissions'));
const SubmissionDetail = lazy(() => import('./pages/SubmissionDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const VisitWorkflow = lazy(() => import('./pages/VisitWorkflow'));

// OAuth callback handler (now used just for processing and potential error display)
function AuthCallback() {
  const { user, initialized } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for errors in hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorParam = hashParams.get('error_description') || hashParams.get('error');
    if (errorParam) {
      setError(`Authentifizierungsfehler: ${decodeURIComponent(errorParam)}`);
    }

    // If we have a user and were on the callback, redirect to dashboard
    if (initialized && user) {
      // Small delay to show "Authenticating..." status
      const timer = setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, initialized]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl p-10 max-w-md border border-slate-100 dark:border-dark-stroke">
          <h2 className="text-2xl font-black text-red-600 mb-4 uppercase tracking-tighter">Login fehlgeschlagen</h2>
          <p className="text-slate-600 dark:text-dark-text-body font-bold mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  return <LoadingScreen text="Finalisiere Anmeldung..." />;
}

function App() {
  const { user, loading, initialized, initialize } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { warn, success: notifySuccess } = useNotificationStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize auth only once
    if (!initializedRef.current) {
      initialize();
      initializedRef.current = true;
    }

    const handleOnline = () => {
      setIsOnline(true);
      notifySuccess('Wieder online', 'Ihre Verbindung wurde wiederhergestellt.');
      loadSyncService();
    };

    const handleOffline = () => {
      setIsOnline(false);
      warn('Offline-Modus', 'Sie sind nicht mit dem Internet verbunden. Änderungen werden lokal gespeichert.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync service load
    const syncTimeout = setTimeout(() => loadSyncService(), 2000);

    // Start/Stop Google Contacts Auto-sync
    if (user && initialized) {
      googleContactsService.startAutoSync();
    } else {
      googleContactsService.stopAutoSync();
    }

    return () => {
      clearTimeout(syncTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      googleContactsService.stopAutoSync();
    };
  }, [initialize, warn, notifySuccess, user, initialized]);

  // Theme support
  const { theme } = useThemeStore();
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!initialized || (loading && !user)) {
    return <LoadingScreen text="System wird gestartet..." />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
          {/* Offline Indicator */}
          {!isOnline && (
            <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center z-[2000] flex items-center justify-center gap-2">
              <WifiOff className="w-3 h-3" />
              OFFLINE-MODUS AKTIV
            </div>
          )}

          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {!user ? (
                // Unauthenticated routes
                <Route path="*" element={<GoogleSignInScreen />} />
              ) : (
                // Authenticated routes
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
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              )}
            </Routes>
          </Suspense>
          <Toaster />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
