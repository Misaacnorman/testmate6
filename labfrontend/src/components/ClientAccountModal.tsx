import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import type { ClientAccount, FinancialTransaction } from '../api/financeApi';
import './PaymentModal.css';

interface ClientAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number | null;
}

const ClientAccountModal: React.FC<ClientAccountModalProps> = ({ isOpen, onClose, clientId }) => {
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (isOpen && clientId) {
      fetchAccount();
      fetchTransactions();
    }
  }, [isOpen, clientId, dateFrom, dateTo]);

  const fetchAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.getClientAccount(clientId!);
      setAccount(data);
    } catch (err) {
      setError('Failed to load client account');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.getClientTransactions(clientId!, dateFrom, dateTo);
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Simple CSV export
    const csv = [
      ['Date', 'Type', 'Description', 'Amount', 'Balance'],
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.description,
        t.amount,
        t.balance
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client_account_${clientId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !clientId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content payment-modal">
        <div className="modal-header">
          <h2>Client Account Statement</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : account ? (
          <>
            <div className="account-summary">
              <div><strong>Client:</strong> {account.client.name}</div>
              <div><strong>Balance:</strong> {financeApi.formatCurrency(account.balance)}</div>
            </div>
            <div className="filters">
              <label>From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
              <label>To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
              <button onClick={handleExport} className="btn-secondary">Export CSV</button>
            </div>
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.type}</td>
                    <td>{tx.description}</td>
                    <td>{financeApi.formatCurrency(tx.amount)}</td>
                    <td>{financeApi.formatCurrency(tx.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ClientAccountModal; 