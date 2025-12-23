import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';
import { supabase } from '../services/supabase';
import { Save, Upload, User, Building, Mail, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

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
      setError(error.message || 'Failed to save settings. Please try again.');
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
        throw new Error('Upload failed');
      }

      const { data } = supabase.storage.from('company-logos').getPublicUrl(path);
      setFormData({ ...formData, company_logo_url: data.publicUrl });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      setError(error.message || 'Failed to upload logo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 font-medium">Customize your workspace and identity.</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <p className="text-green-800 font-bold text-sm">Profile updated successfully!</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <p className="text-red-800 font-bold text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-6 bg-white border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h2 className="font-black text-slate-900 uppercase text-xs tracking-widest">Personal Info</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Managed by Google)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="input pl-12 bg-slate-50 text-slate-400 cursor-not-allowed border-dashed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card space-y-6 bg-white border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h2 className="font-black text-slate-900 uppercase text-xs tracking-widest">Company Branding</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="input"
                  placeholder="Acme Construction Co."
                />
                <p className="text-[10px] text-slate-400 font-bold ml-1">This will be printed on all your PDF reports.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Logo</label>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 transition-all hover:bg-white hover:border-violet-300">
                  {formData.company_logo_url ? (
                    <div className="relative group shrink-0">
                      <img
                        src={formData.company_logo_url}
                        alt="Company Logo"
                        className="h-24 w-24 object-contain rounded-2xl bg-white p-2 shadow-md border border-slate-100"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, company_logo_url: '' })}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-inner">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-black text-slate-700">Logo Visibility</p>
                      <p className="text-xs text-slate-500 font-medium">Showcase your brand on every report. SVGs work best.</p>
                    </div>
                    <label className="btn-secondary py-2.5 px-6 text-xs h-auto cursor-pointer inline-flex w-fit">
                      <Upload className="w-4 h-4" />
                      {loading ? 'Processing...' : formData.company_logo_url ? 'Change Logo' : 'Upload Image'}
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
        <div className="space-y-6">
          <div className="card bg-indigo-900 border-none text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-20 h-20 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-lg font-black uppercase text-[10px] tracking-widest text-indigo-300 mb-1">Actions</h3>
                <p className="text-sm font-medium text-indigo-100">Make sure to save your changes regularly to keep your workspace updated.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full btn-primary bg-white text-indigo-900 hover:bg-slate-100 hover:text-indigo-950 shadow-none border-none py-4 rounded-2xl active:scale-95 transition-all disabled:bg-slate-300 disabled:text-slate-500"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-100/50 rounded-3xl border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sync Status</h4>
            <div className="flex items-center gap-2 text-green-600 font-black text-xs">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              All changes synced
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
