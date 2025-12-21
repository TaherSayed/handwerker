import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import SplashScreen from './pages/SplashScreen';
import GoogleSignInScreen from './pages/GoogleSignInScreen';
import Dashboard from './pages/Dashboard';
import ContactSelection from './pages/ContactSelection';
import FormTemplateSelection from './pages/FormTemplateSelection';
import VisitFormFilling from './pages/VisitFormFilling';
import PdfPreview from './pages/PdfPreview';
import FormBuilder from './pages/FormBuilder';
import ContactsManagement from './pages/ContactsManagement';
import UserProfile from './pages/UserProfile';

function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/google-sign-in" element={<GoogleSignInScreen />} />
      
      {/* Allow dashboard access for development */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {user ? (
        <>
          <Route path="/contact-selection" element={<ContactSelection />} />
          <Route path="/form-template-selection" element={<FormTemplateSelection />} />
          <Route path="/visit-form-filling" element={<VisitFormFilling />} />
          <Route path="/pdf-preview" element={<PdfPreview />} />
          <Route path="/form-builder" element={<FormBuilder />} />
          <Route path="/contacts-management" element={<ContactsManagement />} />
          <Route path="/user-profile" element={<UserProfile />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/google-sign-in" replace />} />
      )}
    </Routes>
  );
}

export default App;

