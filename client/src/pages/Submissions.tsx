import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { ClipboardList, Download, ChevronRight, Zap, Clock, CheckCircle2 } from 'lucide-react';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
    
    // Only refetch if tab becomes visible AND data is stale (older than 5 minutes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastFetch = sessionStorage.getItem(`submissions_last_fetch_${filter}`);
        const now = Date.now();
        // Only refetch if last fetch was more than 5 minutes ago
        if (!lastFetch || (now - parseInt(lastFetch)) > 300000) {
          loadSubmissions();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [filter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Zeitüberschreitung der Anfrage')), 10000)
      );

      const params = filter !== 'all' ? { status: filter } : {};
      const dataPromise = apiService.getSubmissions(params) as Promise<any[]>;

      const data = await Promise.race([dataPromise, timeoutPromise]) as any[];
      setSubmissions(data || []);
      
      // Store timestamp of last successful fetch
      sessionStorage.setItem(`submissions_last_fetch_${filter}`, Date.now().toString());
    } catch (error: any) {
      console.error('Load submissions error:', error);
      setError(error.message || 'Laden des Verlaufs fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (sub: any) => {
    // const isSynced = !sub.id.toString().startsWith('draft_') && !sub.is_offline;

    if (sub.is_offline || sub._is_cached) {
      return {
        label: 'Offline gespeichert',
        color: 'bg-slate-100 text-slate-500 border border-slate-200',
        icon: Zap, // Or WifiOff
        iconBg: 'bg-slate-50 text-slate-400'
      };
    }

    if (sub.status === 'draft') {
      return {
        label: 'Entwurf',
        color: 'bg-amber-100 text-amber-700',
        icon: Clock,
        iconBg: 'bg-amber-50 text-amber-600'
      };
    }

    // Default to Synced/Submitted
    return {
      label: 'Synchronisiert',
      color: 'bg-emerald-100 text-emerald-700',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600'
    };
  };

  return (
    <div className="animate-slide-up pb-32 lg:pb-8">
      {/* Header Area */}
      <div className="mb-8">
        <div className="mb-1">
          <h1 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white tracking-normal leading-tight">
            Verlauf
          </h1>
        </div>
        <div className="mb-8 mt-2">
          <p className="text-sm text-slate-500 dark:text-dark-text-muted font-normal">
            Einsatzberichte & Kundendokumentationen
          </p>
        </div>

        {/* Filter Tabs - Connected to content */}
        <div className="flex p-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-stroke rounded-xl shadow-sm">
          {[
            { id: 'all', label: 'Alle' },
            { id: 'draft', label: 'Entwürfe' },
            { id: 'submitted', label: 'Eingereicht' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-dark-text-muted hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-error-dark/10 border-l-4 border-red-500 rounded-xl p-4 shadow-sm flex items-center justify-between animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-error-dark/20 text-red-600 dark:text-error-light rounded-full flex items-center justify-center font-medium">!</div>
              <p className="text-red-800 dark:text-error-light font-medium text-sm">{error}</p>
            </div>
            <button onClick={loadSubmissions} className="text-red-600 dark:text-error-light font-medium text-xs px-3 py-1.5 hover:bg-red-100 dark:hover:bg-error-dark/20 rounded-lg transition-colors">Wiederholen</button>
          </div>
        )}

        {/* Submissions Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-50 dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-stroke animate-pulse" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 md:p-20 bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-stroke flex flex-col items-center text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-dark-highlight rounded-2xl flex items-center justify-center text-slate-300 dark:text-dark-text-muted mb-6">
              <ClipboardList className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">Keine Ergebnisse</h3>
            <p className="text-slate-500 dark:text-dark-text-muted font-normal max-w-sm mx-auto text-sm">
              Passen Sie Ihre Filter an oder schließen Sie einen Einsatz ab, um ihn hier zu sehen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => navigate(`/submissions/${sub.id}`)}
                className="group relative bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-dark-stroke hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                {/* Top Section: Icon, Info, Bookmark */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Icon Box */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getStatusDisplay(sub).iconBg}`}>
                    {React.createElement(getStatusDisplay(sub).icon, { className: 'w-6 h-6' })}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-base font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {sub.customer_name || 'Anonymer Einsatz'}
                    </h3>
                    <p className="text-xs font-normal text-slate-500 dark:text-dark-text-muted truncate mt-1">
                      {sub.customer_email || 'Keine E-Mail angegeben'}
                    </p>
                  </div>

                  {/* Action / Bookmark */}
                  <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-dark-highlight text-slate-400 dark:text-dark-text-muted flex items-center justify-center shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sub.pdf_url ? <Download className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wide ${getStatusDisplay(sub).color}`}>
                    {getStatusDisplay(sub).label}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-50 dark:bg-dark-highlight text-slate-600 dark:text-dark-text-muted rounded-lg text-[10px] font-medium uppercase tracking-wide">
                    {sub.form_templates?.name || 'Formular'}
                  </span>
                  {sub.is_offline && (
                    <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-medium uppercase tracking-wide">
                      Offline
                    </span>
                  )}
                </div>

                {/* Bottom Info: Date & Time */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-dark-stroke">
                  <div className="flex items-center gap-2 text-xs font-normal text-slate-500 dark:text-dark-text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{format(new Date(sub.created_at), 'd. MMM yyyy', { locale: de })}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-700 dark:text-dark-text-body">
                    {format(new Date(sub.created_at), 'HH:mm')} Uhr
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
