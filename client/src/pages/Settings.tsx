import React, { useState, useEffect, useRef } from 'react';
import {
  User, Building, ShieldCheck, CheckCircle2, Loader2,
  Sun, Moon, Database, Palette, LogOut, ChevronRight, ArrowLeft,
  Mail, Trash2, ExternalLink, Shield
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { apiService } from '../services/api.service';
import { supabase } from '../services/supabase';

type Tab = 'hub' | 'profile' | 'company' | 'general' | 'data' | 'health';

const Settings: React.FC = () => {
  const { profile, user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { success, error: notifyError } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<Tab>(window.innerWidth < 768 ? 'hub' : 'profile');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    company_logo_url: '',
    company_address: '',
    company_city: '',
    company_zip: '',
    company_country: '',
    company_phone: '',
    company_website: '',
    primary_color: '#2563eb',
    accent_color: '#1e40af',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [schemaStatus, setSchemaStatus] = useState<any>(null);
  const [checkingSchema, setCheckingSchema] = useState(false);
  const mountRef = useRef(false);

  // Initial data sync
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        company_logo_url: profile.company_logo_url || '',
        company_address: profile.company_address || '',
        company_city: profile.company_city || '',
        company_zip: profile.company_zip || '',
        company_country: profile.company_country || '',
        company_phone: profile.company_phone || '',
        company_website: profile.company_website || '',
        primary_color: profile.primary_color || '#2563eb',
        accent_color: profile.accent_color || '#1e40af',
      });
    }
  }, [profile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && activeTab === 'hub') {
        setActiveTab('profile');
      }
    };
    window.addEventListener('resize', handleResize);
    checkSystemHealth();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkSystemHealth = async () => {
    try {
      setCheckingSchema(true);
      const status = await apiService.checkSchema();
      setSchemaStatus(status);
    } catch (error) {
      console.error('Failed to check system health:', error);
    } finally {
      setCheckingSchema(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true;
      return;
    }
    const timer = setTimeout(async () => {
      if (isSaving) return;

      try {
        // Deep check: only save if formData differs from the current profile
        const hasChanges = JSON.stringify({
          full_name: profile?.full_name || '',
          company_name: profile?.company_name || '',
          company_address: profile?.company_address || '',
          company_city: profile?.company_city || '',
          company_zip: profile?.company_zip || '',
          company_phone: profile?.company_phone || '',
          company_website: profile?.company_website || '',
          company_logo_url: profile?.company_logo_url || '',
        }) !== JSON.stringify(formData);

        if (!hasChanges) return;

        setIsSaving(true);
        const updatedProfile = await apiService.updateProfile(formData);

        // Update store directly with result
        useAuthStore.setState({ profile: updatedProfile });

        setLastSaved(new Date());
      } catch (err: any) {
        console.error('Auto-save error:', err);
        // Don't show error for background saves unless critical
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleLogout = async () => {
    if (confirm('Möchten Sie sich wirklich abmelden?')) {
      await signOut();
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      notifyError('Ungültiges Dateiformat', 'Erlaubt sind PNG, JPG oder SVG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notifyError('Datei zu groß', 'Die maximale Dateigröße beträgt 5 MB.');
      return;
    }

    try {
      setIsSaving(true);
      setLogoLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;

      const { path, token } = await apiService.getSignedUploadUrl('company-logos', fileName, file.type) as any;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .uploadToSignedUrl(path, token, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(path);

      const newLogoUrl = publicUrlData.publicUrl;
      const updatedData = { ...formData, company_logo_url: newLogoUrl };
      setFormData(updatedData);

      const updatedProfile = await apiService.updateProfile(updatedData);

      // Update global store directly to prevent race conditions with auto-save
      useAuthStore.setState({ profile: updatedProfile });

      // Update persistent login logo
      if (newLogoUrl) {
        localStorage.setItem('onsite_last_company_logo', newLogoUrl);
      }

      success('Logo gespeichert', 'Ihr Firmenlogo wurde erfolgreich aktualisiert.');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      notifyError('Upload fehlgeschlagen', error.message || 'Bitte versuchen Sie es erneut.');
    } finally {
      setIsSaving(false);
      setLogoLoading(false);
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Möchten Sie das Firmenlogo wirklich entfernen?')) return;
    try {
      setIsSaving(true);
      setLogoLoading(true);
      const updatedData = { ...formData, company_logo_url: '' };
      setFormData(updatedData);
      const updatedProfile = await apiService.updateProfile(updatedData);
      useAuthStore.setState({ profile: updatedProfile });

      // Remove persistent login logo
      localStorage.removeItem('onsite_last_company_logo');
      success('Logo entfernt', 'Das Firmenlogo wurde gelöscht.');
    } catch (error: any) {
      notifyError('Fehler', 'Das Logo konnte nicht entfernt werden.');
    } finally {
      setIsSaving(false);
      setLogoLoading(false);
    }
  };

  const menuItems: { id: Tab; label: string; icon: any; color: string; description: string }[] = [
    { id: 'profile', label: 'Mein Profil', icon: User, color: 'bg-blue-500', description: 'Persönliche Details & Avatar' },
    { id: 'company', label: 'Firmendaten', icon: Building, color: 'bg-indigo-500', description: 'Name, Adresse und Logo' },
    { id: 'general', label: 'Erscheinungsbild', icon: Palette, color: 'bg-purple-500', description: 'Design-Modus & Branding' },
    { id: 'data', label: 'Datenverwaltung', icon: Database, color: 'bg-teal-500', description: 'Speicher & Vorlagen-Import' },
    { id: 'health', label: 'System-Status', icon: ShieldCheck, color: 'bg-rose-500', description: 'Datenbank & Verbindung' },
  ];

  const googleAvatar = profile?.auth_metadata?.avatar_url || profile?.auth_metadata?.picture || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatarUrl = profile?.avatar_url || googleAvatar;
  const displayName = profile?.full_name || profile?.auth_metadata?.full_name || 'Benutzer';
  const displayEmail = profile?.email || user?.email || '';

  const renderSidebar = () => (
    <div className="w-full md:w-80 flex flex-col gap-2">
      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`group w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${isActive
              ? 'bg-primary-500 text-white border-primary-600 shadow-md ring-2 ring-primary-500/20'
              : 'bg-white dark:bg-dark-card text-slate-700 dark:text-dark-text-body border-slate-200 dark:border-dark-stroke hover:border-primary-400 hover:shadow-sm'
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${isActive ? 'bg-white/20' : `${item.color} text-white`}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className={`block font-bold text-sm leading-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{item.label}</span>
                <span className={`block text-[10px] uppercase tracking-wider font-semibold opacity-60`}>{isMobile ? '' : item.description}</span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-white' : 'text-slate-300'}`} />
          </button>
        );
      })}

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-dark-stroke">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-100"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">Abmelden</span>
        </button>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="flex items-center gap-6 p-6 bg-slate-50/50 dark:bg-dark-highlight rounded-3xl border border-slate-100 dark:border-dark-stroke">
        <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-dark-card shadow-lg overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-500 text-white font-black text-2xl uppercase">
              {displayName[0]}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight">{displayName}</h2>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted truncate">{displayEmail}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 border border-success-100 dark:border-success-500/20 text-[9px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Verifiziert
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Vollständiger Name</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="input h-14 pl-12 font-semibold"
              placeholder="Name eingeben"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1 flex justify-between">
            <span>E-Mail (Google)</span>
            <span className="text-[9px] font-bold text-primary-500 uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-lg">Nur Lesen</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={displayEmail}
              readOnly
              className="input h-14 pl-12 bg-slate-50 dark:bg-dark-input/50 text-slate-400 font-medium cursor-not-allowed border-dashed"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyTab = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Firmenbranding</label>
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-dark-stroke bg-slate-50/30 dark:bg-dark-highlight">
          <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-dark-input rounded-[32px] shadow-inner overflow-hidden flex items-center justify-center p-4 border border-slate-100 dark:border-dark-stroke">
            {formData.company_logo_url ? (
              <img src={formData.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Building className="w-12 h-12 text-slate-200" />
            )}
            {logoLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={logoLoading}
                className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 text-xs uppercase tracking-widest font-bold"
              >
                Hochladen
              </Button>
              {formData.company_logo_url && (
                <button
                  onClick={handleRemoveLogo}
                  className="px-4 h-11 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
              Rechteckiges oder quadratisches Format<br />PNG, JPG bis 5MB
            </p>
            <input id="logo-upload" type="file" hidden accept="image/*" onChange={handleLogoUpload} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Betriebsname</label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            className="input h-14 font-semibold"
            placeholder="Muster GmbH"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Telefon</label>
          <input
            type="text"
            value={formData.company_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, company_phone: e.target.value }))}
            className="input h-14 font-semibold"
            placeholder="+49 000 00000"
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Straße & Hausnummer</label>
          <input
            type="text"
            value={formData.company_address}
            onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
            className="input h-14 font-semibold"
            placeholder="Musterstraße 1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">PLZ</label>
            <input
              type="text"
              value={formData.company_zip}
              onChange={(e) => setFormData(prev => ({ ...prev, company_zip: e.target.value }))}
              className="input h-14 font-semibold"
              placeholder="12345"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Stadt</label>
            <input
              type="text"
              value={formData.company_city}
              onChange={(e) => setFormData(prev => ({ ...prev, company_city: e.target.value }))}
              className="input h-14 font-semibold"
              placeholder="Berlin"
            />
          </div>
        </div>
        <div className="space-y-3 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Webseite</label>
          <input
            type="url"
            value={formData.company_website}
            onChange={(e) => setFormData(prev => ({ ...prev, company_website: e.target.value }))}
            className="input h-14 font-semibold"
            placeholder="https://www.ihre-firma.de"
          />
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-12 animate-fade-in">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Erscheinungsbild</h3>
          <div className="h-0.5 flex-1 mx-6 bg-slate-50 dark:bg-dark-stroke" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`p-6 rounded-[32px] border-2 transition-all flex flex-col gap-6 items-start text-left relative ${theme === 'light'
              ? 'border-primary-500 bg-primary-50/50 shadow-lg'
              : 'border-slate-100 dark:border-dark-stroke bg-slate-50/30 dark:bg-dark-input hover:border-slate-300 shadow-sm'
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'light' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-card text-amber-500 shadow-sm'}`}>
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <span className="block font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">Hell</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">High Contrast Tech</span>
            </div>
            {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-primary-500 absolute top-6 right-6" />}
          </button>

          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`p-6 rounded-[32px] border-2 transition-all flex flex-col gap-6 items-start text-left relative ${theme === 'dark'
              ? 'border-primary-500 bg-primary-50/50 shadow-lg'
              : 'border-slate-100 dark:border-dark-stroke bg-slate-50/30 dark:bg-dark-input hover:border-slate-300 shadow-sm'
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-primary-500 text-white' : 'bg-slate-800 text-blue-400 shadow-sm'}`}>
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <span className="block font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">Dunkel</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Industrial Gray</span>
            </div>
            {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-primary-500 absolute top-6 right-6" />}
          </button>
        </div>
      </section>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="p-8 bg-slate-50/50 dark:bg-dark-highlight rounded-3xl border border-slate-100 dark:border-dark-stroke flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600 mb-4">
          <Database className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Datenverwaltung</h3>
        <p className="text-sm text-slate-500 dark:text-dark-text-muted mb-6">Import- und Export-Funktionen befinden sich derzeit im Aufbau.</p>
        <Button variant="outline" disabled>Export starten</Button>
      </div>
    </div>
  );

  const renderHealthTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-dark-stroke shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-rose-500" />
          System-Gesundheit
        </h3>

        <div className="space-y-6">
          {!schemaStatus ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
              <p className="text-slate-500">Prüfe System-Status...</p>
            </div>
          ) : (
            <>
              <div className={`p-4 rounded-xl border ${schemaStatus.admin_available
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-400'
                }`}>
                <div className="flex items-center gap-3">
                  {schemaStatus.admin_available ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Shield className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-bold text-sm">Admin-Schnittstelle (Service Role)</p>
                    <p className="text-[11px] opacity-80">
                      {schemaStatus.admin_available
                        ? 'Vollständig konfiguriert und aktiv.'
                        : 'Nicht aktiv. Eingeschränkte Funktionalität bei der automatischen Tabellen-Erstellung.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemaStatus.checks && Object.entries(schemaStatus.checks).map(([key, check]: [string, any]) => (
                  <div key={key} className="p-4 rounded-xl border border-slate-200 dark:border-dark-stroke bg-slate-50 dark:bg-dark-highlight">
                    <p className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">{key}</p>
                    {check.error ? (
                      <p className="text-[10px] text-rose-500 dark:text-rose-400 font-mono bg-rose-50 dark:bg-rose-500/10 p-2 rounded border border-rose-100 dark:border-rose-500/20">{check.error}</p>
                    ) : (
                      <ul className="space-y-2">
                        {Object.entries(check).filter(([k]) => k.startsWith('has_')).map(([k, v]) => (
                          <li key={k} className="flex items-center gap-2 text-xs">
                            {v ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Shield className="w-3.5 h-3.5 text-rose-500" />}
                            <span className={v ? 'text-slate-600 dark:text-slate-300' : 'text-rose-600 font-bold'}>
                              {k.replace('has_', '').replace('_col', '').replace('_', ' ')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {schemaStatus.sql_fix && Object.values(schemaStatus.checks || {}).some((c: any) =>
                c.error || Object.entries(c).some(([k, v]) => k.startsWith('has_') && !v)
              ) && (
                  <div className="mt-8 p-6 bg-slate-900 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-cyan-400">Erforderliche Datenbank-Reparatur:</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(schemaStatus.sql_fix);
                          success('Kopiert', 'SQL-Code kopiert.');
                        }}
                        className="px-3 py-1 bg-cyan-500 text-slate-900 text-[10px] font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                      >
                        KOPIEREN
                      </button>
                    </div>
                    <pre className="text-[10px] leading-relaxed text-slate-300 font-mono overflow-x-auto">
                      {schemaStatus.sql_fix}
                    </pre>
                    <p className="mt-4 text-[11px] text-slate-400 italic">
                      Diesen Code im <b>Supabase SQL Editor</b> ausführen, um fehlende Spalten zu erstellen.
                    </p>
                  </div>
                )}
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={checkSystemHealth}
              disabled={checkingSchema}
            >
              {checkingSchema ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Neu prüfen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20 md:pb-8">
      {/* Dynamic Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {activeTab !== 'hub' && isMobile && (
            <button
              onClick={() => setActiveTab('hub')}
              className="p-2 -ml-2 bg-slate-100 dark:bg-dark-card rounded-full text-slate-600 dark:text-dark-text-muted hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'hub' ? 'Einstellungen' : menuItems.find(m => m.id === activeTab)?.label}
            </h1>
            <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-dark-text-muted">
              {activeTab === 'hub' ? 'Konfigurieren Sie Ihre App nach Ihren Wünschen' : 'Verwalten Sie Ihre Details und Präferenzen'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 py-1.5 px-3 bg-white dark:bg-dark-card rounded-full border border-slate-100 dark:border-dark-stroke shadow-sm">
          {isSaving ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wird gesichert</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-success-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gespeichert</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Aktuell</span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {(activeTab === 'hub' || !isMobile) && renderSidebar()}

        {activeTab !== 'hub' && (
          <div className={`flex-1 w-full bg-white dark:bg-dark-card rounded-[32px] md:rounded-[40px] border border-slate-200 dark:border-dark-stroke shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300 ${isMobile ? 'animate-slide-in-mechanical' : ''}`}>
            <div className="p-8 md:p-12 space-y-12">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'company' && renderCompanyTab()}
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'data' && renderDataTab()}
              {activeTab === 'health' && renderHealthTab()}
            </div>

            {/* LEGAL LINKS */}
            <div className="px-8 md:px-12 pb-12 pt-8 border-t border-slate-100 dark:border-dark-stroke flex flex-wrap gap-6 justify-center md:justify-start">
              <a
                href="https://huko-it.de/impressum/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-primary-500 uppercase tracking-widest transition-colors"
              >
                Impressum
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://huko-it.de/datenschutzerklaerung/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-primary-500 uppercase tracking-widest transition-colors"
              >
                Datenschutz
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
