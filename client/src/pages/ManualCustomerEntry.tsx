import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CustomerData {
  full_name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function ManualCustomerEntry() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerData>({
    full_name: '',
    company: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleContinue = () => {
    if (!customer.full_name.trim()) {
      alert('Bitte gib mindestens einen Namen ein');
      return;
    }

    // Create a contact-like object to pass to form selection
    const contact = {
      id: 'manual-' + Date.now(),
      full_name: customer.full_name,
      company: customer.company || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || ''
    };

    navigate('/form-template-selection', { state: { contact } });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: '#D1D1D6' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-base font-medium"
            style={{ color: '#007AFF' }}
          >
            ← Zurück
          </button>
          <h1 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>
            Kundendaten eingeben
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto">
        
        <div className="space-y-4 mb-8">
          
          {/* Name (Required) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
              Name *
            </label>
            <input
              type="text"
              value={customer.full_name}
              onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })}
              placeholder="Max Mustermann"
              className="w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: customer.full_name ? '#007AFF' : '#E5E5EA',
                color: '#1D1D1F',
                fontSize: '16px'
              }}
              autoFocus
            />
          </div>

          {/* Company (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
              Firma
            </label>
            <input
              type="text"
              value={customer.company}
              onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
              placeholder="Firma GmbH"
              className="w-full px-4 py-3 rounded-2xl border focus:outline-none transition"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5EA',
                color: '#1D1D1F',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
              Telefon
            </label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="+49 123 456789"
              className="w-full px-4 py-3 rounded-2xl border focus:outline-none transition"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5EA',
                color: '#1D1D1F',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
              E-Mail
            </label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              placeholder="max@beispiel.de"
              className="w-full px-4 py-3 rounded-2xl border focus:outline-none transition"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5EA',
                color: '#1D1D1F',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Address (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
              Adresse
            </label>
            <textarea
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="Musterstraße 123&#10;12345 Musterstadt"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border focus:outline-none transition resize-none"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5EA',
                color: '#1D1D1F',
                fontSize: '16px'
              }}
            />
          </div>

        </div>

        {/* Continue Button - Fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:relative sm:border-t-0 sm:p-0 sm:bg-transparent" style={{ borderColor: '#E5E5EA' }}>
          <button
            onClick={handleContinue}
            disabled={!customer.full_name.trim()}
            className="w-full py-4 rounded-2xl font-semibold text-white transition disabled:opacity-40"
            style={{ backgroundColor: '#007AFF', fontSize: '17px' }}
          >
            Weiter zum Formular
          </button>
        </div>

        {/* Spacer for fixed button on mobile */}
        <div className="h-20 sm:hidden"></div>

      </div>
    </div>
  );
}

