// Added for compatibility with components
export interface FinancialTransaction {
  id: number;
  clientId: number;
  amount: number;
  type: string;
  date: string;
  description?: string;
}
const API_BASE_URL = 'http://localhost:4000/api';

// Types
export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  sampleId?: number;
  issuedBy: number;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  invoiceItems?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  testId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  paymentDate: string;
  receivedBy: number;
  createdAt: string;
  updatedAt: string;
  invoice?: Invoice;
  receivedByUser?: User;
}

export interface Client {
  id: number;
  name: string;
  address?: string;
  contact?: string;
  billingName?: string;
  billingAddress?: string;
  billingContact?: string;
  email?: string;
  phone?: string;
  status: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  sampleDescription?: string;
  sampleStatus?: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  status: string;
  phoneNumber?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  department?: string;
  roleId: number;
  customPermissions?: string;
  role?: Role;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientAccount {
  id: number;
  clientId: number;
  creditLimit: number;
  currentBalance: number;
  paymentTerms: string;
  taxExempt: boolean;
  taxNumber?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface RevenueReport {
  revenueByMonth: Record<string, any>;
}

export interface OutstandingReport {
  invoices: Invoice[];
  totalOutstanding: number;
  overdueInvoices: number;
}

export interface CashFlowReport {
  cashFlowByMonth: Record<string, any>;
}

export interface FinanceReport {
  monthlyRevenue: { month: string; amount: number }[];
  paymentMethods: any[];
  topClients: any[];
  recentActivity: any[];
  totalRevenue: number;
  revenueGrowth: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalPayments: number;
  totalPaymentCount: number;
  outstandingAmount: number;
  overdueInvoices: number;
  [key: string]: any;
}

// API Functions
export const financeApi = {
  // Stub: Get a single client account by ID
  async getClientAccount(clientId: number): Promise<ClientAccount> {
    // This is a stub. Replace with real API call if needed.
    const accounts = await this.getClientAccounts();
    const account = accounts.find(acc => acc.clientId === clientId);
    if (!account) throw new Error('Client account not found');
    return account;
  },

  // Stub: Get client transactions
  async getClientTransactions(clientId: number, _dateFrom?: string, _dateTo?: string): Promise<FinancialTransaction[]> {
    // This is a stub. Replace with real API call if needed.
    return [
      {
        id: 1,
        clientId,
        amount: 1000,
        type: 'credit',
        date: new Date().toISOString(),
        description: 'Sample transaction',
      },
    ];
  },

  // Stub: Get all transactions
  async getAllTransactions(): Promise<FinancialTransaction[]> {
    // This is a stub. Replace with real API call if needed.
    return [
      {
        id: 1,
        clientId: 1,
        amount: 1000,
        type: 'credit',
        date: new Date().toISOString(),
        description: 'Sample transaction',
      },
    ];
  },
  // Invoice endpoints
  async getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/finance/invoices`);
    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.statusText}`);
    }
    return response.json();
  },

  async getInvoiceById(id: number): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/finance/invoices/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch invoice: ${response.statusText}`);
    }
    return response.json();
  },

  async createInvoice(invoiceData: {
    clientId: number;
    sampleId?: number;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      testId?: number;
    }>;
    dueDate: string;
    notes?: string;
    terms?: string;
    issuedBy: number;
  }): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/finance/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create invoice: ${error.details || error.error || response.statusText}`);
    }
    return response.json();
  },

  async updateInvoice(id: number, updateData: {
    status?: string;
    notes?: string;
    terms?: string;
    dueDate?: string;
  }): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/finance/invoices/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update invoice: ${error.details || error.error || response.statusText}`);
    }
    return response.json();
  },

  async deleteInvoice(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/finance/invoices/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete invoice: ${error.details || error.error || response.statusText}`);
    }
  },

  // Payment endpoints
  async getPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/finance/payments`);
    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.statusText}`);
    }
    return response.json();
  },

  async getPaymentById(id: number): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/finance/payments/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch payment: ${response.statusText}`);
    }
    return response.json();
  },

  async createPayment(paymentData: {
    invoiceId: number;
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
    receivedBy: number;
  }): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/finance/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create payment: ${error.details || error.error || response.statusText}`);
    }
    return response.json();
  },

  async updatePayment(id: number, updateData: {
    notes?: string;
    reference?: string;
  }): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/finance/payments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update payment: ${error.details || error.error || response.statusText}`);
    }
    return response.json();
  },

  // Client account endpoints
  async getClientAccounts(): Promise<ClientAccount[]> {
    const response = await fetch(`${API_BASE_URL}/finance/accounts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch client accounts: ${response.statusText}`);
    }
    return response.json();
  },

  // Report endpoints
  async getRevenueReport(): Promise<RevenueReport> {
    const response = await fetch(`${API_BASE_URL}/finance/reports/revenue`);
    if (!response.ok) {
      throw new Error(`Failed to fetch revenue report: ${response.statusText}`);
    }
    return response.json();
  },

  async getOutstandingReport(): Promise<OutstandingReport> {
    const response = await fetch(`${API_BASE_URL}/finance/reports/outstanding`);
    if (!response.ok) {
      throw new Error(`Failed to fetch outstanding report: ${response.statusText}`);
    }
    return response.json();
  },

  async getCashFlowReport(): Promise<CashFlowReport> {
    const response = await fetch(`${API_BASE_URL}/finance/reports/cashflow`);
    if (!response.ok) {
      throw new Error(`Failed to fetch cash flow report: ${response.statusText}`);
    }
    return response.json();
  },

  // Client endpoints (using users API for now)
  async getClients(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }
    return response.json();
  },

  // Utility functions
  formatCurrency(amount: number, currency: string = 'UGX'): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  },

  getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  },

  async getFinanceReports(_startDate?: string, _endDate?: string): Promise<FinanceReport> {
    // Optionally, you can add date filtering if your backend supports it
    const [revenue, outstanding, cashflow] = await Promise.all([
      fetch('/api/finance/reports/revenue').then(r => r.json()),
      fetch('/api/finance/reports/outstanding').then(r => r.json()),
      fetch('/api/finance/reports/cashflow').then(r => r.json()),
    ]);
    // Compose a single object for the FinanceReports component
    return {
      ...revenue,
      ...outstanding,
      ...cashflow,
      monthlyRevenue: Object.entries(revenue.revenueByMonth || {}).map(([month, data]: any) => ({
        month,
        amount: data.total || 0
      })),
      paymentMethods: [], // Fill with real data if available
      topClients: [], // Fill with real data if available
      recentActivity: [], // Fill with real data if available
      totalRevenue: Object.values(revenue.revenueByMonth || {}).reduce((sum: number, d: any) => sum + (d.total || 0), 0),
      revenueGrowth: 0, // Placeholder
      totalInvoices: 0, // Placeholder
      paidInvoices: 0, // Placeholder
      pendingInvoices: 0, // Placeholder
      totalPayments: 0, // Placeholder
      totalPaymentCount: 0, // Placeholder
      outstandingAmount: 0, // Placeholder
      overdueInvoices: 0, // Placeholder
    };
  },
}; 