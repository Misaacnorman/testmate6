import { useState } from 'react';
import './Logs.css';

const TABS = [
  'Concrete Cubes',
  'Bricks & Blocks',
  'Pavers',
  'Concrete Cylinders',
  'Water Absorption',
  'Projects',
  'Sample Receipts',
];

const columnsByTab: Record<string, string[]> = {
  'Concrete Cubes': [
    'Date Received', 'Client', 'Project', 'Casting Date', 'Testing Date', 'Class', 'Age (Days)', 'Area of Use', 'Sample ID',
    'Length (mm)', 'Width (mm)', 'Height (mm)', 'Weight (kg)', 'Machine Used', 'Load (kN)',
    'Mode of Failure', 'Temperature (°C)', 'Certificate No.', 'Comment/Remark',
    'Technician', 'Date of Issue', 'Issue ID', 'Taken by', 'Date Taken', 'Contact', 'Receipt No.'
  ],
  'Bricks & Blocks': [
    'Date Received', 'Client', 'Project', 'Casting Date', 'Testing Date', 'Age (Days)', 'Area of Use', 'Sample ID', 'Sample Type',
    'Length (mm)', 'Width (mm)', 'Height (mm)',
    'Hole a No.', 'Hole a L (mm)', 'Hole a W (mm)',
    'Hole b No.', 'Hole b L (mm)', 'Hole b W (mm)',
    'Notch No.', 'Notch L (mm)', 'Notch W (mm)',
    'Weight (kg)', 'Machine Used', 'Load (kN)', 'Mode of Failure', 'Temperature (°C)',
    'Certificate No.', 'Comment/Remark', 'Technician', 'Date of Issue', 'Issue ID',
    'Taken by', 'Date Taken', 'Contact', 'Receipt No.'
  ],
  'Pavers': [
    'Date Received', 'Client', 'Project', 'Casting Date', 'Testing Date', 'Age (Days)', 'Area of Use', 'Sample ID', 'Paver Type',
    'Length (mm)', 'Width (mm)', 'Height (mm)', 'Pavers/m²', 'Area (mm²)',
    'Weight (kg)', 'Machine Used', 'Load (kN)', 'Mode of Failure', 'Temperature (°C)',
    'Certificate No.', 'Comment/Remark', 'Technician', 'Date of Issue', 'Issue ID',
    'Taken by', 'Date Taken', 'Contact', 'Receipt No.'
  ],
  'Concrete Cylinders': [
    'Casting Date', 'Testing Date', 'Class', 'Age (Days)', 'Area of Use', 'Sample ID',
    'Diameter (mm)', 'Height (mm)', 'Weight (kg)', 'Machine Used', 'Load (kN)', 'Mode of Failure',
    'Temperature (°C)', 'Certificate No.', 'Comment/Remark', 'Technician',
    'Date of Issue', 'Issue ID', 'Taken by', 'Date Taken', 'Contact', 'Receipt No.'
  ],
  'Water Absorption': [
    'Date of Receipt', 'Client', 'Project', 'Casting Date', 'Testing Date', 'Age (Days)', 'Area of Use', 'Sample ID', 'Sample Type',
    'Length (mm)', 'Width (mm)', 'Height (mm)',
    'Oven Dried Weight (kg)', 'Weight After Soaking (kg)', 'Water Weight (kg)', 'Water Absorption (%)',
    'Certificate No.', 'Comment/Remark', 'Technician', 'Date of Issue', 'Issue ID',
    'Taken by', 'Date Taken', 'Contact', 'Receipt No.'
  ],
  'Projects': [
    'DATE', 'BIG PROJECT ID', 'SMALL PROJECT ID', 'CLIENT', 'PROJECT',
    'ENGINEER IN CHARGE', 'Field Tests Detail', 'Technician in Charge', 'Start Date', 'End Date', 'Remark(s)',
    'Lab Test Description', 'Technician in Charge', 'Start Date', 'Agreed Delivery', 'Actual Delivery',
    'Signature', 'Remark(s)', 'Acknowledgement', 'Report Issued By', 'Report Delivered To', 'Contact', 'Date and Time'
  ]
};

