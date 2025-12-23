import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { ClipboardList, FileText, Download, Calendar, ChevronRight, Zap, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';
import { useNotificationStore } from '../store/notificationStore';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted'>('all');
  const [error, setError] = useState<string | null>(null);
  const { success, error: notifyError } = useNotificationStore();

  useEffect(() => {
    loadSubmissions();
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
    } catch (error: any) {
      console.error('Load submissions error:', error);
      setError(error.message || 'Laden des Verlaufs fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      success('PDF Erstellung', 'Ihr Dokument wird generiert...');
      const result = await apiService.generatePDF(id) as any;
      window.open(result.pdf_url, '_blank');
      loadSubmissions();
    } catch (error: any) {
      console.error('Generate PDF error:', error);
      notifyError('Fehler', 'PDF konnte nicht erstellt werden. ' + (error.message || ''));
    }
  };

  const getStatusDisplay = (sub: any) => {
    const isSynced = !sub.id.toString().startsWith('draft_') && !sub.is_offline;

    if (sub.status === 'draft') {
      return {
        label: 'Entwurf',
        color: 'bg-amber-100 text-amber-700',
        icon: Clock,
        iconBg: 'bg-amber-50 text-amber-600'
      };
    }

    if (isSynced) {
      return {
        label: 'Synchronisiert',
        color: 'bg-indigo-100 text-indigo-700',
        icon: CheckCircle2,
        iconBg: 'bg-indigo-50 text-indigo-600'
      };
    }

    return {
      label: 'Eingereicht',
      color: 'bg-green-100 text-green-700',
      icon: Zap,
      iconBg: 'bg-green-50 text-green-600'
    };
  };

  return (
    <div className="animate-slide-up space-y-12 pb-32 lg:pb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 uppercase tracking-tighter leading-none">
            Verlauf
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] ml-1">
            Einsatzberichte & Kundendokumentationen
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
        {[
          { id: 'all', label: 'Alle' },
          { id: 'draft', label: 'Entwürfe' },
          { id: 'submitted', label: 'Eingereicht' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f.id
              ? 'bg-white text-indigo-600 shadow-xl shadow-slate-200'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-[2rem] p-6 shadow-xl shadow-red-500/5 flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black">!</div>
            <p className="text-red-800 font-bold tracking-tight text-sm">{error}</p>
          </div>
          <button onClick={loadSubmissions} className="text-red-600 font-black text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-red-100 rounded-xl transition-colors">Wiederholen</button>
        </div>
      )}

      {/* Submissions Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-64 bg-slate-50 border-none animate-pulse" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-16 md:p-32 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center text-center shadow-2xl shadow-slate-200/50">
          <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-10 transform rotate-3">
            <ClipboardList className="w-14 h-14" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Keine Ergebnisse</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 text-lg">
            Passen Sie Ihre Filter an oder schließen Sie einen Einsatz ab, um ihn hier zu sehen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              onClick={() => navigate(`/submissions/${sub.id}`)}
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${getStatusDisplay(sub).iconBg}`}>
                  {React.createElement(getStatusDisplay(sub).icon, { className: 'w-8 h-8' })}
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusDisplay(sub).color}`}>
                  {getStatusDisplay(sub).label}
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md">
                      {format(new Date(sub.created_at), 'HH:mm')} Uhr
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate mb-1 uppercase tracking-tight leading-none">
                    {sub.customer_name || 'Anonymer Einsatz'}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] opacity-60">
                    <FileText className="w-3.5 h-3.5" />
                    {sub.form_templates?.name || 'Formular'}
                  </div>
                </div>

                <div className="space-y-3">
                  {sub.customer_email && (
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-tighter">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      {sub.customer_email}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-tighter">
                    <Calendar className="w-3.5 h-3.5 opacity-30" />
                    {format(new Date(sub.created_at), 'do MMMM yyyy', { locale: de })}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                {sub.pdf_url ? (
                  <a
                    href={sub.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 text-indigo-900 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest group/btn transition-colors"
                  >
                    <Download className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                    PDF Archiv
                  </a>
                ) : (
                  <Button
                    onClick={(e) => handleGeneratePDF(sub.id, e)}
                    variant="secondary"
                    size="sm"
                    className="py-2.5 px-4"
                    icon={<RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />}
                  >
                    Bericht Finalisieren
                  </Button>
                )}
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
