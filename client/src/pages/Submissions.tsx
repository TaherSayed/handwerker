import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { ClipboardList, FileText, Download, Calendar, User, ChevronRight, Zap, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const params = filter !== 'all' ? { status: filter } : {};
      const dataPromise = apiService.getSubmissions(params) as Promise<any[]>;

      const data = await Promise.race([dataPromise, timeoutPromise]) as any[];
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Load submissions error:', error);
      setError(error.message || 'Failed to load submissions. Please try again.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await apiService.generatePDF(id) as any;
      window.open(result.pdf_url, '_blank');
      loadSubmissions();
    } catch (error) {
      console.error('Generate PDF error:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="animate-slide-up space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Submissions</h1>
          <p className="text-slate-500 font-medium">History of your successfully completed work.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
        {['all', 'draft', 'submitted'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${filter === f
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <p className="text-red-800 font-bold text-sm">{error}</p>
          <button onClick={loadSubmissions} className="text-red-600 font-black text-xs uppercase tracking-widest px-3 py-1 hover:bg-red-100 rounded-lg text-sm">Retry</button>
        </div>
      )}

      {/* Submissions Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-bold text-sm">Fetching history...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-12 md:p-20 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-8">
            <ClipboardList className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">No results found</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">
            Try adjusting your filters or complete a form to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              onClick={() => navigate(`/submissions/${sub.id}`)}
              className="group bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${sub.status === 'submitted' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                  {sub.status === 'submitted' ? <Zap className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sub.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {sub.status}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate mb-1">
                    {sub.customer_name || 'Anonymous'}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    {sub.form_templates?.name || 'Form'}
                  </div>
                </div>

                <div className="space-y-2">
                  {sub.customer_email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <User className="w-3.5 h-3.5 opacity-50" />
                      {sub.customer_email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                    {format(new Date(sub.created_at), 'MMMM do, yyyy')}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                {sub.pdf_url ? (
                  <a
                    href={sub.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-widest"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                ) : (
                  <button
                    onClick={(e) => handleGeneratePDF(sub.id, e)}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate PDF
                  </button>
                )}
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
