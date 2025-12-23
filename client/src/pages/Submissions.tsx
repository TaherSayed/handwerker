import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { ClipboardList, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted'>('all');

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
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

  const handleGeneratePDF = async (id: string) => {
    try {
      const result = await apiService.generatePDF(id) as any;
      alert('PDF generated successfully!');
      window.open(result.pdf_url, '_blank');
      loadSubmissions();
    } catch (error) {
      console.error('Generate PDF error:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Submissions</h1>
        <p className="text-gray-600 text-lg">View and manage your form submissions</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            filter === 'draft'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          Drafts
        </button>
        <button
          onClick={() => setFilter('submitted')}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            filter === 'submitted'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
          }`}
        >
          Submitted
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={loadSubmissions}
              className="text-red-600 hover:text-red-800 font-semibold text-sm px-4 py-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Submissions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {filter === 'draft' 
              ? 'You don\'t have any draft submissions yet'
              : filter === 'submitted'
              ? 'You don\'t have any submitted forms yet'
              : 'Submissions from the mobile app will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="card p-6 hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
              onClick={() => navigate(`/submissions/${submission.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                    {submission.customer_name || 'Unnamed Customer'}
                  </h3>
                  {submission.customer_email && (
                    <p className="text-sm text-gray-500 truncate">{submission.customer_email}</p>
                  )}
                </div>
                <span className={`badge flex-shrink-0 ml-2 ${
                  submission.status === 'submitted'
                    ? 'bg-green-100 text-green-700'
                    : submission.status === 'draft'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {submission.status}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="truncate">{submission.form_templates?.name || 'Unknown Template'}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {format(new Date(submission.created_at), 'MMM d, yyyy')}
                </span>
                {submission.pdf_url ? (
                  <a
                    href={submission.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </a>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeneratePDF(submission.id);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Generate PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

