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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-600 mt-1">View and manage form submissions</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'draft'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Drafts
        </button>
        <button
          onClick={() => setFilter('submitted')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'submitted'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Submitted
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadSubmissions}
              className="text-red-600 hover:text-red-800 font-medium"
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
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">Submissions from the mobile app will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/submissions/${submission.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.customer_name || 'Unnamed'}
                    </div>
                    {submission.customer_email && (
                      <div className="text-sm text-gray-500">{submission.customer_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {submission.form_templates?.name || 'Unknown Template'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        submission.status === 'submitted'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(submission.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {submission.pdf_url ? (
                        <a
                          href={submission.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGeneratePDF(submission.id);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Generate PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

