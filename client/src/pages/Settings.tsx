import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api.service';
import { supabase } from '../services/supabase';
import { Save, Upload } from 'lucide-react';

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

      // Get signed upload URL
      const { signed_url, path } = await apiService.getSignedUploadUrl(
        'company-logos',
        file.name
      ) as any;

      // Upload file
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

      // Get public URL
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
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and company information</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">Settings saved successfully!</p>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your full name"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your company name"
            />
          </div>

          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
            {formData.company_logo_url && (
              <div className="mb-4">
                <img
                  src={formData.company_logo_url}
                  alt="Company Logo"
                  className="h-24 w-auto object-contain border rounded p-2"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                {loading ? 'Uploading...' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              {formData.company_logo_url && (
                <button
                  onClick={() => setFormData({ ...formData, company_logo_url: '' })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

