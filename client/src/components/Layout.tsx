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

export default function Layout() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen] = useState(window.innerWidth > 1024);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.label}
                </div>
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
              <button
                onClick={handleSignOut}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-white rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online
            </div>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex items-center justify-between z-40 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link-mobile relative ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
        {/* Floating Action Button Concept */}
        <button
          onClick={() => navigate('/templates/new')}
          className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-300 border-4 border-slate-50 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-7 h-7" />
        </button>
      </nav>

      <SyncStatus />
    </div>
  );
}
