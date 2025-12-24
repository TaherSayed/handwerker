import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';
import { supabase } from '../services/supabase';
import { User, Building, Mail, ShieldCheck, Plus, CheckCircle2, Loader2, Info, FileText } from 'lucide-react';
import Button from '../components/common/Button';
import { useNotificationStore } from '../store/notificationStore';

export default function Settings() {
  const { profile, refreshProfile } = useAuthStore();
  const { success, error: notifyError } = useNotificationStore();

  // Local state for form fields
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    company_logo_url: '',
  });

  // State management for auto-save
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const mountRef = useRef(false);

  // Initialize form with profile data
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

  // Auto-save logic with debounce
  useEffect(() => {
    // Skip the first render or if profile isn't loaded yet
    if (!mountRef.current || !profile) return;

    const timer = setTimeout(async () => {
      // Check if values actually changed to avoid unnecessary saves on initial load
      if (
        formData.full_name === (profile.full_name || '') &&
        formData.company_name === (profile.company_name || '') &&
        formData.company_logo_url === (profile.company_logo_url || '')
      ) {
        return;
      }

      setIsSaving(true);
      try {
        await apiService.updateProfile(formData);
        await refreshProfile();
        setLastSaved(new Date());
      } catch (error: any) {
        console.error('Auto-save error:', error);
        notifyError('Speichern fehlgeschlagen', 'Änderungen konnten nicht automatisch gespeichert werden.');
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [formData, profile, refreshProfile, notifyError]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLogoLoading(true);
      const { signed_url, path } = await apiService.getSignedUploadUrl(
        'company-logos',
        file.name
      ) as any;

      const uploadResponse = await fetch(signed_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) throw new Error('Upload fehlgeschlagen');

      const { data } = supabase.storage.from('company-logos').getPublicUrl(path);

      // Update form data to trigger auto-save
      setFormData(prev => ({ ...prev, company_logo_url: data.publicUrl }));
      success('Logo hochgeladen', 'Ihre Marken-Identität wurde aktualisiert.');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      notifyError('Upload fehlgeschlagen', error.message);
    } finally {
      setLogoLoading(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-8 max-w-4xl mx-auto pb-32">
      {/* Header with Auto-Save Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            Einstellungen
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
            Personalisieren Sie Ihren Arbeitsbereich
          </p>
        </div>

        {/* Auto-save Indicator */}
        <div className="flex items-center gap-2 h-8 px-4 bg-white/50 rounded-full border border-slate-100">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speichert...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Gespeichert {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Bereit</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">

        {/* Profile Identity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="w-24 h-24" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full border-4 border-slate-50 shadow-sm overflow-hidden flex items-center justify-center bg-blue-50 text-blue-600">
                {profile?.auth_metadata?.avatar_url || profile?.auth_metadata?.picture ? (
                  <img
                    src={profile?.auth_metadata?.avatar_url || profile?.auth_metadata?.picture}
                    alt="Google Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-lg">{profile?.full_name || 'Benutzer'}</h2>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <p className="text-xs font-medium">Google Account verbunden</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name - Editable */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Anzeigename</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                  placeholder="Ihr Name"
                />
              </div>

              {/* Email - Read Only */}
              <div className="space-y-2 opacity-75">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>Google Konto E-Mail</span>
                  <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">GESCHÜTZT</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile?.email || ''}
                    readOnly
                    className="w-full bg-slate-100 border-0 rounded-2xl pl-10 pr-4 py-3 font-bold text-slate-500 cursor-not-allowed select-none"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[9px] font-black text-green-600 uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Gesichert</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold ml-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Wird vom Google-Login verwaltet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company & Branding */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building className="w-24 h-24" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Firma & Branding</h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Erscheint auf Ihren Berichten</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Firmenname</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                placeholder="Firmenname eingeben"
              />
            </div>

            <div className="pt-4 border-t border-slate-50">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-3">Firmenlogo (für PDF Berichte)</label>

              <div className="flex items-center gap-6">
                {formData.company_logo_url ? (
                  <div className="flex items-center gap-4 bg-slate-50 p-2 pr-6 rounded-2xl border border-slate-100">
                    <div className="h-16 w-16 bg-white rounded-xl p-2 flex items-center justify-center border border-slate-100 shadow-sm">
                      <img src={formData.company_logo_url} className="max-h-full max-w-full object-contain" alt="Logo" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-700">Logo aktiv</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => (document.getElementById('logo-upload') as HTMLInputElement).click()}
                          loading={logoLoading}
                          className="h-7 text-[10px] px-2"
                        >
                          Ändern
                        </Button>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, company_logo_url: '' }))}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider px-2"
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => (document.getElementById('logo-upload') as HTMLInputElement).click()}
                    className="h-16 w-16 bg-slate-50 hover:bg-slate-100 text-slate-300 hover:text-blue-400 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-200 flex items-center justify-center cursor-pointer transition-all"
                  >
                    {logoLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Plus className="w-6 h-6" />}
                  </div>
                )}

                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Compliance */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-24 h-24" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Rechtliches</h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pflichtangaben & Datenschutz</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="#" className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-700 transition-colors group/link">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover/link:text-blue-500">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Impressum</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-700 transition-colors group/link">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover/link:text-blue-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Datenschutz</span>
              </a>
            </div>

            <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-1">
              Diese Anwendung wird von <strong>OnSite Forms</strong> bereitgestellt. Bei Fragen zum Datenschutz wenden Sie sich bitte an Ihren Administrator.
            </p>
          </div>
        </div>

        {/* Connection Info */}
        <div className="flex items-center justify-center gap-2 pt-8 opacity-50">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Verbunden via Google OAuth
          </span>
        </div>
      </div>
    </div>
  );
}
