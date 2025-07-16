import { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import type { Invoice, RevenueReport } from '../api/financeApi';
import CreateInvoiceModal from '../components/CreateInvoiceModal';
import PaymentModal from '../components/PaymentModal';
import FinanceReports from '../components/FinanceReports';
import TransactionHistory from '../components/TransactionHistory';
import ClientAccountModal from '../components/ClientAccountModal';
import './Finance.css';

interface FinancialSummary {
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  monthlyRevenue: number;
  outstandingInvoices: number;
  averagePaymentTime: number;
}

const Finance = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalPending: 0,
    totalOverdue: 0,
    monthlyRevenue: 0,
    outstandingInvoices: 0,
    averagePaymentTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showClientAccountModal, setShowClientAccountModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all financial data in parallel
      const [invoicesData, paymentsData, , revenueData] = await Promise.all([
        financeApi.getInvoices(),
        financeApi.getPayments(),
        financeApi.getClientAccounts(),
        financeApi.getRevenueReport(),
      ]);

      setInvoices(invoicesData);
      setRevenueReport(revenueData);

      // Calculate summary
      const totalRevenue = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
      const totalPending = invoicesData
        .filter(invoice => invoice.status === 'pending')
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const totalOverdue = invoicesData
        .filter(invoice => invoice.status === 'overdue')
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      
      // Calculate monthly revenue from revenue report
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const monthlyRevenue = revenueData.revenueByMonth[currentMonth] || 0;

      // Calculate outstanding invoices
      const outstandingInvoices = invoicesData.filter(invoice => 
        invoice.status === 'pending' || invoice.status === 'overdue'
      ).length;

      // Calculate average payment time (simplified)
      const averagePaymentTime = paymentsData.length > 0 ? 30 : 0; // Placeholder

      setSummary({
        totalRevenue,
        totalPending,
        totalOverdue,
        monthlyRevenue,
        outstandingInvoices,
        averagePaymentTime
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  useEffect(() => {
    // Filter invoices based on search and filters
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(invoice => {
        const issueDate = new Date(invoice.issuedDate);
        switch (dateFilter) {
          case 'last30':
            return issueDate >= thirtyDaysAgo;
          case 'last90':
            return issueDate >= ninetyDaysAgo;
          case 'overdue':
            return new Date(invoice.dueDate) < now && invoice.status !== 'paid';
          default:
            return true;
        }
      });
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, dateFilter]);

  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await financeApi.updateInvoice(invoiceId, { status: 'paid' });
      // Refresh data
      const updatedInvoices = await financeApi.getInvoices();
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      setError(error instanceof Error ? error.message : 'Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await financeApi.deleteInvoice(invoiceId);
        // Refresh data
        const updatedInvoices = await financeApi.getInvoices();
        setInvoices(updatedInvoices);
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete invoice');
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  const handleInvoiceCreated = () => {
    fetchFinancialData(); // Refresh the data
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
  };

  const handlePaymentCreated = () => {
    // Refresh invoices/payments after payment
    fetchFinancialData();
  };

  const handleOpenClientAccount = (clientId: number) => {
    setSelectedClientId(clientId);
    setShowClientAccountModal(true);
  };

  const handleCloseClientAccount = () => {
    setShowClientAccountModal(false);
    setSelectedClientId(null);
  };

  if (loading) {
    return (
      <div className="finance-loading">
        <div className="loading-spinner"></div>
        <p>Loading financial data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="finance-error">
        <div className="error-message">
          <h3>Error Loading Financial Data</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="finance">
      <div className="finance-header">
        <h1>Financial Management</h1>
        <p>Track revenue, invoices, and financial performance</p>
        <button className="btn-primary" onClick={() => setShowReportsModal(true)}>
          View Financial Reports
        </button>
        <button className="btn-secondary" onClick={() => setShowTransactionHistory(true)}>
          View Transaction History
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="finance-summary">
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>{financeApi.formatCurrency(summary.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <span className="summary-change positive">+15% from last month</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <h3>{financeApi.formatCurrency(summary.totalPending)}</h3>
            <p>Pending Payments</p>
            <span className="summary-change neutral">{summary.outstandingInvoices} invoices</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <h3>{financeApi.formatCurrency(summary.totalOverdue)}</h3>
            <p>Overdue Amount</p>
            <span className="summary-change negative">Requires attention</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <h3>{summary.averagePaymentTime} days</h3>
            <p>Avg Payment Time</p>
            <span className="summary-change positive">-2 days from last month</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by invoice number, client, or notes..."
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
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="overdue">Overdue Only</option>
          </select>
          
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {filteredInvoices.length} invoice(s)</p>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <span>+</span> Create Invoice
        </button>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Amount (UGX)</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Status</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Days Overdue</th>
              <th>Client Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  No invoices found. {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first invoice!'}
                </td>
              </tr>
            ) : (
              filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>
                    <code className="invoice-code">{invoice.invoiceNumber}</code>
                  </td>
                  <td>{invoice.client?.name || 'Unknown Client'}</td>
                  <td>{financeApi.formatCurrency(invoice.amount)}</td>
                  <td>{financeApi.formatCurrency(invoice.taxAmount)}</td>
                  <td>{financeApi.formatCurrency(invoice.totalAmount)}</td>
                  <td>
                    <span className={`status-badge ${financeApi.getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td>{financeApi.formatDate(invoice.issuedDate)}</td>
                  <td>{financeApi.formatDate(invoice.dueDate)}</td>
                  <td>
                    {invoice.status === 'overdue' ? (
                      <span className="overdue-days">
                        {financeApi.getDaysOverdue(invoice.dueDate)} days
                      </span>
                    ) : invoice.status === 'paid' ? (
                      <span className="paid-indicator">Paid</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleOpenClientAccount(invoice.clientId)}
                    >
                      View Account
                    </button>
                  </td>
                  <td className="actions">
                    <button className="btn-view" title="View Invoice">
                      👁️
                    </button>
                    <button className="btn-edit" title="Edit Invoice">
                      ✏️
                    </button>
                    {invoice.status === 'pending' && (
                      <button 
                        className="btn-mark-paid" 
                        title="Mark as Paid"
                        onClick={() => handleMarkAsPaid(invoice.id)}
                      >
                        ✅
                      </button>
                    )}
                    <button 
                      className="btn-delete" 
                      title="Delete Invoice"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                    >
                      🗑️
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleOpenPaymentModal(invoice)}
                      disabled={invoice.status === 'paid'}
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Financial Charts */}
      <div className="finance-charts">
        <div className="chart-container">
          <h3>Revenue Trend</h3>
          <div className="chart-placeholder">
            {revenueReport ? (
              <div className="revenue-chart">
                {Object.entries(revenueReport.revenueByMonth).map(([month, data]) => (
                  <div key={month} className="revenue-bar" style={{ height: `${Math.min((data as any) / 1000000 * 100, 100)}%` }}>
                    <span>{month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No revenue data available</p>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3>Payment Status Distribution</h3>
          <div className="chart-placeholder">
            <div className="payment-status-chart">
              <div className="status-item">
                <div className="status-color paid"></div>
                <span>Paid ({invoices.filter(i => i.status === 'paid').length})</span>
              </div>
              <div className="status-item">
                <div className="status-color pending"></div>
                <span>Pending ({invoices.filter(i => i.status === 'pending').length})</span>
              </div>
              <div className="status-item">
                <div className="status-color overdue"></div>
                <span>Overdue ({invoices.filter(i => i.status === 'overdue').length})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        onPaymentCreated={handlePaymentCreated}
        invoice={selectedInvoice || undefined}
      />

      {showReportsModal && (
        <FinanceReports
          onClose={() => setShowReportsModal(false)}
        />
      )}

      {showTransactionHistory && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <button className="close-button" onClick={() => setShowTransactionHistory(false)}>×</button>
            <TransactionHistory />
          </div>
        </div>
      )}

      <ClientAccountModal
        isOpen={showClientAccountModal}
        onClose={handleCloseClientAccount}
        clientId={selectedClientId}
      />
    </div>
  );
};

export default Finance;
