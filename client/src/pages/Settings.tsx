import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';
import { supabase } from '../services/supabase';
import {
  User, Building, ShieldCheck, CheckCircle2, Loader2, Info,
  Settings as SettingsIcon, Sun, Moon, Database, Palette, LogOut, ChevronRight
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import Button from '../components/common/Button';
import { useNotificationStore } from '../store/notificationStore';

type Tab = 'general' | 'profile' | 'company' | 'data' | 'info';

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuthStore();
  const { success, error: notifyError } = useNotificationStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    company_logo_url: '',
    company_address: '',
    company_phone: '',
    company_website: '',
    primary_color: '#2563eb',
    accent_color: '#1e40af',
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
        company_address: profile.company_address || '',
        company_phone: profile.company_phone || '',
        company_website: profile.company_website || '',
        primary_color: profile.primary_color || '#2563eb',
        accent_color: profile.accent_color || '#1e40af',
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
        formData.company_logo_url === (profile.company_logo_url || '') &&
        formData.company_address === (profile.company_address || '') &&
        formData.company_phone === (profile.company_phone || '') &&
        formData.company_website === (profile.company_website || '') &&
        formData.primary_color === (profile.primary_color || '#2563eb') &&
        formData.accent_color === (profile.accent_color || '#1e40af')
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

    // 1. Validate File Type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      notifyError('Ungültiges Dateiformat', 'Erlaubt sind PNG, JPG oder SVG.');
      return;
    }

    // 2. Validate File Size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifyError('Datei zu groß', 'Die maximale Dateigröße beträgt 5 MB.');
      return;
    }

    try {
      setLogoLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;

      // 1. Get Signed URL from Backend (bypasses RLS issues)
      // We don't need userId in filename here, backend handles the path
      const { path, token } = await apiService.getSignedUploadUrl('company-logos', fileName, file.type) as any;

      // 2. Upload to Supabase Storage using the token
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .uploadToSignedUrl(path, token, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(path);

      const newLogoUrl = publicUrlData.publicUrl;

      // Update local state immediately for preview
      setFormData(prev => ({ ...prev, company_logo_url: newLogoUrl }));

      // Persist to backend immediately - explicitly saving ONLY the logo url first to ensure it sticks
      // We essentially force a profile update here.
      console.log('Saving new logo URL:', newLogoUrl);

      const updatePayload = {
        ...formData,
        company_logo_url: newLogoUrl
      };

      await apiService.updateProfile(updatePayload);

      // Verify persistence by refreshing
      const freshProfile = await apiService.getMe() as any;
      if (freshProfile?.company_logo_url !== newLogoUrl) {
        console.warn('Logo persistence check failed - retrying update');
        await apiService.updateProfile(updatePayload);
      }

      // Refresh global profile to sync across app
      await refreshProfile();

      success('Logo gespeichert', 'Ihr Firmenlogo wurde erfolgreich aktualisiert.');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      notifyError('Upload fehlgeschlagen', error.message || 'Bitte versuchen Sie es erneut.');
    } finally {
      setLogoLoading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Möchten Sie das Firmenlogo wirklich entfernen?')) return;

    try {
      setLogoLoading(true);

      // Update local state
      setFormData(prev => ({ ...prev, company_logo_url: '' }));

      // Persist to backend
      await apiService.updateProfile({ ...formData, company_logo_url: null }); // Send null or empty string depending on backend

      await refreshProfile();
      success('Logo entfernt', 'Das Firmenlogo wurde gelöscht.');
    } catch (error: any) {
      notifyError('Fehler', 'Das Logo konnte nicht entfernt werden.');
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

  // Get Google profile information from auth_metadata or user_metadata
  const googleAvatar = profile?.auth_metadata?.avatar_url || 
                       profile?.auth_metadata?.picture || 
                       user?.user_metadata?.avatar_url || 
                       user?.user_metadata?.picture;
  
  const googleName = profile?.auth_metadata?.full_name || 
                     profile?.auth_metadata?.name || 
                     user?.user_metadata?.full_name || 
                     user?.user_metadata?.name;
  
  const googleEmail = profile?.email || user?.email || '';
  
  const displayName = profile?.full_name || googleName || 'Handwerker';

  return (
    <div className="animate-fade-in space-y-8 pb-32">
      {/* Header with Save Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Einstellungen</h1>
          <p className="text-slate-500 dark:text-dark-text-muted font-medium text-[10px] uppercase tracking-widest mt-1">Verwalten Sie Ihre Präferenzen</p>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-dark-card rounded-2xl border border-border-light dark:border-dark-stroke shadow-sm self-start md:self-auto transition-all">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary-light" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Wird gespeichert...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-success-light" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Zuletzt gesichert um {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest px-2">Synchronisiert</span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all duration-300 border uppercase tracking-widest ${isActive
                ? 'bg-primary-light text-white border-primary-light shadow-xl shadow-primary-light/30'
                : 'bg-white dark:bg-dark-card text-slate-600 dark:text-dark-text-muted border-border-light dark:border-dark-stroke hover:border-primary-light'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-dark-card rounded-[32px] border border-border-light dark:border-dark-stroke shadow-sm p-6 md:p-10 min-h-[440px] transition-all">

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-10 animate-slide-up">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark flex items-center justify-center border border-primary-light/10">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-900 dark:text-white">Farbschema</h2>
                  <p className="text-sm text-slate-500 dark:text-dark-text-muted">Wählen Sie Ihr bevorzugtes Design</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between text-left ${theme === 'light' ? 'border-primary-light bg-primary-light/5' : 'border-border-light dark:border-dark-stroke bg-slate-50 dark:bg-dark-input hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-500">
                      <Sun className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white uppercase tracking-widest text-[11px]">Helles Design</span>
                  </div>
                  {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-primary-light" />}
                </button>

                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between text-left ${theme === 'dark' ? 'border-primary-light bg-primary-light/5' : 'border-border-light dark:border-dark-stroke bg-slate-50 dark:bg-dark-input hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 shadow-sm flex items-center justify-center text-blue-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white uppercase tracking-widest text-[11px]">Dunkles Design</span>
                  </div>
                  {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-primary-light" />}
                </button>
              </div>
            </section>

            <hr className="border-border-light dark:border-dark-stroke" />

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-border-light dark:border-dark-stroke">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-900 dark:text-white">Über OnSite Forms</h2>
                  <p className="text-sm text-slate-500 dark:text-dark-text-muted">Rechtliches & Version</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="#" className="p-5 rounded-3xl border border-border-light dark:border-dark-stroke hover:border-primary-light transition-all flex items-center justify-between group bg-slate-50 dark:bg-dark-input">
                  <span className="font-medium text-slate-700 dark:text-dark-text-body uppercase tracking-widest text-[11px]">Impressum</span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-light transition-all" />
                </a>
                <a href="#" className="p-5 rounded-3xl border border-border-light dark:border-dark-stroke hover:border-primary-light transition-all flex items-center justify-between group bg-slate-50 dark:bg-dark-input">
                  <span className="font-medium text-slate-700 dark:text-dark-text-body uppercase tracking-widest text-[11px]">Datenschutz</span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-light transition-all" />
                </a>
              </div>
            </section>

            <div className="pt-6">
              <Button
                variant="secondary"
                className="w-full h-14 bg-red-50 text-error-light hover:bg-red-100 border-red-100 dark:bg-red-900/10 dark:border-red-900/20 rounded-2xl uppercase tracking-widest text-xs"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Abmelden
              </Button>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-10 animate-slide-up">
            <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-dark-input rounded-3xl border border-border-light dark:border-dark-stroke">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-dark-card shadow-sm overflow-hidden bg-white shrink-0">
                {googleAvatar ? (
                  <img src={googleAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 font-black text-2xl">
                    {displayName[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white uppercase tracking-tight truncate">{displayName}</h3>
                {googleEmail && (
                  <p className="text-sm text-slate-600 dark:text-dark-text-body truncate">{googleEmail}</p>
                )}
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success-light shrink-0" />
                  Privat-Konto (Google)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Anzeigename</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="input h-14 font-medium"
                  placeholder="Ihr Name"
                />
              </div>
              <div className="space-y-3 opacity-80">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1 flex justify-between">
                  <span>E-Mail Adresse</span>
                  <span className="text-[9px] bg-slate-100 dark:bg-dark-card px-2 py-0.5 rounded-full border dark:border-dark-stroke">Von Google</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={googleEmail}
                  className="input h-14 bg-slate-50 dark:bg-dark-card border-dashed border-2 text-slate-400 font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* COMPANY TAB */}
        {activeTab === 'company' && (
          <div className="space-y-10 animate-slide-up">
            <div className="bg-primary-light/5 p-6 rounded-[28px] flex gap-5 items-start border border-primary-light/10">
              <Info className="w-6 h-6 text-primary-light shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary-light text-sm uppercase tracking-wider mb-1">Berichts-Branding</h4>
                <p className="text-xs text-slate-600 dark:text-dark-text-muted leading-relaxed">
                  Ihr Logo und Ihre Firmendaten werden automatisch in alle generierten PDF-Berichte eingebettet.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Firmenlogo</label>
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                  <div className="w-40 h-40 bg-white dark:bg-dark-input rounded-[32px] border-2 border-dashed border-border-light dark:border-dark-stroke flex items-center justify-center p-6 shadow-inner relative group overflow-hidden">
                    {formData.company_logo_url ? (
                      <img src={formData.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Building className="w-10 h-10" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Kein Logo</span>
                      </div>
                    )}
                    {logoLoading && (
                      <div className="absolute inset-0 bg-white/95 dark:bg-dark-card/95 flex items-center justify-center z-10 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-light" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-5">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={logoLoading}
                        className="h-12 px-8 rounded-xl ring-offset-2 dark:ring-offset-dark-card"
                      >
                        {formData.company_logo_url ? 'Logo ändern' : 'Datei wählen'}
                      </Button>

                      {formData.company_logo_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          disabled={logoLoading}
                          className="h-12 px-6 rounded-xl text-error-light hover:bg-error-light/10 font-bold uppercase tracking-widest text-[10px]"
                        >
                          Löschen
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1 px-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        JPG, PNG oder SVG (Max. 5MB)
                      </p>
                      <p className="text-[10px] text-slate-300 dark:text-dark-text-muted">
                        Idealerweise quadratisch für optimale Darstellung.
                      </p>
                    </div>

                    <input
                      id="logo-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.svg"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={logoLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Firmenname</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Eigener Betrieb GmbH"
                    className="input h-14 font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Telefonnummer</label>
                  <input
                    type="text"
                    value={formData.company_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_phone: e.target.value }))}
                    placeholder="+49 (0) 123 45678"
                    className="input h-14 font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Adresse</label>
                  <input
                    type="text"
                    value={formData.company_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
                    placeholder="Musterweg 12, 12345 Stadt"
                    className="input h-14 font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Webseite</label>
                  <input
                    type="url"
                    value={formData.company_website}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_website: e.target.value }))}
                    placeholder="https://www.firma.de"
                    className="input h-14 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === 'data' && (
          <div className="space-y-10 animate-slide-up">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-success-light/10 dark:bg-success-dark/10 text-success-light dark:text-success-dark flex items-center justify-center border border-success-light/10">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-900 dark:text-white">Daten & Speicher</h2>
                  <p className="text-sm text-slate-500 dark:text-dark-text-muted">Importieren und Verwalten</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="p-6 rounded-3xl border border-border-light dark:border-dark-stroke bg-slate-50 dark:bg-dark-input flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary-light transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">Standard-Vorlagen</h3>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted max-w-sm">
                      Importieren Sie professionelle Vorlagen (Serviceberichte, Abnahmen, Bautagebücher).
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!confirm('20 Standard-Vorlagen werden importiert. Fortfahren?')) return;
                      try {
                        const { seedService } = await import('../services/seed.service');
                        const count = await seedService.seedTemplates();
                        success('Vorlagen installiert', `${count} neue Vorlagen verfügbar.`);
                      } catch (e) {
                        notifyError('Fehler', 'Import fehlgeschlagen.');
                      }
                    }}
                    size="sm"
                    className="h-12 px-6 bg-success-light text-white rounded-xl uppercase tracking-widest text-[10px] shrink-0"
                  >
                    Installieren
                  </Button>
                </div>

                <div className="p-6 rounded-3xl border border-border-light dark:border-dark-stroke bg-slate-50 dark:bg-dark-input flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary-light transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">System-Bereinigung</h3>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted max-w-sm">
                      Leert den lokalen Cache und aktualisiert die Session. Keine Web-Daten gehen verloren.
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
                    className="h-12 px-6 text-warning-light hover:bg-warning-light/10 font-bold uppercase tracking-widest text-[10px] shrink-0"
                  >
                    Speicher Leeren
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