const keyFiltersByTab: Record<string, { label: string; type: 'text' | 'date' | 'dropdown' | 'range'; options?: string[]; min?: number; max?: number }[]> = {
  'Concrete Cubes': [
    { label: 'Date Received', type: 'date' },
    { label: 'Client', type: 'text' },
    { label: 'Project', type: 'text' },
    { label: 'Sample ID', type: 'text' },
    { label: 'Class', type: 'dropdown', options: ['C15', 'C20', 'C25', 'C30', 'C35', 'C40', 'C45', 'C50'] },
    { label: 'Age (Days)', type: 'range', min: 1, max: 365 },
    { label: 'Technician', type: 'text' },
    { label: 'Status', type: 'dropdown', options: ['Pending', 'In Progress', 'Completed', 'Failed'] },
  ],
  'Bricks & Blocks': [
    { label: 'Date Received', type: 'date' },
    { label: 'Client', type: 'text' },
    { label: 'Project', type: 'text' },
    { label: 'Sample ID', type: 'text' },
    { label: 'Sample Type', type: 'dropdown', options: ['Brick', 'Block', 'Hollow Block', 'Solid Block'] },
    { label: 'Age (Days)', type: 'range', min: 1, max: 365 },
    { label: 'Technician', type: 'text' },
    { label: 'Status', type: 'dropdown', options: ['Pending', 'In Progress', 'Completed', 'Failed'] },
  ],
  'Pavers': [
    { label: 'Date Received', type: 'date' },
    { label: 'Client', type: 'text' },
    { label: 'Project', type: 'text' },
    { label: 'Sample ID', type: 'text' },
    { label: 'Paver Type', type: 'dropdown', options: ['Interlocking', 'Concrete', 'Clay', 'Stone'] },
    { label: 'Age (Days)', type: 'range', min: 1, max: 365 },
    { label: 'Technician', type: 'text' },
    { label: 'Status', type: 'dropdown', options: ['Pending', 'In Progress', 'Completed', 'Failed'] },
  ],
  'Concrete Cylinders': [
    { label: 'Casting Date', type: 'date' },
    { label: 'Testing Date', type: 'date' },
    { label: 'Sample ID', type: 'text' },
    { label: 'Class', type: 'dropdown', options: ['C15', 'C20', 'C25', 'C30', 'C35', 'C40', 'C45', 'C50'] },
    { label: 'Age (Days)', type: 'range', min: 1, max: 365 },
    { label: 'Technician', type: 'text' },
    { label: 'Status', type: 'dropdown', options: ['Pending', 'In Progress', 'Completed', 'Failed'] },
  ],
  'Water Absorption': [
    { label: 'Date of Receipt', type: 'date' },
    { label: 'Client', type: 'text' },
    { label: 'Project', type: 'text' },
    { label: 'Sample ID', type: 'text' },
    { label: 'Sample Type', type: 'dropdown', options: ['Brick', 'Block', 'Tile', 'Stone'] },
    { label: 'Age (Days)', type: 'range', min: 1, max: 365 },
    { label: 'Technician', type: 'text' },
    { label: 'Status', type: 'dropdown', options: ['Pending', 'In Progress', 'Completed', 'Failed'] },
  ],
  'Projects': [
    { label: 'DATE', type: 'date' },
    { label: 'CLIENT', type: 'text' },
    { label: 'PROJECT', type: 'text' },
    { label: 'ENGINEER IN CHARGE', type: 'text' },
    { label: 'Status', type: 'dropdown', options: ['Active', 'Completed', 'On Hold', 'Cancelled'] },
    { label: 'Priority', type: 'dropdown', options: ['Low', 'Medium', 'High', 'Urgent'] },
  ],
};

