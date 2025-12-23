import { useState, useEffect } from 'react';
import { googleContactsService, GoogleContact } from '../services/google-contacts.service';
import { Search, User, Mail, Phone, MapPin, X, Loader } from 'lucide-react';

interface ContactSelectorProps {
  onSelect: (contact: GoogleContact) => void;
  onClose: () => void;
  initialContact?: GoogleContact | null; // Reserved for future use
}

export default function ContactSelector({ onSelect, onClose, initialContact: _initialContact }: ContactSelectorProps) {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Contact</h2>
            <p className="text-sm text-gray-600 mt-1">Choose from your Google Contacts</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="input pl-12 w-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600 font-medium">Loading contacts...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
              <p className="text-red-800 font-medium mb-4">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={loadContacts}
                  className="btn-primary text-sm"
                >
                  Retry
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary text-sm"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-red-600 mt-4">
                Tip: Make sure you granted contacts permission during Google sign-in
              </p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No contacts found' : 'No contacts available'}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Your Google Contacts will appear here once synced'}
              </p>
              {!searchQuery && (
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1 truncate">{contact.name}</div>
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{contact.address}</span>
                          </div>
                        )}
                      </div>
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

