import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import type { FinancialTransaction, Client } from '../api/financeApi';
import './PaymentModal.css';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
    fetchTransactions();
  }, [typeFilter, clientFilter, dateFrom, dateTo]);

  const fetchClients = async () => {
    try {
      const data = await financeApi.getClients();
      setClients(data);
    } catch (err) {
      setClients([]);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.getAllTransactions({
        type: typeFilter === 'all' ? undefined : typeFilter,
        clientId: clientFilter === 'all' ? undefined : Number(clientFilter),
        dateFrom,
        dateTo
      });
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      <div className="filters">
        <label>Type:
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="invoice">Invoice</option>
            <option value="payment">Payment</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </label>
        <label>Client:
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
            <option value="all">All</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </label>
        <label>From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
        <label>To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
        <button className="btn-secondary" onClick={fetchTransactions}>Refresh</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table className="finance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Client</th>
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
                <td>{tx.client?.name || '-'}</td>
                <td>{tx.description}</td>
                <td>{financeApi.formatCurrency(tx.amount)}</td>
                <td>{financeApi.formatCurrency(tx.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionHistory; 