import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  Clock,
  Filter,
  Download
} from 'lucide-react';
import api from '../services/api';
import { fixEncoding } from '../utils/encoding';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    result: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.result) params.append('result', filters.result);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await api.get(`/api/access/logs?${params}`);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      toast.error('Error fetching access logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      result: '',
      dateFrom: '',
      dateTo: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportLogs = () => {
    // Create CSV content with proper UTF-8 encoding
    const csvRows = [
      ['Timestamp', 'Member Name', 'Email', 'Scanned By', 'Result'],
      ...logs.map(log => [
        new Date(log.scan_time).toLocaleString(),
        log.member ? `${fixEncoding(log.member.first_name)} ${fixEncoding(log.member.last_name)}` : 'Unknown',
        log.member?.email || 'N/A',
        log.staff ? `${fixEncoding(log.staff.first_name)} ${fixEncoding(log.staff.last_name)}` : 'System',
        log.result
      ])
    ];

    // Convert to CSV format with proper escaping
    const csvContent = csvRows.map(row => 
      row.map(field => {
        // Escape fields that contain commas, quotes, or newlines
        if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    ).join('\n');

    // Add UTF-8 BOM for proper encoding in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create blob with UTF-8 encoding
    const blob = new Blob([csvWithBOM], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV file downloaded successfully!');
  };

  const getStats = () => {
    const total = logs.length;
    const granted = logs.filter(log => log.result === 'GRANTED').length;
    const denied = logs.filter(log => log.result === 'DENIED').length;
    const successRate = total > 0 ? ((granted / total) * 100).toFixed(1) : 0;

    return { total, granted, denied, successRate };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Access Logs</h1>
          <p className="mt-1 text-sm text-gray-200">
            View and analyze gym access attempts
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="btn-secondary flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-200">Total Scans</p>
              <p className="text-2xl font-semibold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-success-100">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-200">Access Granted</p>
              <p className="text-2xl font-semibold text-white">{stats.granted}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-danger-100">
              <XCircle className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-200">Access Denied</p>
              <p className="text-2xl font-semibold text-white">{stats.denied}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-200">Success Rate</p>
              <p className="text-2xl font-semibold text-white">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Filters</h2>
          <Filter className="h-5 w-5 text-gray-300" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
            <select
              className="input-field"
              value={filters.result}
              onChange={(e) => handleFilterChange('result', e.target.value)}
            >
              <option value="">All Results</option>
              <option value="GRANTED">Granted</option>
              <option value="DENIED">Denied</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              className="input-field"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              className="input-field"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="btn-primary flex-1"
            >
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="btn-secondary flex-1"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Scanned By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {logs.map((log, index) => (
                <tr key={log.log_id} className={`hover:bg-gray-800 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-300 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {new Date(log.scan_time).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-300">
                          {new Date(log.scan_time).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.member ? (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-300 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {fixEncoding(log.member.first_name)} {fixEncoding(log.member.last_name)}
                          </div>
                          <div className="text-sm text-gray-300">
                            {log.member.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-300 mr-2" />
                        <div className="text-sm text-gray-300">Unknown Member</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.staff ? (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-300 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {fixEncoding(log.staff.first_name)} {fixEncoding(log.staff.last_name)}
                          </div>
                          <div className="text-sm text-gray-300">
                            {log.staff.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-300 mr-2" />
                        <div className="text-sm text-gray-300">System</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {log.result === 'GRANTED' ? (
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-danger-500 mr-2" />
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.result === 'GRANTED' 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {log.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(log.scan_time).toLocaleTimeString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {logs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-300">No access logs found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessLogs;