function EditableTable({ columns, rows, onCellChange, onRemoveRow }: { columns: string[]; rows: any[]; onCellChange: (rowIdx: number, col: string, value: string) => void; onRemoveRow: (rowIdx: number) => void }) {
  const handleCellChange = (rowIdx: number, col: string, value: string) => {
    onCellChange(rowIdx, col, value);
  };

  const handleRemoveRow = (rowIdx: number) => {
    onRemoveRow(rowIdx);
  };

  return (
    <div className="samples-section">
      <div className="samples-header">
        <p>Showing {rows.length} row(s)</p>
      </div>
      <div className="table-container">
        <div className="scroll-table-area-horizontal">
          <div className="scroll-table-area-vertical">
            <table className="samples-table">
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={col}>
                      {index === columns.length - 1 ? (
                        <div className="last-column-header">
                          <span>{col}</span>
                        </div>
                      ) : (
                        col
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="no-data">
                      No data yet. Click "+ Add Row" to begin.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {columns.map(col => (
                        <td key={col}>
                          <input
                            type="text"
                            className="editable-cell"
                            value={row[col]}
                            onChange={e => handleCellChange(rowIdx, col, e.target.value)}
                          />
                        </td>
                      ))}
                      <td>
                        <button className="icon-btn remove-row-btn" onClick={() => handleRemoveRow(rowIdx)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ filters, onFilterChange, onClearFilters, onApplyFilters }: { filters: { label: string; type: string; options?: string[]; min?: number; max?: number }[]; onFilterChange: (label: string, value: any) => void; onClearFilters: () => void; onApplyFilters: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleFilterChange = (label: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [label]: value }));
    onFilterChange(label, value);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    onClearFilters();
  };

  const handleApplyFilters = () => {
    onApplyFilters();
  };

  const activeFiltersCount = Object.keys(filterValues).filter(key => filterValues[key] !== null && filterValues[key] !== '').length;

  return (
    <div className="enhanced-filter-section">
      <div className="filter-header">
        <div className="filter-title">
          <h3>Filters</h3>
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
              ) : f.type === 'range' ? (
                <div className="range-input-group">
                  <input 
                    type="number" 
                    className="filter-input range-input"
                    placeholder={`Min ${f.min}`}
                    min={f.min}
                    max={f.max}
                    value={filterValues[f.label] || ''}
                    onChange={(e) => handleFilterChange(f.label, e.target.value)}
                  />
                  <span className="range-separator">to</span>
                  <input 
                    type="number" 
                    className="filter-input range-input"
                    placeholder={`Max ${f.max}`}
                    min={f.min}
                    max={f.max}
                    value={filterValues[f.label] || ''}
                    onChange={(e) => handleFilterChange(f.label, e.target.value)}
                  />
                </div>
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

// Import the Sample Receipts tab logic
import SampleReceiptsTab from './SampleReceiptsTab';

const Logs = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [rows, setRows] = useState<any[]>([]);

  const handleCellChange = (rowIdx: number, col: string, value: string) => {
    setRows(prev => prev.map((row, idx) => idx === rowIdx ? { ...row, [col]: value } : row));
  };

  const handleRemoveRow = (rowIdx: number) => {
    setRows(prev => prev.filter((_, idx) => idx !== rowIdx));
  };

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h1 className="logs-main-heading">Logs</h1>
        <p className="logs-subtitle">View and manage all laboratory log sheets and sample receipts.</p>
      </div>
      <div className="logs-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="logs-tab-content">
        {TABS.slice(0, -1).map(tab => (
          activeTab === tab && (
            <>
              <div className="tab-header">
                <h2 className="tab-heading">{tab}</h2>
                <p className="tab-description">
                  {tab === 'Concrete Cubes' && 'Record and manage concrete cube test data and results.'}
                  {tab === 'Bricks & Blocks' && 'Track brick and block testing information and specifications.'}
                  {tab === 'Pavers' && 'Manage paver testing data and dimensional specifications.'}
                  {tab === 'Concrete Cylinders' && 'Document concrete cylinder test procedures and outcomes.'}
                  {tab === 'Water Absorption' && 'Record water absorption test data and calculations.'}
                  {tab === 'Projects' && 'Track project information, timelines, and laboratory test details.'}
                </p>
              </div>
              <FilterBar
                filters={keyFiltersByTab[tab] || []}
                onFilterChange={(label, value) => handleCellChange(0, label, value)}
                onClearFilters={() => handleCellChange(0, '', '')}
                onApplyFilters={() => {}}
              />
              {tab === 'Bricks & Blocks' ? (
                <div className="samples-section">
                  <div className="samples-header">
                    <p>Showing {rows.length} row(s)</p>
                  </div>
                  <div className="table-container">
                    <div className="scroll-table-area-horizontal">
                      <div className="scroll-table-area-vertical">
                        <table className="samples-table">
                          <thead>
                            <tr>
                              <th rowSpan={3}>Date Received</th>
                              <th rowSpan={3}>Client</th>
                              <th rowSpan={3}>Project</th>
                              <th rowSpan={3}>Casting Date</th>
                              <th rowSpan={3}>Testing Date</th>
                              <th rowSpan={3}>Age (Days)</th>
                              <th rowSpan={3}>Area of Use</th>
                              <th rowSpan={3}>Sample ID</th>
                              <th rowSpan={3}>Sample Type</th>
                              <th colSpan={3} rowSpan={2}>Dimensions (mm)</th>
                              <th colSpan={9}>Dimensions of Holes & No. for Hollow Blocks</th>
                              <th rowSpan={3}>Weight (kg)</th>
                              <th rowSpan={3}>Machine Used</th>
                              <th rowSpan={3}>Load (kN)</th>
                              <th rowSpan={3}>Mode of Failure</th>
                              <th rowSpan={3}>Temperature (°C)</th>
                              <th rowSpan={3}>Certificate No.</th>
                              <th rowSpan={3}>Comment/Remark</th>
                              <th rowSpan={3}>Technician</th>
                              <th rowSpan={3}>Date of Issue</th>
                              <th rowSpan={3}>Issue ID</th>
                              <th rowSpan={3}>Taken by</th>
                              <th rowSpan={3}>Date Taken</th>
                              <th rowSpan={3}>Contact</th>
                              <th rowSpan={3}>Receipt No.</th>
                              <th rowSpan={3}></th>
                            </tr>
                            <tr>
                              <th colSpan={3}>Hole a</th>
                              <th colSpan={3}>Hole b</th>
                              <th colSpan={3}>Notch</th>
                            </tr>
                            <tr>
                              <th>Length</th>
                              <th>Width</th>
                              <th>Height</th>
                              <th>No.</th>
                              <th>L (mm)</th>
                              <th>W (mm)</th>
                              <th>No.</th>
                              <th>L (mm)</th>
                              <th>W (mm)</th>
                              <th>No.</th>
                              <th>L (mm)</th>
                              <th>W (mm)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.length === 0 ? (
                              <tr>
                                <td colSpan={34} className="no-data">
                                  No data yet. Click "+ Add Row" to begin.
                                </td>
                              </tr>
                            ) : (
                              rows.map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                  {/* Standard fields */}
                                  <td><input type="text" className="editable-cell" value={row['Date Received'] || ''} onChange={e => handleCellChange(rowIdx, 'Date Received', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Client'] || ''} onChange={e => handleCellChange(rowIdx, 'Client', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Project'] || ''} onChange={e => handleCellChange(rowIdx, 'Project', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Casting Date'] || ''} onChange={e => handleCellChange(rowIdx, 'Casting Date', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Testing Date'] || ''} onChange={e => handleCellChange(rowIdx, 'Testing Date', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Age (Days)'] || ''} onChange={e => handleCellChange(rowIdx, 'Age (Days)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Area of Use'] || ''} onChange={e => handleCellChange(rowIdx, 'Area of Use', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Sample ID'] || ''} onChange={e => handleCellChange(rowIdx, 'Sample ID', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Sample Type'] || ''} onChange={e => handleCellChange(rowIdx, 'Sample Type', e.target.value)} /></td>
                                  {/* Dimensions (mm) */}
                                  <td><input type="text" className="editable-cell" value={row['Length (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Length (mm)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Width (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Width (mm)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Height (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Height (mm)', e.target.value)} /></td>
                                  {/* Hole a */}
                                  <td><input type="text" className="editable-cell" value={row['Hole a No.'] || ''} onChange={e => handleCellChange(rowIdx, 'Hole a No.', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Hole a L (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Hole a L (mm)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Hole a W (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Hole a W (mm)', e.target.value)} /></td>
                                  {/* Hole b */}
                                  <td><input type="text" className="editable-cell" value={row['Hole b No.'] || ''} onChange={e => handleCellChange(rowIdx, 'Hole b No.', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Hole b L (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Hole b L (mm)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Hole b W (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Hole b W (mm)', e.target.value)} /></td>
                                  {/* Notch */}
                                  <td><input type="text" className="editable-cell" value={row['Notch No.'] || ''} onChange={e => handleCellChange(rowIdx, 'Notch No.', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Notch L (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Notch L (mm)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Notch W (mm)'] || ''} onChange={e => handleCellChange(rowIdx, 'Notch W (mm)', e.target.value)} /></td>
                                  {/* Remaining fields */}
                                  <td><input type="text" className="editable-cell" value={row['Weight (kg)'] || ''} onChange={e => handleCellChange(rowIdx, 'Weight (kg)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Machine Used'] || ''} onChange={e => handleCellChange(rowIdx, 'Machine Used', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Load (kN)'] || ''} onChange={e => handleCellChange(rowIdx, 'Load (kN)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Mode of Failure'] || ''} onChange={e => handleCellChange(rowIdx, 'Mode of Failure', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Temperature (°C)'] || ''} onChange={e => handleCellChange(rowIdx, 'Temperature (°C)', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Certificate No.'] || ''} onChange={e => handleCellChange(rowIdx, 'Certificate No.', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Comment/Remark'] || ''} onChange={e => handleCellChange(rowIdx, 'Comment/Remark', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Technician'] || ''} onChange={e => handleCellChange(rowIdx, 'Technician', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Date of Issue'] || ''} onChange={e => handleCellChange(rowIdx, 'Date of Issue', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Issue ID'] || ''} onChange={e => handleCellChange(rowIdx, 'Issue ID', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Taken by'] || ''} onChange={e => handleCellChange(rowIdx, 'Taken by', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Date Taken'] || ''} onChange={e => handleCellChange(rowIdx, 'Date Taken', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Contact'] || ''} onChange={e => handleCellChange(rowIdx, 'Contact', e.target.value)} /></td>
                                  <td><input type="text" className="editable-cell" value={row['Receipt No.'] || ''} onChange={e => handleCellChange(rowIdx, 'Receipt No.', e.target.value)} /></td>
                                  <td>
                                    <button className="icon-btn remove-row-btn" onClick={() => handleRemoveRow(rowIdx)}>
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EditableTable
                  columns={columnsByTab[tab]}
                  rows={rows}
                  onCellChange={handleCellChange}
                  onRemoveRow={handleRemoveRow}
                />
              )}
            </>
          )
        ))}
        {activeTab === 'Sample Receipts' && <SampleReceiptsTab />}
      </div>
    </div>
  );
};

export default Logs; 