import React, { useState, useEffect } from 'react';
import './Inventory.css';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../api/inventoryApi';

interface InventoryItem {
  id: number;
  itemCode: string;
  itemName: string;
  category: 'equipment' | 'supplies' | 'chemicals' | 'glassware' | 'tools';
  description: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  cost: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'maintenance' | 'retired';
  expiryDate?: string;
  calibrationDate?: string;
  nextCalibration?: string;
}

interface InventorySummary {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  itemsNeedingCalibration: number;
  expiringItems: number;
}

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    itemsNeedingCalibration: 0,
    expiringItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const data = await getInventory();
        setInventory(data);
        setFilteredInventory(data);
        // Optionally, update summary here based on data
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    // Filter inventory based on search and filters
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'status-in-stock';
      case 'low_stock': return 'status-low-stock';
      case 'out_of_stock': return 'status-out-of-stock';
      case 'maintenance': return 'status-maintenance';
      case 'retired': return 'status-retired';
      default: return 'status-default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return '✅';
      case 'low_stock': return '⚠️';
      case 'out_of_stock': return '❌';
      case 'maintenance': return '🔧';
      case 'retired': return '🚫';
      default: return '📋';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment': return '🔬';
      case 'supplies': return '📦';
      case 'chemicals': return '🧪';
      case 'glassware': return '🥃';
      case 'tools': return '🔧';
      default: return '📋';
    }
  };

  const getStockLevel = (item: InventoryItem) => {
    const percentage = (item.quantity / item.maxStock) * 100;
    if (percentage >= 80) return 'high';
    if (percentage >= 30) return 'medium';
    return 'low';
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'stock-high';
      case 'medium': return 'stock-medium';
      case 'low': return 'stock-low';
      default: return 'stock-default';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const handleAddItem = async (item: InventoryItem) => {
    setLoading(true);
    try {
      const newItem = await createInventoryItem(item);
      setInventory(prev => [...prev, newItem]);
      setFilteredInventory(prev => [...prev, newItem]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async (item: InventoryItem) => {
    setLoading(true);
    try {
      const updated = await updateInventoryItem(item.id, item);
      setInventory(prev => prev.map(i => i.id === item.id ? updated : i));
      setFilteredInventory(prev => prev.map(i => i.id === item.id ? updated : i));
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    setLoading(true);
    try {
      await deleteInventoryItem(itemId);
      setInventory(prev => prev.filter(i => i.id !== itemId));
      setFilteredInventory(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilCalibration = (nextCalibration: string) => {
    const nextCal = new Date(nextCalibration);
    const now = new Date();
    return Math.ceil((nextCal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <p>Track laboratory equipment, supplies, and materials</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">📦</div>
          <div className="summary-content">
            <h3>{summary.totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <h3>{summary.lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">❌</div>
          <div className="summary-content">
            <h3>{summary.outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>{formatCurrency(summary.totalValue)}</h3>
            <p>Total Value</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🔧</div>
          <div className="summary-content">
            <h3>{summary.itemsNeedingCalibration}</h3>
            <p>Need Calibration</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⏰</div>
          <div className="summary-content">
            <h3>{summary.expiringItems}</h3>
            <p>Expiring Soon</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by item code, name, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="equipment">Equipment</option>
            <option value="supplies">Supplies</option>
            <option value="chemicals">Chemicals</option>
            <option value="glassware">Glassware</option>
            <option value="tools">Tools</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>

          <button onClick={() => setShowAddModal(true)} className="add-item-btn">
            ➕ Add Item
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="item-code">
                    <strong>{item.itemCode}</strong>
                  </div>
                </td>
                <td>
                  <div className="item-info">
                    <strong>{item.itemName}</strong>
                    <span className="item-description">{item.description}</span>
                    <div className="item-cost">Cost: {formatCurrency(item.cost)}</div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">
                    {getCategoryIcon(item.category)} {item.category}
                  </span>
                </td>
                <td>
                  <div className="quantity-info">
                    <span className={`stock-level ${getStockLevelColor(getStockLevel(item))}`}>
                      {item.quantity} {item.unit}
                    </span>
                    <div className="stock-range">
                      Min: {item.minStock} | Max: {item.maxStock}
                    </div>
                  </div>
                </td>
                <td>{item.location}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)} {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td>{formatDateTime(item.lastUpdated)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => {
                        setSelectedItem(item);
                        setShowEditModal(true);
                      }}
                      className="edit-btn"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Item Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedItem(null);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showAddModal ? 'Add New Item' : 'Edit Item'}</h2>
              <button onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedItem(null);
              }} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Code</label>
                  <input type="text" placeholder="e.g., EQ-001" />
                </div>
                <div className="form-group">
                  <label>Item Name</label>
                  <input type="text" placeholder="Enter item name" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
                    <option value="chemicals">Chemicals</option>
                    <option value="glassware">Glassware</option>
                    <option value="tools">Tools</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Enter item description"></textarea>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input type="text" placeholder="e.g., units, bottles, pieces" />
                </div>
                <div className="form-group">
                  <label>Min Stock</label>
                  <input type="number" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Max Stock</label>
                  <input type="number" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" placeholder="Enter storage location" />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input type="text" placeholder="Enter supplier name" />
                </div>
                <div className="form-group">
                  <label>Cost (UGX)</label>
                  <input type="number" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedItem(null);
              }} className="cancel-btn">
                Cancel
              </button>
              <button className="save-btn">
                💾 Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory; 