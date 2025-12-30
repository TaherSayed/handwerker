import { useState, useEffect } from 'react';
import { googleContactsService, GoogleContact } from '../services/google-contacts.service';
import { useAuthStore } from '../store/authStore';
import { Search, User, Mail, Phone, MapPin, X, AlertCircle, RefreshCw, Key, ChevronRight, Contact2, ShieldCheck } from 'lucide-react';
import Button from './common/Button';
import { useNotificationStore } from '../store/notificationStore';

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
  const { success, error: notifyError } = useNotificationStore();

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
      if (force) success('Kontakte aktualisiert', 'Ihre Google-Kontakte wurden erfolgreich synchronisiert.');
    } catch (err: any) {
      console.error('Load contacts error:', err);
      setError(err.message || 'Synchronisierung der Google-Kontakte fehlgeschlagen');
      notifyError('Sync-Fehler', 'Google-Kontakte konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    try {
      setLoading(true);
      await signIn(); // Redirects to Google
    } catch (err) {
      notifyError('Fehler', 'Anmeldung konnte nicht gestartet werden.');
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

      <div className="relative w-full max-w-2xl bg-white dark:bg-dark-card sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-dark-stroke flex items-center justify-between bg-white dark:bg-dark-card sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner">
              <Contact2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">KUNDEN AUSWÄHLEN</h2>
              <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest mt-0.5 opacity-60">AUS IHREN GOOGLE KONTAKTEN</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
            type="button"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50/50 dark:bg-dark-highlight border-b border-slate-100 dark:border-dark-stroke">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nach Name, E-Mail oder Telefon suchen..."
              className="input pl-12 w-full bg-white shadow-sm border-slate-200 group-focus-within:border-indigo-500 font-bold text-sm"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest animate-pulse">Kontakte werden synchronisiert...</p>
            </div>
          ) : error ? (
            <div className="p-8 h-full flex items-center">
              <div className="bg-amber-50 rounded-[2.5rem] p-10 border border-amber-100 flex flex-col items-center text-center w-full shadow-xl shadow-amber-500/5">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-amber-500">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Berechtigung erforderlich</h3>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
                  Wir benötigen Zugriff auf Ihre Google Kontakte. Falls Sie die Erlaubnis bereits erteilt haben, ist Ihre Sitzung möglicherweise abgelaufen.
                </p>
                <div className="flex flex-col w-full gap-4 max-w-sm">
                  <Button onClick={handleReconnect} variant="primary" size="lg" icon={<Key className="w-5 h-5" />}>
                    Google Verbindung herstellen
                  </Button>
                  <Button onClick={() => loadContacts(true)} variant="secondary" size="lg" icon={<RefreshCw className="w-5 h-5" />}>
                    Erneut versuchen
                  </Button>
                </div>
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-dark-highlight rounded-[2rem] flex items-center justify-center mb-6 text-slate-200 dark:text-dark-bg">
                <User className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                {searchQuery ? 'Keine Treffer' : 'Keine Kontakte'}
              </h3>
              <p className="text-slate-400 dark:text-dark-text-muted text-sm font-bold uppercase tracking-tight opacity-70">
                {searchQuery ? 'Versuchen Sie einen anderen Suchbegriff' : 'Fügen Sie Kontakte zu Ihrem Google-Konto hinzu'}
              </p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 gap-3">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className="group flex items-start gap-4 p-4 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-stroke hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 font-black text-lg">
                    {contact.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{contact.name}</h4>
                    <div className="space-y-1 mt-1">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-dark-text-muted font-medium truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-dark-text-muted font-medium">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.address && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-dark-text-muted font-medium truncate">
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
        <div className="p-6 bg-slate-50 dark:bg-dark-highlight border-t border-slate-100 dark:border-dark-stroke flex items-center justify-center">
          <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-black uppercase tracking-[0.3em] flex items-center gap-3">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            Sichere Synchronisierung via Google People API
          </p>
        </div>
      </div>
    </div>
  );
}
