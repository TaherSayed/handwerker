import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import SplashScreen from './pages/SplashScreen';
import GoogleSignInScreen from './pages/GoogleSignInScreen';
import ContactSelection from './pages/ContactSelection';
import ManualCustomerEntry from './pages/ManualCustomerEntry';
import FormTemplateSelection from './pages/FormTemplateSelection';
import VisitFormFilling from './pages/VisitFormFilling';
import PdfPreview from './pages/PdfPreview';
import FormBuilder from './pages/FormBuilder';

function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/google-sign-in" element={<GoogleSignInScreen />} />
      
      {user ? (
        <>
          <Route path="/contact-selection" element={<ContactSelection />} />
          <Route path="/manual-customer-entry" element={<ManualCustomerEntry />} />
          <Route path="/form-template-selection" element={<Layout><FormTemplateSelection /></Layout>} />
          <Route path="/visit-form-filling" element={<Layout><VisitFormFilling /></Layout>} />
          <Route path="/pdf-preview" element={<Layout><PdfPreview /></Layout>} />
          <Route path="/form-builder" element={<FormBuilder />} />
          <Route path="*" element={<Navigate to="/contact-selection" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/google-sign-in" replace />} />
      )}
    </Routes>
  );
}

export default App;

