import React, { useState, useEffect } from 'react';
import './Results.css';
import { getResults, createResult, updateResult, deleteResult } from '../api/resultsApi';

interface TestResult {
  id: number;
  sampleCode: string;
  testCode: string;
  testName: string;
  clientName: string;
  projectName: string;
  resultValue: string;
  unit: string;
  specification: string;
  status: 'pass' | 'fail' | 'pending' | 'in_progress';
  testedBy: string;
  testedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  remarks?: string;
  attachments: string[];
}

interface ResultsSummary {
  totalResults: number;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  averageTurnaroundTime: number;
  qualityScore: number;
}

const Results = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<ResultsSummary>({
    totalResults: 0,
    passedTests: 0,
    failedTests: 0,
    pendingTests: 0,
    averageTurnaroundTime: 0,
    qualityScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [testFilter, setTestFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await getResults();
        setResults(data);
        setFilteredResults(data);
        // Optionally, update summary here based on data
      } catch (err) {
        console.error('Failed to fetch results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  useEffect(() => {
    // Filter results based on search and filters
    let filtered = results;

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.sampleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.testCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.testName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(result => result.status === statusFilter);
    }

    if (testFilter !== 'all') {
      filtered = filtered.filter(result => result.testCode === testFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(result => {
        const testedDate = new Date(result.testedDate);
        switch (dateFilter) {
          case 'last7':
            return testedDate >= sevenDaysAgo;
          case 'last30':
            return testedDate >= thirtyDaysAgo;
          case 'today':
            return testedDate.toDateString() === now.toDateString();
          default:
            return true;
        }
      });
    }

    setFilteredResults(filtered);
  }, [results, searchTerm, statusFilter, testFilter, dateFilter]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'status-pass';
      case 'fail': return 'status-fail';
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-progress';
      default: return 'status-default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'pending': return '⏳';
      case 'in_progress': return '🔬';
      default: return '📋';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTestFilter('all');
    setDateFilter('all');
  };

  const handleViewResult = (result: TestResult) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  const handleExportResults = () => {
    // Simulate export functionality
    alert('Exporting results to Excel...');
  };

  const getUniqueTests = () => {
    const tests = results.map(r => ({ code: r.testCode, name: r.testName }));
    return Array.from(new Set(tests.map(t => t.code))).map(code => {
      const test = tests.find(t => t.code === code);
      return { code, name: test?.name || '' };
    });
  };

  const handleAddResult = async (result: TestResult) => {
    setLoading(true);
    try {
      const newResult = await createResult(result);
      setResults(prev => [...prev, newResult]);
      setFilteredResults(prev => [...prev, newResult]);
    } catch (err) {
      console.error('Failed to add result:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResult = async (result: TestResult) => {
    setLoading(true);
    try {
      const updated = await updateResult(result.id, result);
      setResults(prev => prev.map(r => r.id === result.id ? updated : r));
      setFilteredResults(prev => prev.map(r => r.id === result.id ? updated : r));
    } catch (err) {
      console.error('Failed to update result:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (resultId: number) => {
    setLoading(true);
    try {
      await deleteResult(resultId);
      setResults(prev => prev.filter(r => r.id !== resultId));
      setFilteredResults(prev => prev.filter(r => r.id !== resultId));
    } catch (err) {
      console.error('Failed to delete result:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="results-loading">
        <div className="loading-spinner"></div>
        <p>Loading test results...</p>
      </div>
    );
  }

  return (
    <div className="results">
      <div className="results-header">
        <h1>Test Results Management</h1>
        <p>View, manage, and export laboratory test results</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <h3>{summary.totalResults}</h3>
            <p>Total Results</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h3>{summary.passedTests}</h3>
            <p>Passed Tests</p>
            <span className="summary-percentage">{((summary.passedTests / summary.totalResults) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">❌</div>
          <div className="summary-content">
            <h3>{summary.failedTests}</h3>
            <p>Failed Tests</p>
            <span className="summary-percentage">{((summary.failedTests / summary.totalResults) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⏱️</div>
          <div className="summary-content">
            <h3>{summary.averageTurnaroundTime}</h3>
            <p>Avg. Turnaround (Days)</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by sample code, test code, client, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
          </select>

          <select
            value={testFilter}
            onChange={(e) => setTestFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tests</option>
            {getUniqueTests().map(test => (
              <option key={test.code} value={test.code}>{test.name}</option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
          </select>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>

          <button onClick={handleExportResults} className="export-btn">
            📊 Export Results
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Sample Code</th>
              <th>Test</th>
              <th>Client</th>
              <th>Result</th>
              <th>Status</th>
              <th>Tested By</th>
              <th>Tested Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map(result => (
              <tr key={result.id}>
                <td>
                  <div className="sample-code">
                    <strong>{result.sampleCode}</strong>
                    <span className="project-name">{result.projectName}</span>
                  </div>
                </td>
                <td>
                  <div className="test-info">
                    <strong>{result.testName}</strong>
                    <span className="test-code">{result.testCode}</span>
                  </div>
                </td>
                <td>{result.clientName}</td>
                <td>
                  <div className="result-value">
                    <strong>{result.resultValue}</strong>
                    <span className="unit">{result.unit}</span>
                    <div className="specification">Spec: {result.specification}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)} {result.status.toUpperCase()}
                  </span>
                </td>
                <td>{result.testedBy}</td>
                <td>{formatDateTime(result.testedDate)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleViewResult(result)}
                      className="view-btn"
                    >
                      👁️ View
                    </button>
                    <button className="download-btn">
                      📥 Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result Detail Modal */}
      {showResultModal && selectedResult && (
        <div className="modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Test Result Details</h2>
              <button onClick={() => setShowResultModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="result-details">
                <div className="detail-section">
                  <h3>Sample Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Sample Code:</label>
                      <span>{selectedResult.sampleCode}</span>
                    </div>
                    <div className="detail-item">
                      <label>Test Code:</label>
                      <span>{selectedResult.testCode}</span>
                    </div>
                    <div className="detail-item">
                      <label>Test Name:</label>
                      <span>{selectedResult.testName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Client:</label>
                      <span>{selectedResult.clientName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Project:</label>
                      <span>{selectedResult.projectName}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Test Results</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Result Value:</label>
                      <span className="result-highlight">{selectedResult.resultValue} {selectedResult.unit}</span>
                    </div>
                    <div className="detail-item">
                      <label>Specification:</label>
                      <span>{selectedResult.specification}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge ${getStatusColor(selectedResult.status)}`}>
                        {getStatusIcon(selectedResult.status)} {selectedResult.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Remarks:</label>
                      <span>{selectedResult.remarks || 'No remarks'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Testing Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Tested By:</label>
                      <span>{selectedResult.testedBy}</span>
                    </div>
                    <div className="detail-item">
                      <label>Tested Date:</label>
                      <span>{formatDateTime(selectedResult.testedDate)}</span>
                    </div>
                    {selectedResult.approvedBy && (
                      <div className="detail-item">
                        <label>Approved By:</label>
                        <span>{selectedResult.approvedBy}</span>
                      </div>
                    )}
                    {selectedResult.approvedDate && (
                      <div className="detail-item">
                        <label>Approved Date:</label>
                        <span>{formatDateTime(selectedResult.approvedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedResult.attachments.length > 0 && (
                  <div className="detail-section">
                    <h3>Attachments</h3>
                    <div className="attachments-list">
                      {selectedResult.attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <span className="attachment-icon">📎</span>
                          <span className="attachment-name">{attachment}</span>
                          <button className="download-attachment-btn">📥</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowResultModal(false)} className="close-modal-btn">
                Close
              </button>
              <button className="print-btn">
                🖨️ Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results; 