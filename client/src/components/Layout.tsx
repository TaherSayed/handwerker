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
import SyncStatus from './SyncStatus';

export default function Layout() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen] = useState(window.innerWidth > 1024);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Übersicht' },
    { to: '/templates', icon: FileText, label: 'Vorlagen' },
    { to: '/submissions', icon: ClipboardList, label: 'Verlauf' },
    { to: '/settings', icon: Settings, label: 'Einstellungen' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar (Desktop Only) */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen bg-white/50 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        {/* Sidebar Logo */}
        <div className="h-16 flex items-center px-5 mb-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-slate-900 tracking-tight text-sm">OnSite</span>
            )}
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                  ? 'text-slate-900 bg-slate-100/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Subtle Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-slate-900 rounded-r-full opacity-100" />
                  )}

                  <item.icon className={`w-4 h-4 shrink-0 transition-all ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />

                  {sidebarOpen && (
                    <span className={`text-sm truncate transition-colors ${isActive ? 'font-medium' : 'font-normal'}`}>
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 mt-auto">
          <div className={`rounded-xl border border-slate-100 bg-white/50 p-1 ${!sidebarOpen && 'flex justify-center'}`}>
            {sidebarOpen ? (
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                    {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{profile?.full_name || 'Benutzer'}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                  title="Abmelden"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                title="Abmelden"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0">
        {/* Top Header */}
        <header
          className={`sticky top-0 z-20 flex items-center justify-between px-6 h-16 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent'
            }`}
        >
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">OnSite</span>
          </div>

          <div className="hidden lg:block">
            {/* Desktop breadcrumb or dynamic title */}
            <h2 className="font-bold text-slate-900 capitalize px-2">
              {location.pathname === '/dashboard' ? 'Übersicht' :
                location.pathname === '/templates' ? 'Vorlagen' :
                  location.pathname === '/submissions' ? 'Verlauf' :
                    location.pathname === '/settings' ? 'Einstellungen' : 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">

            <button className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="lg:hidden w-10 h-10 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-2 flex items-center justify-between z-40 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => {
                if (isActive) return;
                navigate(item.to);
              }}
              className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all duration-200 ${isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px] scale-105' : 'stroke-[1.5px]'}`} />
              <span className="text-[10px] font-medium leading-none">
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
