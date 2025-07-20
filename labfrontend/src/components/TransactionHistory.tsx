// This file has been removed as TransactionHistory is obsolete after finance/inventory module deletion.

// The entire TransactionHistory component has been removed.

// import React, { useState, useEffect, useCallback } from 'react';
// 
// const TransactionHistory: React.FC = () => {
// 
// 
// 
//   return (
//     <div className="transaction-history">
//       <h2>Transaction History</h2>
//       <div className="filters">
//         <label>Type:
//           <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
//             <option value="all">All</option>
//             <option value="invoice">Invoice</option>
//             <option value="payment">Payment</option>
//             <option value="adjustment">Adjustment</option>
//           </select>
//         </label>
//         <label>Client:
//           <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
//             <option value="all">All</option>
//             {clients.map(client => (
//               <option key={client.id} value={client.id}>{client.name}</option>
//             ))}
//           </select>
//         </label>
//         <label>From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
//         <label>To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
//         <button className="btn-secondary" onClick={fetchTransactions}>Refresh</button>
//       </div>
//       {loading ? (
//         <div>Loading...</div>
//       ) : error ? (
//         <div className="error-message">{error}</div>
//       ) : (
//         <table className="finance-table">
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Type</th>
//               <th>Client</th>
//               <th>Description</th>
//               <th>Amount</th>
//               <th>Balance</th>
//             </tr>
//           </thead>
//           <tbody>
//             {transactions.map(tx => (
//               <tr key={tx.id}>
//                 <td>{new Date(tx.date).toLocaleDateString()}</td>
//                 <td>{tx.type}</td>
//                 <td>{tx.client?.name || '-'}</td>
//                 <td>{tx.description}</td>
//                 <td>{financeApi.formatCurrency(tx.amount)}</td>
//                 <td>{financeApi.formatCurrency(tx.balance ?? 0)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };
// 
// export default TransactionHistory;
import React, { useState, useEffect, useCallback } from 'react';

const TransactionHistory: React.FC = () => {




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
                <td>{financeApi.formatCurrency(tx.balance ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionHistory; 