import { useState, useEffect } from 'react';
import './Reports.css';
import { getReports, createReport, updateReport, deleteReport } from '../api/reportsApi';

interface Report {
  id: number;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  category: 'samples' | 'tests' | 'finance' | 'performance' | 'quality' | 'compliance';
  description: string;
  lastGenerated: string;
  nextScheduled?: string;
  status: 'active' | 'inactive' | 'scheduled';
  format: 'pdf' | 'excel' | 'csv' | 'html';
  recipients: string[];
}

interface ReportData {
  totalReports: number;
  activeReports: number;
  scheduledReports: number;
  lastWeekGenerated: number;
  popularReports: string[];
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const reportData: ReportData = {
    totalReports: 0,
    activeReports: 0,
    scheduledReports: 0,
    lastWeekGenerated: 0,
    popularReports: []
  };
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getReports();
        setReports(data);
        setFilteredReports(data);
        // Optionally, update reportData here based on data
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    // Filter reports based on search and filters
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, typeFilter, categoryFilter]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'type-daily';
      case 'weekly': return 'type-weekly';
      case 'monthly': return 'type-monthly';
      case 'quarterly': return 'type-quarterly';
      case 'annual': return 'type-annual';
      case 'custom': return 'type-custom';
      default: return 'type-default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'samples': return 'category-samples';
      case 'tests': return 'category-tests';
      case 'finance': return 'category-finance';
      case 'performance': return 'category-performance';
      case 'quality': return 'category-quality';
      case 'compliance': return 'category-compliance';
      default: return 'category-default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'scheduled': return 'status-scheduled';
      default: return 'status-default';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'csv': return '📋';
      case 'html': return '🌐';
      default: return '📄';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  const handleGenerateReport = (reportId: number) => {
    // Simulate report generation
    alert(`Generating report ${reportId}...`);
  };

  const handleAddReport = async (report: Report) => {
    setLoading(true);
    try {
      const newReport = await createReport(report);
      setReports(prev => [...prev, newReport]);
      setFilteredReports(prev => [...prev, newReport]);
    } catch (err) {
      console.error('Failed to add report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReport = async (report: Report) => {
    setLoading(true);
    try {
      const updated = await updateReport(report.id, report);
      setReports(prev => prev.map(r => r.id === report.id ? updated : r));
      setFilteredReports(prev => prev.map(r => r.id === report.id ? updated : r));
    } catch (err) {
      console.error('Failed to update report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    setLoading(true);
    try {
      await deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      setFilteredReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Failed to delete report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Generate, schedule, and manage laboratory reports and analytics</p>
      </div>

      {/* Report Statistics */}
      <div className="reports-summary">
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <h3>{reportData.totalReports}</h3>
            <p>Total Reports</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h3>{reportData.activeReports}</h3>
            <p>Active Reports</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⏰</div>
          <div className="summary-content">
            <h3>{reportData.scheduledReports}</h3>
            <p>Scheduled Reports</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <h3>{reportData.lastWeekGenerated}</h3>
            <p>Generated This Week</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by report name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
            <option value="custom">Custom</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="samples">Samples</option>
            <option value="tests">Tests</option>
            <option value="finance">Finance</option>
            <option value="performance">Performance</option>
            <option value="quality">Quality</option>
            <option value="compliance">Compliance</option>
          </select>
          
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {filteredReports.length} report(s)</p>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <span>+</span> Create New Report
        </button>
      </div>

      {/* Reports Table */}
      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Type</th>
              <th>Category</th>
              <th>Status</th>
              <th>Format</th>
              <th>Last Generated</th>
              <th>Next Scheduled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">
                  No reports found. {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first report!'}
                </td>
              </tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report.id}>
                  <td>
                    <div className="report-info">
                      <strong>{report.name}</strong>
                      <p className="report-description">{report.description}</p>
                      <div className="report-recipients">
                        <span>Recipients: {report.recipients.length}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${getTypeColor(report.type)}`}>
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`category-badge ${getCategoryColor(report.category)}`}>
                      {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className="format-badge">
                      {getFormatIcon(report.format)} {report.format.toUpperCase()}
                    </span>
                  </td>
                  <td>{formatDateTime(report.lastGenerated)}</td>
                  <td>
                    {report.nextScheduled ? formatDateTime(report.nextScheduled) : '-'}
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-generate" 
                      title="Generate Report"
                      onClick={() => handleGenerateReport(report.id)}
                    >
                      🔄
                    </button>
                    <button 
                      className="btn-view" 
                      title="View Report"
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-edit" 
                      title="Edit Report"
                      onClick={() => handleEditReport(report)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete" 
                      title="Delete Report"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Popular Reports */}
      <div className="popular-reports">
        <h3>Popular Reports</h3>
        <div className="popular-reports-grid">
          {reportData.popularReports.map((reportName, index) => (
            <div key={index} className="popular-report-card">
              <div className="popular-report-icon">📊</div>
              <div className="popular-report-content">
                <h4>{reportName}</h4>
                <p>Frequently accessed report</p>
                <button className="btn-primary btn-sm">Generate Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Report</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Report creation form would go here...</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary">Create Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 