import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  Bell,
  User as UserIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import SyncStatus from './SyncStatus';
import Button from './common/Button';

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
        className={`hidden lg:flex flex-col sticky top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-30 ${sidebarOpen ? 'w-72' : 'w-24'
          }`}
      >
        {/* Sidebar Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="animate-slide-up">
                <h1 className="font-bold text-lg leading-tight">OnSite</h1>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Formulare</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                  )}
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 ${!sidebarOpen && 'flex justify-center'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{profile?.full_name || 'Benutzer'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                onClick={handleSignOut}
                variant="danger"
                size="sm"
                className="w-full mt-4 rounded-xl py-3"
                icon={<LogOut className="w-4 h-4" />}
              >
                Abmelden
              </Button>
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
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
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
              className="lg:hidden w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around z-40 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => {
                if (isActive) return; // Prevent double taps/redundant navigation
                navigate(item.to);
              }}
              className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[72px] ${isActive
                ? 'text-indigo-900 bg-indigo-50 shadow-inner'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        {/* Floating Action Button */}
        <button
          onClick={() => navigate('/templates/new')}
          className="w-14 h-14 bg-indigo-900 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-200 border-4 border-white active:scale-90 transition-transform -translate-y-4"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      </nav>

      <SyncStatus />
    </div >
  );
}
