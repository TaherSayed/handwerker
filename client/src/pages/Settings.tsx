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
        {/* Profile Card */}
        <div className="lg:col-span-8 space-y-10">
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
