import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import type { Invoice, User } from '../api/financeApi';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentCreated: () => void;
  invoice?: Invoice;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentCreated, invoice }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: '',
    receivedBy: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (invoice) {
        setFormData(prev => ({
          ...prev,
          amount: invoice.totalAmount.toString()
        }));
      }
    }
  }, [isOpen, invoice]);

  const fetchUsers = async () => {
    try {
      const usersData = await financeApi.getClients(); // Using same endpoint for users
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice || !formData.amount || !formData.paymentMethod || !formData.receivedBy) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    if (amount > invoice.totalAmount) {
      setError('Payment amount cannot exceed invoice total');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await financeApi.createPayment({
        invoiceId: invoice.id,
        amount: amount,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
        receivedBy: Number(formData.receivedBy)
      });

      onPaymentCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      paymentMethod: 'bank_transfer',
      reference: '',
      notes: '',
      receivedBy: ''
    });
    setError(null);
  };

  if (!isOpen || !invoice) return null;

  const remainingAmount = invoice.totalAmount - (invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content payment-modal">
        <div className="modal-header">
          <h2>Process Payment</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="invoice-summary">
          <h3>Invoice Details</h3>
          <div className="invoice-info">
            <div className="info-row">
              <span>Invoice Number:</span>
              <span className="invoice-number">{invoice.invoiceNumber}</span>
            </div>
            <div className="info-row">
              <span>Client:</span>
              <span>{invoice.client?.name || 'Unknown Client'}</span>
            </div>
            <div className="info-row">
              <span>Total Amount:</span>
              <span>{financeApi.formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="info-row">
              <span>Amount Paid:</span>
              <span>{financeApi.formatCurrency(invoice.totalAmount - remainingAmount)}</span>
            </div>
            <div className="info-row">
              <span>Remaining Amount:</span>
              <span className="remaining-amount">{financeApi.formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3>Payment Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Payment Amount (UGX) *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0.01"
                  max={remainingAmount}
                  step="0.01"
                  required
                />
                <small>Maximum: {financeApi.formatCurrency(remainingAmount)}</small>
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method *</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reference">Payment Reference</label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Transaction ID, cheque number, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="receivedBy">Received By *</label>
                <select
                  id="receivedBy"
                  name="receivedBy"
                  value={formData.receivedBy}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Payment Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes about this payment..."
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal; 