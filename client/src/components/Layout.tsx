import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/google-sign-in');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const userName = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Benutzer';

  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Simple Header - Logo and User Only */}
      <header className="bg-white border-b sticky top-0 z-50" style={{ borderColor: '#D1D1D6' }}>
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-xl font-semibold" style={{ color: '#1D1D1F' }}>OnSite</span>
            </div>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  style={{ backgroundColor: '#007AFF' }}
                >
                  {userInitials}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl shadow-xl bg-white border z-20" style={{ borderColor: '#E5E5EA' }}>
                      <div className="py-2">
                        <div className="px-4 py-3 border-b" style={{ borderColor: '#E5E5EA' }}>
                          <p className="text-base font-semibold" style={{ color: '#1D1D1F' }}>{userName}</p>
                          <p className="text-sm mt-1" style={{ color: '#86868B' }}>{user?.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-base hover:bg-gray-50 transition text-left"
                          style={{ color: '#FF3B30' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Abmelden
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
