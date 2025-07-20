import React, { useState, useEffect, useCallback } from 'react';
import { getSampleReceipts } from '../api/sampleLogsApi';
import './Logs.css';

// Enhanced Filter Component for Sample Receipts
function SampleReceiptsFilterBar() {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const filters = [
    { label: 'From Date', type: 'date' },
    { label: 'To Date', type: 'date' },
    { label: 'Client Name', type: 'text' },
    { label: 'Project Name', type: 'text' },
    { label: 'Received By', type: 'text' },
    { label: 'Receipt Type', type: 'dropdown', options: ['Regular', 'Special'] },
    { label: 'Status', type: 'dropdown', options: ['Active', 'Completed', 'Archived'] },
  ];

  const handleFilterChange = (label: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
  };

  const handleApplyFilters = () => {
    // TODO: Implement actual filtering logic
    console.log('Applying sample receipt filters:', filterValues);
  };

  const activeFiltersCount = Object.keys(filterValues).filter(key => filterValues[key] !== '' && filterValues[key] !== null).length;

  return (
    <div className="enhanced-filter-section">
      <div className="filter-header">
        <div className="filter-title">
          <h3>Sample Receipts Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="active-filters-badge">{activeFiltersCount} active</span>
          )}
        </div>
        <div className="filter-actions">
          <button 
            className="filter-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
          {activeFiltersCount > 0 && (
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="filter-controls">
          {filters.map(f => (
            <div className="filter-group" key={f.label}>
              <label className="filter-label">{f.label}:</label>
              {f.type === 'date' ? (
                <input 
                  type="date" 
                  className="filter-input"
                  value={filterValues[f.label] || ''}
                  onChange={(e) => handleFilterChange(f.label, e.target.value)}
                />
              ) : f.type === 'dropdown' ? (
                <select 
                  className="filter-input"
                  value={filterValues[f.label] || ''}
                  onChange={(e) => handleFilterChange(f.label, e.target.value)}
                >
                  <option value="">Select {f.label}</option>
                  {f.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  className="filter-input"
                  placeholder={`Enter ${f.label.toLowerCase()}...`}
                  value={filterValues[f.label] || ''}
                  onChange={(e) => handleFilterChange(f.label, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="filter-actions-bottom">
            <button className="apply-filters-btn" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const SampleReceiptsTab = () => {
  const [sampleReceipts, setSampleReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const dateFrom = '';
  const dateTo = '';
  const clientFilter = '';
  const projectFilter = '';
  const receivedByFilter = '';
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const fetchSampleReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        client: clientFilter || undefined,
        project: projectFilter || undefined,
        receivedBy: receivedByFilter || undefined,
        search: searchTerm || undefined
      };
      const data = await getSampleReceipts(filters);
      setSampleReceipts(data);
      setError('');
    } catch {
      setError('Failed to fetch sample receipts');
      setSampleReceipts([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, clientFilter, projectFilter, receivedByFilter, searchTerm]);

  useEffect(() => {
    fetchSampleReceipts();
  }, [fetchSampleReceipts]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpen !== null) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleDeleteReceipt = async (id: number) => {
    try {
      setSampleReceipts(prev => prev.filter(receipt => receipt.id !== id));
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  const handleDownloadReceipt = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/samples/${id}/receipt`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sample-receipt-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading receipt:', err);
    }
  };

  const handlePreviewReceipt = async (id: number) => {
    try {
      const response = await fetch(`/api/samples/${id}/receipt`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error previewing receipt:', err);
    }
  };

  const toggleDropdown = (id: number) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredReceipts = sampleReceipts.filter(receipt => {
    const matchesSearch = !searchTerm || 
      receipt.sampleReceiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receivedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div className="logs-container">Loading sample receipts...</div>;
  }

  return (
    <div className="logs-container">
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search by receipt number, client, project, or receiver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <SampleReceiptsFilterBar />
      <div className="samples-section sample-receipts-table">
        <div className="samples-header">
          <p>Showing {filteredReceipts.length} receipt(s)</p>
          <button className="btn-primary" onClick={fetchSampleReceipts}>
            <span>🔄</span> Refresh
          </button>
        </div>
        <div className="table-container">
          <div className="scroll-table-area-vertical">
            <table className="samples-table sample-receipts-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Date of Receipt</th>
                  <th>Client Name</th>
                  <th>Project</th>
                  <th>Received By</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">
                      No sample receipts found. {searchTerm || dateFrom || dateTo || clientFilter || projectFilter || receivedByFilter ? 'Try adjusting your filters.' : 'Sample receipts will appear here after registration!'}
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map(receipt => (
                    <tr key={receipt.id}>
                      <td>
                        <a href={`/api/samples/${receipt.sampleId}/receipt`} className="receipt-link" onClick={(e) => handleDownloadReceipt(receipt.sampleId, e)}>
                          {receipt.sampleReceiptNumber || `Sample-${receipt.sampleId}`}
                        </a>
                      </td>
                      <td>{formatDate(receipt.dateOfReceipt)}</td>
                      <td>{receipt.clientName}</td>
                      <td>{receipt.project}</td>
                      <td>{receipt.receivedBy}</td>
                      <td>
                        <span className={`type-badge ${receipt.type}`}>
                          {receipt.type === 'regular' ? 'Regular' : 'Special'}
                        </span>
                      </td>
                      <td>
                        <div className="actions-dropdown">
                          <button 
                            className="dropdown-toggle"
                            onClick={() => toggleDropdown(receipt.id)}
                          >
                            ⋮
                          </button>
                          {dropdownOpen === receipt.id && (
                            <div className="dropdown-menu">
                              <button onClick={() => handlePreviewReceipt(receipt.sampleId)}>
                                👁️ Preview
                              </button>
                              <button onClick={(e) => handleDownloadReceipt(receipt.sampleId, e)}>
                                📥 Download
                              </button>
                              <button 
                                className="delete-action"
                                onClick={() => handleDeleteReceipt(receipt.id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SampleReceiptsTab; 