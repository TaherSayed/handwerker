import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { Search, Filter, CheckCircle2, FileText, User, Plus } from 'lucide-react';
import Skeleton from '../components/common/Skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    sync: 0,
    drafts: 0
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
    
    // Only refetch if tab becomes visible AND data is stale (older than 5 minutes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastFetch = sessionStorage.getItem('dashboard_last_fetch');
        const now = Date.now();
        // Only refetch if last fetch was more than 5 minutes ago
        if (!lastFetch || (now - parseInt(lastFetch)) > 300000) {
          loadDashboardData();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Show UI immediately with cached data if available
      const { offlineService } = await import('../services/offline.service');
      const cached = offlineService.getCachedSubmissions();
      if (cached.length > 0) {
        setStats({
          total: cached.length,
          sync: cached.filter((s: any) => s.status === 'submitted').length,
          drafts: cached.filter((s: any) => s.status === 'draft').length
        });
        setSubmissions(cached);
        setLoading(false); // Show cached data immediately
      }

      // Then fetch fresh data in background
      const subs = await apiService.getSubmissions();

      setStats({
        total: subs.length,
        sync: subs.filter((s: any) => s.status === 'submitted').length,
        drafts: subs.filter((s: any) => s.status === 'draft').length
      });

      setSubmissions(subs);
      
      // Store timestamp of last successful fetch
      sessionStorage.setItem('dashboard_last_fetch', Date.now().toString());
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Keep cached data if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesTab =
      activeTab === 'all' ? true :
        activeTab === 'draft' ? sub.status === 'draft' :
          sub.status === 'submitted';

    const matchesSearch =
      sub.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.form_templates?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return <div className="p-4 space-y-4">
      <Skeleton variant="rectangular" height="100px" className="rounded-xl" />
      <Skeleton variant="rectangular" height="50px" className="rounded-xl" />
      <Skeleton variant="text" />
      <Skeleton variant="rectangular" height="80px" className="rounded-xl" />
      <Skeleton variant="rectangular" height="80px" className="rounded-xl" />
    </div>
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">

      {/* Header with New Submission Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Übersicht Ihrer Einsatzberichte</p>
        </div>
        <Link
          to="/visits/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all active:scale-95 cursor-pointer no-underline"
        >
          <Plus className="w-5 h-5" />
          <span>Neuer Einsatz</span>
        </Link>
      </div>

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-primary-light text-white p-3 rounded-xl shadow-sm flex flex-col justify-between h-24">
          <span className="text-2xl font-bold">{stats.total}</span>
          <span className="text-xs font-medium opacity-90">Gesamt</span>
        </div>
        <div className="bg-primary-light text-white p-3 rounded-xl shadow-sm flex flex-col justify-between h-24">
          <span className="text-2xl font-bold">{stats.sync}</span>
          <span className="text-xs font-medium opacity-90">Sync</span>
        </div>
        <div className="bg-primary-light text-white p-3 rounded-xl shadow-sm flex flex-col justify-between h-24">
          <span className="text-2xl font-bold">{stats.drafts}</span>
          <span className="text-xs font-medium opacity-90">Entwürfe</span>
        </div>
      </div>

      {/* 2. Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Berichte durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none text-sm shadow-sm"
          />
        </div>
        <button className="w-12 h-12 flex items-center justify-center bg-primary-light text-white rounded-xl shadow-sm hover:bg-primary-dark transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Tabs */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex text-sm font-medium">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 rounded-lg transition-colors ${activeTab === 'all' ? 'bg-primary-light text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Alle
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`flex-1 py-2.5 rounded-lg transition-colors ${activeTab === 'draft' ? 'bg-primary-light text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Entwürfe
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`flex-1 py-2.5 rounded-lg transition-colors ${activeTab === 'submitted' ? 'bg-primary-light text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Eingereicht
        </button>
      </div>

      {/* 4. List Header */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
        EINSATZBERICHTE & DOKUMENTATIONEN
      </h3>

      {/* 5. List Items */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Keine Berichte gefunden.</div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              onClick={() => navigate(`/submissions/${sub.id}`)}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 active:scale-[0.99] transition-transform cursor-pointer"
            >
              {/* Avatar Icon */}
              <div className="w-10 h-10 rounded-lg bg-primary-light text-white flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 truncate pr-2">{sub.customer_name || 'Kunde'}</h4>
                  <span className="text-primary-light">
                    <code className="text-[10px]">&gt;</code>
                  </span>
                </div>

                <p className="text-slate-400 text-xs truncate">
                  {sub.user?.email || 'user@example.com'}
                </p>

                {/* Sync Badge */}
                {sub.status === 'submitted' && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-primary-light/30 bg-primary-light/5 text-primary-light text-[10px] font-medium mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Synchronisiert</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                  <FileText className="w-3 h-3 text-primary-light" />
                  <span className="text-xs font-bold text-slate-700 truncate">{sub.form_templates?.name || 'Formular'}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <span>📅 {new Date(sub.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span>⏰ {new Date(sub.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for New Submission (Mobile Only) */}
      <Link
        to="/visits/new"
        className="fixed right-4 bottom-20 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center active:scale-95 transition-transform z-30 lg:hidden no-underline"
      >
        <Plus className="w-6 h-6" />
      </Link>

    </div>
  );
}

