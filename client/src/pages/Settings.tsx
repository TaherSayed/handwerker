import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';
import { supabase } from '../services/supabase';
import {
  User, Building, ShieldCheck, CheckCircle2, Loader2, Info,
  Settings as SettingsIcon, Sun, Moon, Database, Palette, LogOut, ChevronRight, FileJson, Trash2
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import Button from '../components/common/Button';
import { useNotificationStore } from '../store/notificationStore';

type Tab = 'general' | 'profile' | 'company' | 'data' | 'info';

export default function Settings() {
  const { profile, refreshProfile, signOut } = useAuthStore();
  const { success, error: notifyError } = useNotificationStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    company_logo_url: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const mountRef = useRef(false);

  // Initialize Data
  useEffect(() => {
    if (profile && !mountRef.current) {
      setFormData({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        company_logo_url: profile.company_logo_url || '',
      });
      mountRef.current = true;
    }
  }, [profile]);

  // Auto-Save
  useEffect(() => {
    if (!mountRef.current || !profile) return;

    const timer = setTimeout(async () => {
      if (
        formData.full_name === (profile.full_name || '') &&
        formData.company_name === (profile.company_name || '') &&
        formData.company_logo_url === (profile.company_logo_url || '')
      ) return;

      setIsSaving(true);
      try {
        await apiService.updateProfile(formData);
        await refreshProfile();
        setLastSaved(new Date());
      } catch (error: any) {
        console.error('Auto-save error:', error);
        notifyError('Fehler', 'Speichern fehlgeschlagen.');
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, profile, refreshProfile, notifyError]);

  const handleLogout = async () => {
    if (confirm('Möchten Sie sich wirklich abmelden?')) {
      await signOut();
      window.location.href = '/';
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLogoLoading(true);

      const fileExt = file.name.split('.').pop();
      // Simple path structure: userId/timestamp.ext
      // We can use the current user's ID from auth state if available, or just a random ID if not critical for path
      // But typically we want user ID. Let's assume user is logged in.
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'unknown';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // DIRECT UPLOAD: Bypasses backend signed-url generation issues
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase direct upload failed:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      const newLogoUrl = publicUrlData.publicUrl;

      // Update local state immediately
      setFormData(prev => ({ ...prev, company_logo_url: newLogoUrl }));

      // Persist to backend immediately
      await apiService.updateProfile({ ...formData, company_logo_url: newLogoUrl });
      await refreshProfile();

      success('Logo aktualisiert', 'Ihr neues Firmenlogo wurde gespeichert.');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      notifyError('Upload fehlgeschlagen', error.message || 'Bitte versuchen Sie es später erneut.');
    } finally {
      setLogoLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'general', label: 'Allgemein', icon: SettingsIcon },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'company', label: 'Firma', icon: Building },
    { id: 'data', label: 'Daten', icon: Database },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      {/* Header with Save Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="heading-xl text-slate-900 dark:text-white mb-1">Einstellungen</h1>
          <p className="text-slate-500 font-medium text-sm">Verwalten Sie Ihre App-Präferenzen</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm self-start md:self-auto">
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Speichert...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gespeichert {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Bereit</span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 border ${isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8 min-h-[400px]">

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-8 animate-slide-up">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">Erscheinungsbild</h2>
                  <p className="text-sm text-slate-500">Passen Sie das Design der App an</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer" onClick={toggleTheme}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-amber-100 text-amber-600'}`}>
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{theme === 'dark' ? 'Dunkelmodus' : 'Heller Modus'}</span>
                    <span className="text-xs text-slate-500">Klicken zum Wechseln</span>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </section>

            <hr className="border-slate-100 dark:border-slate-700" />

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">Über die App</h2>
                  <p className="text-sm text-slate-500">Version & Rechtliches</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a href="#" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex items-center justify-between group">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Impressum</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </a>
                <a href="#" className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex items-center justify-between group">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Datenschutz</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </a>
              </div>
              <div className="px-1 pt-2 flex justify-between items-center text-xs font-medium text-slate-400">
                <span>OnSite Forms Pro</span>
                <span>v1.2.0 (Build 2404)</span>
              </div>
            </section>

            <div className="pt-4 flex justify-center mobile:justify-stretch">
              <Button variant="ghost" className="text-red-500 w-full md:w-auto" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Ausloggen
              </Button>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-white">
                {profile?.auth_metadata?.avatar_url ? (
                  <img src={profile.auth_metadata.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xl">
                    {formData.full_name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{formData.full_name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  Google Konto verbunden
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Anzeigename</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2 opacity-75">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between">
                  <span>E-Mail (Google)</span>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-slate-400">READ ONLY</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={profile?.email || ''}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border-0 text-slate-500 font-medium cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* COMPANY TAB */}
        {activeTab === 'company' && (
          <div className="space-y-8 animate-slide-up">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex gap-4 items-start border border-blue-100 dark:border-blue-900/30">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                Diese Informationen erscheinen automatisch auf allen Ihren PDF-Berichten und Exporten.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Firmenname</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="z.B. Mustermann Handwerk GmbH"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium dark:text-white transition-all"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Firmenlogo</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-sm relative group overflow-hidden">
                    {formData.company_logo_url ? (
                      <img src={formData.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building className="w-8 h-8 text-slate-300" />
                    )}
                    {logoLoading && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={logoLoading}
                    >
                      Logo hochladen
                    </Button>
                    {formData.company_logo_url && (
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, company_logo_url: '' }))}
                        className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1"
                      >
                        Logo löschen
                      </button>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Empfohlen: PNG oder JPG, quadratisch.</p>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === 'data' && (
          <div className="space-y-8 animate-slide-up">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">Datenmanagement</h2>
                  <p className="text-sm text-slate-500">Import & Export von Vorlagen und Berichten</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Import Templates */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Standard-Vorlagen</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Installieren Sie 20 professionelle Handwerker-Vorlagen (Rapporte, Abnahmen, Protokolle).
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!confirm('20 Standard-Vorlagen werden importiert. Fortfahren?')) return;
                      try {
                        const { seedService } = await import('../services/seed.service');
                        const count = await seedService.seedTemplates();
                        success('Import erfolgreich', `${count} Vorlagen erstellt.`);
                      } catch (e) {
                        notifyError('Fehler', 'Import fehlgeschlagen.');
                      }
                    }}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Vorlagen importieren
                  </Button>
                </div>

                {/* Cache Cleanup */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Lokalen Speicher bereinigen</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Löscht temporäre Dateien und Cache. Es gehen keine gespeicherten Daten verloren.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm('Cache wirklich leeren? Die Seite wird neu geladen.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    size="sm"
                    className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 shrink-0"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cache leeren
                  </Button>
                </div>

                {/* JSON Export (Stub) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75 grayscale">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Backup erstellen (Coming Soon)</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Laden Sie alle Ihre Berichte und Einstellungen als JSON-Archiv herunter.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    disabled
                    size="sm"
                    className="shrink-0"
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Exportieren
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
