import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  LayoutDashboard,

  Bell,
  User as UserIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import SyncStatus from './SyncStatus';

export default function Layout() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen] = useState(window.innerWidth > 1024);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Übersicht' },
    { to: '/templates', icon: FileText, label: 'Vorlagen' },
    { to: '/submissions', icon: ClipboardList, label: 'Verlauf' },
    { to: '/settings', icon: Settings, label: 'Optionen' },
  ];

  return (
    <div className="flex min-h-screen font-sans text-slate-900">
      {/* Sidebar (Desktop Only) - Solid Professional Look */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen bg-white border-r border-slate-200 z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        {/* Sidebar Logo */}
        <div className="h-16 flex items-center px-5 mb-2 border-b border-slate-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-blue-700/50">
              <FileText className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col leading-none">
                <span className="font-bold text-slate-900 tracking-tight text-base">OnSite</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Professional</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative font-medium ${isActive
                  ? 'text-blue-700 bg-blue-50 border border-blue-100 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {sidebarOpen && (
                    <span className="text-sm truncate">
                      {item.label}
                    </span>
                  )}
                  {isActive && sidebarOpen && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 mt-auto bg-slate-50/50 border-t border-slate-100">
          <div className={`rounded-xl border border-slate-200 bg-white p-1 shadow-sm ${!sidebarOpen && 'flex justify-center'}`}>
            {sidebarOpen ? (
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 border border-slate-200 overflow-hidden">
                    {profile?.auth_metadata?.avatar_url ? (
                      <img src={profile.auth_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name || 'Benutzer'}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                  title="Abmelden"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg"
                title="Abmelden"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 relative">
        {/* Top Header */}
        <header
          className={`sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 h-16 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm' : 'bg-transparent'
            }`}
        >
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">OnSite</span>
          </div>

          <div className="hidden lg:block">
            {/* Desktop Page Title */}
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {location.pathname === '/dashboard' ? 'Übersicht' :
                location.pathname === '/templates' ? 'Formularvorlagen' :
                  location.pathname === '/submissions' ? 'Einsatzverlauf' :
                    location.pathname === '/settings' ? 'Einstellungen' : 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Online</span>
            </div>

            <button
              onClick={() => useNotificationStore.getState().info('Mitteilungen', 'Keine neuen Benachrichtigungen')}
              className="relative p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="lg:hidden w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 shadow-sm active:scale-95 transition-all overflow-hidden"
            >
              {profile?.auth_metadata?.avatar_url ? (
                <img src={profile.auth_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation - Solid & Robust */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 flex items-center justify-around z-40 pb-safe shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => {
                if (isActive) return;
                navigate(item.to);
              }}
              className={`flex flex-col items-center justify-center gap-1 w-full py-2.5 transition-all duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`relative ${isActive ? '-translate-y-0.5' : ''} transition-transform duration-200`}>
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-blue-100' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600"></span>}
              </div>
              <span className={`text-[10px] font-bold leading-none mt-1 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <SyncStatus />
    </div >
  );
}
