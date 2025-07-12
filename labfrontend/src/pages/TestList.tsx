import React, { useState, useEffect } from 'react';
import './TestList.css';
import { getMaterialTests, createMaterialTest, updateMaterialTest, deleteMaterialTest, deleteAllMaterialTests, exportMaterialTests } from '../api/materialTestsApi';
import * as XLSX from 'xlsx';

interface Test {
  id: number;
  code: string;
  name: string;
  category: string;
  method: string;
  leadTimeDays: number | null;
  priceUgx: number | null;
  priceUsd: number | null;
  status: 'active' | 'inactive' | 'discontinued';
  description: string | null;
  requirements: string | null;
  equipment: string | null;
  accredited: boolean;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
}

const TestList = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add MaterialRates modal/import logic
  const initialForm = {
    category: '',
    testName: '',
    standard: '',
    testCode: '',
    unit: '',
    priceUgx: null,
    priceUsd: null,
    duration: '',
    accredited: false,
    status: 'active',
    description: '',
    requirements: [],
    equipment: [],
  };

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const data = await getMaterialTests();
        setTests(data);
        setFilteredTests(data);
      } catch (err) {
        console.error('Failed to fetch material tests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  useEffect(() => {
    // Filter tests based on search and filters
    let filtered = tests;

    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.method.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(test => test.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(test => test.status === statusFilter);
    }

    setFilteredTests(filtered);
  }, [tests, searchTerm, categoryFilter, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'discontinued': return 'status-discontinued';
      default: return 'status-default';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const getCategories = () => {
    const categories = [...new Set(tests.map(test => test.category))];
    return categories;
  };

  const handleAddTest = async (test: Test) => {
    setLoading(true);
    try {
      const newTest = await createMaterialTest(test);
      setTests(prev => [...prev, newTest]);
      setFilteredTests(prev => [...prev, newTest]);
    } catch (err) {
      console.error('Failed to add test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTest = async (test: Test) => {
    setLoading(true);
    try {
      const updated = await updateMaterialTest(test.id, test);
      setTests(prev => prev.map(t => t.id === test.id ? updated : t));
      setFilteredTests(prev => prev.map(t => t.id === test.id ? updated : t));
    } catch (err) {
      console.error('Failed to update test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    setLoading(true);
    try {
      await deleteMaterialTest(testId);
      setTests(prev => prev.filter(t => t.id !== testId));
      setFilteredTests(prev => prev.filter(t => t.id !== testId));
    } catch (err) {
      console.error('Failed to delete test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setForm(f => ({ ...f, [name]: value === '' ? null : Number(value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const validateForm = async () => {
    // Check required fields
    if (!form.testCode.trim() || !form.category.trim() || !form.testName.trim() || !form.standard.trim()) {
      setError('Please fill in all required fields.');
      return false;
    }
    // Check types
    if (form.priceUgx !== null && isNaN(Number(form.priceUgx))) {
      setError('Amount (UGX) must be a number.');
      return false;
    }
    if (form.priceUsd !== null && isNaN(Number(form.priceUsd))) {
      setError('Amount (USD) must be a number.');
      return false;
    }
    if (form.duration && isNaN(Number(form.duration))) {
      setError('Lead Time (days) must be a number.');
      return false;
    }
    // Check code uniqueness (client-side, best effort)
    if (tests.some(t => t.code === form.testCode && t.id !== editId)) {
      setError('Test code must be unique.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const isValid = await validateForm();
    if (!isValid) return;
    try {
      // Map frontend form fields to backend API expectations
      const apiData = {
        code: form.testCode.trim(),
        category: form.category.trim(),
        name: form.testName.trim(),
        method: form.standard.trim(),
        accredited: !!form.accredited,
        unit: form.unit.trim() || null,
        priceUgx: form.priceUgx !== null ? Number(form.priceUgx) : null,
        priceUsd: form.priceUsd !== null ? Number(form.priceUsd) : null,
        leadTimeDays: form.duration ? parseInt(form.duration) : null,
        status: form.status,
        description: form.description.trim() || null,
        requirements: Array.isArray(form.requirements) && form.requirements.length > 0 ? JSON.stringify(form.requirements) : null,
        equipment: Array.isArray(form.equipment) && form.equipment.length > 0 ? JSON.stringify(form.equipment) : null,
      };
      let result;
      if (editId) {
        result = await updateMaterialTest(editId, apiData);
        setSuccess('Material test updated successfully!');
      } else {
        result = await createMaterialTest(apiData);
        setSuccess('Material test created successfully!');
      }
      setShowModal(false);
      setForm(initialForm);
      setEditId(null);
      // Immediately update the table
      const data = await getMaterialTests();
      setTests(data);
      setFilteredTests(data);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save material test');
    }
  };

  const handleEdit = (test: any) => {
    setForm({
      category: test.category,
      testName: test.name,
      standard: test.method,
      testCode: test.code,
      unit: test.unit || '',
      priceUgx: test.priceUgx,
      priceUsd: test.priceUsd,
      duration: test.leadTimeDays ? test.leadTimeDays.toString() : '',
      accredited: test.accredited,
      status: test.status,
      description: test.description || '',
      requirements: test.requirements ? JSON.parse(test.requirements) : [],
      equipment: test.equipment ? JSON.parse(test.equipment) : [],
    });
    setEditId(test.id);
    setShowModal(true);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    // Read file for preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      setImportPreview(rows.slice(0, 5)); // Preview first 5 rows
      setShowImportModal(true);
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (!importFile) return;
    setShowImportModal(false);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('replace', replaceMode.toString());
    try {
      const res = await fetch('http://localhost:4000/api/material-tests/import', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      setImportResult(result);
      // Refresh list
      const data = await getMaterialTests();
      setTests(data);
      setFilteredTests(data);
    } catch (err: any) {
      setImportResult({ error: err.message || 'Failed to import material tests' });
    }
    setImportFile(null);
    setImportPreview([]);
    setReplaceMode(false);
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllMaterialTests();
      setTests([]);
      setFilteredTests([]);
      setSuccess('All material tests deleted successfully!');
      setShowDeleteAllConfirm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete all material tests');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportMaterialTests();
      setSuccess('Material tests exported successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to export material tests');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="test-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading tests...</p>
      </div>
    );
  }

  return (
    <div className="test-list">
      <div className="test-list-header">
        <h1>Test Management</h1>
        <p>Manage laboratory tests, standards, and pricing</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by test code, name, category, or standard..."
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
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
          
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Test Actions */}
      <div className="results-summary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <p>Showing {filteredTests.length} test(s)</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => { setShowModal(true); setEditId(null); setForm(initialForm); }}>
            <span>+</span> Add New Test
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleExport}
            disabled={exporting || tests.length === 0}
          >
            {exporting ? 'Exporting...' : '📥 Export Tests'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setShowDeleteAllConfirm(true)}
            disabled={tests.length === 0}
            style={{ backgroundColor: '#dc2626', color: 'white' }}
          >
            🗑️ Delete All
          </button>
          <label className="btn-secondary" style={{ cursor: 'pointer', marginBottom: 0 }}>
            Import Excel
            <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} disabled={importing} />
          </label>
        </div>
      </div>

      {/* Tests Table */}
      <div className="table-container">
        <div className="scroll-table-area">
          <table className="tests-table">
            <thead>
              <tr>
                <th>Material Category</th>
                <th>Test Code</th>
                <th>Material Test</th>
                <th>Test Method(s)</th>
                <th>Test Accreditation Status</th>
                <th>Unit</th>
                <th>Amount (UGX)</th>
                <th>Amount (USD)</th>
                <th>Lead Time (days)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="no-data">
                    No tests found. {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first test!'}
                  </td>
                </tr>
              ) : (
                filteredTests.map(test => (
                  <tr key={test.id}>
                    <td>{test.category}</td>
                    <td><code className="test-code">{test.code}</code></td>
                    <td>{test.name}</td>
                    <td>{test.method}</td>
                    <td>{test.accredited ? 'Test Accredited' : 'Not Accredited'}</td>
                    <td>{test.unit || '-'}</td>
                    <td>{test.priceUgx ? formatCurrency(test.priceUgx) : '-'}</td>
                    <td>{test.priceUsd ? formatUSD(test.priceUsd) : '-'}</td>
                    <td>{test.leadTimeDays ? `${test.leadTimeDays}` : '-'}</td>
                    <td className="actions">
                      <button className="btn-edit" title="Edit Test" onClick={() => handleEdit(test)}>✏️</button>
                      <button className="btn-delete" title="Delete Test" onClick={() => handleDeleteTest(test.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Statistics */}
      <div className="test-statistics">
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-content">
            <h3>{tests.length}</h3>
            <p>Total Tests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{tests.filter(t => t.status === 'active').length}</h3>
            <p>Active Tests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{getCategories().length}</h3>
            <p>Categories</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(tests.reduce((sum, test) => sum + (test.priceUgx || 0), 0))}</h3>
            <p>Total Value</p>
          </div>
        </div>
      </div>

      {/* Material Test Modal */}
      {showModal && (
        <div className="lims-modal">
          <div className="lims-modal-content modern-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon">🧪</div>
                <div>
                  <h2>{editId ? 'Edit Material Test' : 'Add New Material Test'}</h2>
                  <p>Configure test parameters and pricing information</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form className="modern-form" onSubmit={handleSubmit}>
              <div className="form-sections">
                <div className="form-section">
                  <h3 className="section-title"><span className="section-icon">📋</span>Test Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Material Category <span className="required">*</span></label>
                      <input name="category" value={form.category} onChange={handleChange} placeholder="e.g., Coarse Aggregates" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Test Code <span className="required">*</span></label>
                      <input name="testCode" value={form.testCode} onChange={handleChange} placeholder="e.g., CAGG/001" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Material Test <span className="required">*</span></label>
                      <input name="testName" value={form.testName} onChange={handleChange} placeholder="e.g., Moisture Content" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Test Method(s) <span className="required">*</span></label>
                      <input name="standard" value={form.standard} onChange={handleChange} placeholder="e.g., BS 812. Part 109: 1990" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Test Accreditation Status</label>
                      <select name="accredited" value={form.accredited ? 'accredited' : 'not_accredited'} onChange={e => setForm(f => ({ ...f, accredited: e.target.value === 'accredited' }))} className="form-input">
                        <option value="accredited">Test Accredited</option>
                        <option value="not_accredited">Not Accredited</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Unit</label>
                      <input name="unit" value={form.unit} onChange={handleChange} placeholder="e.g., No." className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Amount (UGX)</label>
                      <input name="priceUgx" type="number" value={form.priceUgx ?? ''} onChange={handleChange} placeholder="e.g., 20000" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Amount (USD)</label>
                      <input name="priceUsd" type="number" value={form.priceUsd ?? ''} onChange={handleChange} placeholder="e.g., 6" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lead Time (days)</label>
                      <input name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="e.g., 3" className="form-input" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editId ? 'Update Test' : 'Create Test'}</button>
              </div>
            </form>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="success-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
                {success}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Preview & Confirmation Modal */}
      {showImportModal && (
        <div className="lims-modal">
          <div className="lims-modal-content" style={{ maxWidth: 700 }}>
            <h2>Preview Import</h2>
            <p>Review the first 5 rows. Click Confirm to import.</p>
            
            {/* Replace Mode Checkbox */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={replaceMode} 
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontWeight: 500, color: replaceMode ? '#dc2626' : '#374151' }}>
                  Replace all existing tests with imported data
                </span>
              </label>
              {replaceMode && (
                <p style={{ margin: '8px 0 0 24px', fontSize: '0.875rem', color: '#dc2626' }}>
                  ⚠️ Warning: This will delete all existing tests before importing new ones.
                </p>
              )}
            </div>
            
            <div style={{ maxHeight: 200, overflow: 'auto', marginBottom: 16 }}>
              <table className="tests-table">
                <thead>
                  <tr>
                    <th>Material Category</th>
                    <th>Test Code</th>
                    <th>Material Test</th>
                    <th>Test Method(s)</th>
                    <th>Accreditation Status</th>
                    <th>Unit</th>
                    <th>Amount (UGX)</th>
                    <th>Amount (USD)</th>
                    <th>Lead Time (days)</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row['MATERIAL CATEGORY']}</td>
                      <td>{row['TEST CODE']}</td>
                      <td>{row['MATERIAL TEST']}</td>
                      <td>{row['TEST METHOD(S)']}</td>
                      <td>{row['ACCREDITATION STATUS']}</td>
                      <td>{row['UNIT']}</td>
                      <td>{row['AMOUNT (UGX)']}</td>
                      <td>{row['AMOUNT (USD)']}</td>
                      <td>{row['LEAD TIME (DAYS)']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn-cancel" onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setReplaceMode(false); }}>Cancel</button>
              <button className="btn-save" onClick={handleConfirmImport}>Confirm Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Result/Error Modal */}
      {importResult && (
        <div className="lims-modal">
          <div className="lims-modal-content" style={{ maxWidth: 700 }}>
            <h2>Import Result</h2>
            {importResult.error ? (
              <div className="error-message">{importResult.error}</div>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}>
                  <strong>{importResult.imported}</strong> rows imported, <strong>{importResult.skipped}</strong> skipped.
                </div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div style={{ maxHeight: 200, overflow: 'auto', background: '#fef2f2', color: '#dc2626', padding: 8, borderRadius: 6 }}>
                    <strong>Errors:</strong>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {importResult.errors.map((err: string, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button className="btn-save" onClick={() => setImportResult(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="lims-modal">
          <div className="lims-modal-content" style={{ maxWidth: 500 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h2 style={{ color: '#dc2626', marginBottom: '12px' }}>Delete All Tests</h2>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Are you sure you want to delete all {tests.length} material tests? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowDeleteAllConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleDeleteAll}
                  style={{ backgroundColor: '#dc2626', color: 'white' }}
                >
                  Delete All Tests
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestList;
