import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import type { User } from '../api/financeApi';
import './CreateInvoiceModal.css';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: () => void;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  testId?: number;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onInvoiceCreated }) => {
  const [clients, setClients] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    clientId: '',
    dueDate: '',
    notes: '',
    terms: 'Net 30',
    issuedBy: ''
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [clientsData, usersData] = await Promise.all([
        financeApi.getClients(),
        financeApi.getClients() // Using same endpoint for users for now
      ]);
      setClients(clientsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load clients and users');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.dueDate || !formData.issuedBy) {
      setError('Please fill in all required fields');
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      setError('Please fill in all item details correctly');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await financeApi.createInvoice({
        clientId: Number(formData.clientId),
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          testId: item.testId
        })),
        dueDate: formData.dueDate,
        notes: formData.notes || undefined,
        terms: formData.terms,
        issuedBy: Number(formData.issuedBy)
      });

      onInvoiceCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError(error instanceof Error ? error.message : 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      dueDate: '',
      notes: '',
      terms: 'Net 30',
      issuedBy: ''
    });
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content create-invoice-modal">
        <div className="modal-header">
          <h2>Create New Invoice</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="invoice-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3>Invoice Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientId">Client *</label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="issuedBy">Issued By *</label>
                <select
                  id="issuedBy"
                  name="issuedBy"
                  value={formData.issuedBy}
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dueDate">Due Date *</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="terms">Payment Terms</label>
                <select
                  id="terms"
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Net 90">Net 90</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes for the invoice..."
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Invoice Items</h3>
              <button type="button" onClick={addItem} className="btn-add-item">
                + Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="form-group">
                  <label>Description *</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unit Price (UGX) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total</label>
                  <input
                    type="text"
                    value={financeApi.formatCurrency(item.quantity * item.unitPrice)}
                    readOnly
                    className="readonly"
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn-remove-item"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <div className="total-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{financeApi.formatCurrency(calculateTotal())}</span>
              </div>
              <div className="total-row">
                <span>VAT (18%):</span>
                <span>{financeApi.formatCurrency(calculateTotal() * 0.18)}</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>{financeApi.formatCurrency(calculateTotal() * 1.18)}</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal; 