import React, { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../api/financeApi';
import type { FinanceReport } from '../api/financeApi';
// ...existing code...

interface FinanceReportsProps {
  onClose: () => void;
}

const FinanceReports: React.FC<FinanceReportsProps> = ({ onClose }) => {
  const [reports, setReports] = useState<FinanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('month'); // month, quarter, year, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, [dateRange, customStartDate, customEndDate]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Overlay click handler
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          setError('Please select both start and end dates');
          setLoading(false);
          return;
        }
        startDate = customStartDate;
        endDate = customEndDate;
      }

      const reportsData = await financeApi.getFinanceReports(startDate, endDate);
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // ...existing code...

  const getPaymentMethodColor = (method: string) => {
    const colors = {
      bank_transfer: '#3b82f6',
      cash: '#10b981',
      mobile_money: '#8b5cf6',
      cheque: '#f59e0b',
      card: '#ef4444'
    };
    return colors[method as keyof typeof colors] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content reports-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading financial reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content reports-modal">
          <div className="modal-header">
            <h2>Financial Reports</h2>
            <button onClick={onClose} className="close-button">×</button>
          </div>
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={fetchReports} className="btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!reports) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content reports-modal">
        <div className="modal-header">
          <h2>Financial Reports</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="reports-content">
          {/* Date Range Selector */}
          <div className="date-range-selector">
            <div className="date-controls">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="date-select"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>

              {dateRange === 'custom' && (
                <div className="custom-dates">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="date-input"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon revenue">💰</div>
              <div className="card-content">
                <h3>Total Revenue</h3>
                <p className="card-amount">{formatCurrency(reports.totalRevenue)}</p>
                <span className="card-change positive">
                  +{formatPercentage(reports.revenueGrowth)} from last period
                </span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon invoices">📄</div>
              <div className="card-content">
                <h3>Total Invoices</h3>
                <p className="card-amount">{reports.totalInvoices}</p>
                <span className="card-change">
                  {reports.paidInvoices} paid, {reports.pendingInvoices} pending
                </span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon payments">💳</div>
              <div className="card-content">
                <h3>Total Payments</h3>
                <p className="card-amount">{formatCurrency(reports.totalPayments)}</p>
                <span className="card-change">
                  {reports.totalPaymentCount} transactions
                </span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon outstanding">⚠️</div>
              <div className="card-content">
                <h3>Outstanding</h3>
                <p className="card-amount">{formatCurrency(reports.outstandingAmount)}</p>
                <span className="card-change negative">
                  {reports.overdueInvoices} overdue invoices
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h3>Revenue by Month</h3>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {reports.monthlyRevenue.map((month, index) => (
                    <div key={index} className="chart-bar">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          height: `${(month.amount / Math.max(...reports.monthlyRevenue.map(m => m.amount))) * 100}%`,
                          backgroundColor: month.amount > 0 ? '#10b981' : '#e5e7eb'
                        }}
                      ></div>
                      <span className="bar-label">{month.month}</span>
                      <span className="bar-value">{formatCurrency(month.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Payment Methods Distribution</h3>
              <div className="chart-placeholder">
                <div className="pie-chart">
                  {reports.paymentMethods.map((method, index) => (
                    <div key={index} className="pie-segment">
                      <div 
                        className="segment-color" 
                        style={{ backgroundColor: getPaymentMethodColor(method.method) }}
                      ></div>
                      <span className="segment-label">{method.method.replace('_', ' ').toUpperCase()}</span>
                      <span className="segment-value">{formatCurrency(method.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Clients */}
          <div className="top-clients">
            <h3>Top Clients by Revenue</h3>
            <div className="clients-list">
              {reports.topClients.map((client, index) => (
                <div key={client.id} className="client-item">
                  <div className="client-rank">#{index + 1}</div>
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    <p>{client.email}</p>
                  </div>
                  <div className="client-stats">
                    <span className="client-revenue">{formatCurrency(client.totalRevenue)}</span>
                    <span className="client-invoices">{client.invoiceCount} invoices</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Financial Activity</h3>
            <div className="activity-list">
              {reports.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'invoice' ? '📄' : '💳'}
                  </div>
                  <div className="activity-content">
                    <p className="activity-description">
                      {activity.type === 'invoice' ? 'New invoice' : 'Payment received'}: {activity.description}
                    </p>
                    <span className="activity-amount">{formatCurrency(activity.amount)}</span>
                  </div>
                  <div className="activity-date">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button onClick={() => window.print()} className="btn-primary">
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceReports; 