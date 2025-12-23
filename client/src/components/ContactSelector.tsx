import { useState, useEffect } from 'react';
import { googleContactsService, GoogleContact } from '../services/google-contacts.service';
import { useAuthStore } from '../store/authStore';
import { Search, User, Mail, Phone, MapPin, X, AlertCircle, RefreshCw, Key, ChevronRight } from 'lucide-react';

interface ContactSelectorProps {
  onSelect: (contact: GoogleContact) => void;
  onClose: () => void;
  initialContact?: GoogleContact | null;
}

export default function ContactSelector({ onSelect, onClose }: ContactSelectorProps) {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<GoogleContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { signIn } = useAuthStore();

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = contacts.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(lowerQuery) ||
        contact.email?.toLowerCase().includes(lowerQuery) ||
        contact.phone?.includes(searchQuery)
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const loadContacts = async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await googleContactsService.fetchContacts(force);
      setContacts(data);
    } catch (err: any) {
      console.error('Load contacts error:', err);
      setError(err.message || 'Unable to sync Google Contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    try {
      setLoading(true);
      await signIn(); // This will redirect to Google for re-authentication/consent
    } catch (err) {
      setError('Failed to initiate re-authentication');
      setLoading(false);
    }
  };

  const handleSelect = (contact: GoogleContact) => {
    onSelect(contact);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900">Select Customer</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">From Google Contacts</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="input pl-12 w-full bg-white shadow-sm border-slate-200 group-focus-within:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-bold text-sm animate-pulse">Syncing Google Contacts...</p>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Sync Permission Required</h3>
                <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                  We need your permission to access Google Contacts. If you've already granted it, your session might have expired.
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button onClick={handleReconnect} className="btn-primary w-full">
                    <Key className="w-5 h-5" />
                    Connect Google Contacts
                  </button>
                  <button onClick={() => loadContacts(true)} className="btn-secondary w-full">
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                <User className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                {searchQuery ? 'No matches found' : 'No contacts found'}
              </h3>
              <p className="text-slate-400 text-sm font-medium">
                {searchQuery ? 'Try a different search term' : 'Add some contacts to your Google account first'}
              </p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 gap-3">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 font-black text-lg">
                    {contact.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{contact.name}</h4>
                    <div className="space-y-1 mt-1">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.address && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {contact.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all self-center" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-50 flex items-center justify-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Secure Sync by Google Cloud
          </p>
        </div>
      </div>
    </div>
  );
}
