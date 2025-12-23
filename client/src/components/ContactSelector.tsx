import { useState, useEffect } from 'react';
import { googleContactsService, GoogleContact } from '../services/google-contacts.service';
import { Search, User, Mail, Phone, MapPin, X, Loader } from 'lucide-react';

interface ContactSelectorProps {
  onSelect: (contact: GoogleContact) => void;
  onClose: () => void;
  initialContact?: GoogleContact | null;
}

export default function ContactSelector({ onSelect, onClose, initialContact }: ContactSelectorProps) {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<GoogleContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = contacts.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone?.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await googleContactsService.fetchContacts();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err: any) {
      console.error('Load contacts error:', err);
      setError(err.message || 'Failed to load Google Contacts. Please ensure you granted contacts permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (contact: GoogleContact) => {
    onSelect(contact);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Select Contact</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={loadContacts}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'No contacts found' : 'No contacts available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{contact.name}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {contact.address}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

