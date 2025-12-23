import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';
import { supabase } from '../services/supabase';
import { Save, Upload, User, Building, Mail, Trash2, ShieldCheck, Sparkles, Plus } from 'lucide-react';

export default function Settings() {
  const { profile, refreshProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    company_logo_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        company_logo_url: profile.company_logo_url || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await apiService.updateProfile(formData);
      await refreshProfile();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Save settings error:', error);
      setError(error.message || 'Speichern der Einstellungen fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      const { signed_url, path } = await apiService.getSignedUploadUrl(
        'company-logos',
        file.name
      ) as any;

      const uploadResponse = await fetch(signed_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const { data } = supabase.storage.from('company-logos').getPublicUrl(path);
      setFormData({ ...formData, company_logo_url: data.publicUrl });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      setError(error.message || 'Logo-Upload fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-12 pb-32 lg:pb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 uppercase tracking-tighter leading-none">
            Einstellungen
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] ml-1">
            Personalisieren Sie Ihren Arbeitsbereich und Ihre Identität
          </p>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-[2rem] p-6 shadow-xl shadow-green-500/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black">✓</div>
            <p className="text-green-800 font-bold tracking-tight text-sm">Profil erfolgreich aktualisiert!</p>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-[2rem] p-6 shadow-xl shadow-red-500/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black">!</div>
            <p className="text-red-800 font-bold tracking-tight text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Profile Section */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10">
            <div className="flex items-center gap-4 px-2">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Profilinformationen</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5 opacity-60">Persönliche Identifikation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vollständiger Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input px-6 py-4 font-bold placeholder:text-slate-200"
                  placeholder="Ihr vollständiger Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System-E-Mail (Google)</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="input pl-14 pr-12 bg-slate-50 text-slate-400 cursor-not-allowed border-dashed font-bold"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Google Account Section */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10">
            <div className="flex items-center gap-4 px-2">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <h2 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Google Konto & Synchronisierung</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5 opacity-60">Status Ihrer Cloud-Verbindung</p>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 flex flex-col sm:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg border border-slate-100 items-center justify-center flex overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h4 className="text-xl font-black text-slate-900 leading-none">{profile?.full_name || 'Benutzer'}</h4>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{profile?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full border border-green-100 shadow-sm">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verbunden</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Kontakte synchronisiert</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => window.open('https://myaccount.google.com/', '_blank')}
                  className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-800 transition-colors"
                >
                  Google Konto verwalten
                </button>
              </div>
            </div>
          </div>

          {/* Organisation Section */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10">
            <div className="flex items-center gap-4 px-2">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Organisation</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5 opacity-60">Unternehmens- & Branding-Details</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-2 max-w-xl">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Firmenname</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="input px-6 py-4 font-bold placeholder:text-slate-200"
                  placeholder="Firmenname eintragen..."
                />
                <p className="text-[10px] text-slate-400 font-bold ml-1 flex items-center gap-2 opacity-60 uppercase tracking-tighter">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Erscheint auf allen PDF-Berichten und generierten Dokumenten
                </p>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Markenbild / Logo</label>
                <div className="flex flex-col sm:flex-row items-center gap-10 p-10 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 transition-all hover:bg-white hover:border-indigo-300 group">
                  {formData.company_logo_url ? (
                    <div className="relative group/logo shrink-0">
                      <img
                        src={formData.company_logo_url}
                        alt="Unternehmenslogo"
                        className="h-32 w-32 object-contain rounded-2xl bg-white p-4 shadow-xl border border-slate-100"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, company_logo_url: '' })}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 shadow-inner group-hover:bg-indigo-50 transition-colors">
                      <Upload className="w-10 h-10 group-hover:scale-110 transition-transform duration-500 group-hover:text-indigo-400" />
                    </div>
                  )}

                  <div className="flex-1 space-y-5 text-center sm:text-left">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xl font-black text-slate-900 leading-none">Globale Marken-Assets</h4>
                      <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-sm uppercase tracking-tighter opacity-70">Werten Sie Ihre Berichte mit einer klaren Markenidentität auf. SVGs oder hochauflösende PNGs empfohlen.</p>
                    </div>
                    <label className="flex items-center justify-center sm:justify-start gap-4 cursor-pointer group/upload">
                      <div className="bg-indigo-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center gap-3">
                        <Plus className="w-4 h-4" />
                        {loading ? 'Identität wird verarbeitet...' : formData.company_logo_url ? 'Identität ersetzen' : 'Asset hochladen'}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-slate-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem]" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
                  <Save className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">Änderungen sichern</h3>
                <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tighter opacity-80">Schließen Sie Ihre Arbeitsbereich-Konfiguration ab, indem Sie Ihre Profil-Updates bestätigen.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-white text-indigo-950 px-8 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 border-none"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span>Wird angewendet...</span>
                  </div>
                ) : 'Konfiguration speichern'}
              </button>
            </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Identitäts-Sync</h4>
              <div className="flex items-center gap-2 text-green-600 font-black text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Verifiziert & Aktiv
              </div>
            </div>
            <ShieldCheck className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
