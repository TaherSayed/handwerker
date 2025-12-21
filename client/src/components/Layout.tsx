import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Navigation Header */}
      <header className="bg-white border-b sticky top-0 z-50" style={{ borderColor: '#E2E8F0', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#2563EB', color: 'white' }}>
                  OS
                </div>
                <span className="text-xl font-bold" style={{ color: '#0F172A' }}>OnSite</span>
              </Link>

              {/* Navigation Links */}
              {user && (
                <nav className="hidden md:flex items-center gap-1">
                  <Link
                    to="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/dashboard')
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive('/dashboard') ? { backgroundColor: '#2563EB' } : {}}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/contacts-management"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/contacts-management')
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive('/contacts-management') ? { backgroundColor: '#2563EB' } : {}}
                  >
                    Kontakte
                  </Link>
                  <Link
                    to="/form-builder"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/form-builder')
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive('/form-builder') ? { backgroundColor: '#2563EB' } : {}}
                  >
                    Formulare
                  </Link>
                </nav>
              )}
            </div>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: '#2563EB' }}>
                    {userInitials}
                  </div>
                  <span className="hidden md:block text-sm font-medium" style={{ color: '#0F172A' }}>
                    {userName}
                  </span>
                  <svg className="w-4 h-4" style={{ color: '#475569' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border z-20" style={{ borderColor: '#E2E8F0' }}>
                      <div className="py-2">
                        <div className="px-4 py-3 border-b" style={{ borderColor: '#E2E8F0' }}>
                          <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{userName}</p>
                          <p className="text-xs mt-1" style={{ color: '#475569' }}>{user?.email}</p>
                        </div>
                        <Link
                          to="/user-profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition"
                          style={{ color: '#0F172A' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profil
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition text-left"
                          style={{ color: '#DC2626' }}
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

