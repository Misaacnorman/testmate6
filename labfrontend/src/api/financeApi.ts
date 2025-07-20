import { supabase, handleError } from '../utils/supabaseClient';

// Added for compatibility with components
export interface FinancialTransaction {
  id: number;
  clientId: number;
  amount: number;
  type: string;
  date: string;
  description?: string;
  balance?: number; // Added for compatibility
  client?: Client;  // Added for compatibility
}

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
  balance?: number; // Added for compatibility
}

export interface RevenueReport {
  revenueByMonth: Record<string, { total: number; count: number }>;
}

export interface OutstandingReport {
  invoices: Invoice[];
  totalOutstanding: number;
  overdueInvoices: number;
}

export interface CashFlowReport {
  cashFlowByMonth: Record<string, { total: number; count: number }>;
}

export interface FinanceReport {
  monthlyRevenue: { month: string; amount: number }[];
  paymentMethods: Array<{ method: string; total: number; count: number }>;
  topClients: Array<{ clientId: number; name: string; total: number; count: number }>;
  recentActivity: Array<{ 
    id: string; 
    type: string; 
    date: string; 
    amount: number; 
    clientName: string; 
    description: string 
  }>;
  totalRevenue: number;
  revenueGrowth: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalPayments: number;
  totalPaymentCount: number;
  outstandingAmount: number;
  overdueInvoices: number;
  [key: string]: unknown;
}

// API Functions
export const financeApi = {
  // Client account functions
  async getClientAccount(clientId: number): Promise<ClientAccount> {
    try {
      const { data, error } = await supabase
        .from('ClientAccount')
        .select('*, client:Client(*)')
        .eq('clientId', clientId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  async getClientTransactions(clientId: number, dateFrom?: string, dateTo?: string): Promise<FinancialTransaction[]> {
    try {
      let query = supabase
        .from('FinancialTransaction')
        .select('*, client:Client(*)')
        .eq('clientId', clientId);
      
      if (dateFrom) {
        query = query.gte('date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('date', dateTo);
      }
        
      const { data, error } = await query.order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },

  async getAllTransactions(): Promise<FinancialTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('FinancialTransaction')
        .select('*, client:Client(*)')
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Invoice endpoints
  async getInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .select('*, client:Client(*), invoiceItems:InvoiceItem(*), payments:Payment(*)');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },

  async getInvoiceById(id: number): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .select('*, client:Client(*), invoiceItems:InvoiceItem(*), payments:Payment(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
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
    try {
      // Calculate total amounts
      const itemsTotal = invoiceData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = itemsTotal * 0.18; // Assuming 18% tax
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('Invoice')
        .insert([{
          invoiceNumber: `INV-${Date.now()}`,
          clientId: invoiceData.clientId,
          sampleId: invoiceData.sampleId,
          issuedBy: invoiceData.issuedBy,
          amount: itemsTotal,
          taxAmount,
          totalAmount: itemsTotal + taxAmount,
          currency: 'UGX',
          status: 'pending',
          dueDate: invoiceData.dueDate,
          issuedDate: new Date().toISOString(),
          notes: invoiceData.notes,
          terms: invoiceData.terms
        }])
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Create invoice items
      const invoiceItems = invoiceData.items.map(item => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        testId: item.testId
      }));
      
      const { error: itemsError } = await supabase
        .from('InvoiceItem')
        .insert(invoiceItems);
      
      if (itemsError) throw itemsError;
      
      // Return complete invoice with items
      return this.getInvoiceById(invoice.id);
    } catch (error) {
      return handleError(error);
    }
  },

  async updateInvoice(id: number, updateData: {
    status?: string;
    notes?: string;
    terms?: string;
    dueDate?: string;
  }): Promise<Invoice> {
    try {
      const { error } = await supabase
        .from('Invoice')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Return complete invoice with items
      return this.getInvoiceById(id);
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteInvoice(id: number): Promise<void> {
    try {
      // First delete related invoice items
      const { error: itemsError } = await supabase
        .from('InvoiceItem')
        .delete()
        .eq('invoiceId', id);
        
      if (itemsError) throw itemsError;
      
      // Then delete the invoice
      const { error } = await supabase
        .from('Invoice')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      return handleError(error);
    }
  },

  // Payment endpoints
  async getPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('Payment')
        .select('*, invoice:Invoice(*), receivedByUser:User(*)');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },

  async getPaymentById(id: number): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('Payment')
        .select('*, invoice:Invoice(*), receivedByUser:User(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  async createPayment(paymentData: {
    invoiceId: number;
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
    receivedBy: number;
  }): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('Payment')
        .insert([{
          ...paymentData,
          paymentDate: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update invoice status if fully paid
      const invoice = await this.getInvoiceById(paymentData.invoiceId);
      const allPayments = [...(invoice.payments || []), data];
      const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      if (totalPaid >= invoice.totalAmount) {
        await this.updateInvoice(paymentData.invoiceId, { 
          status: 'paid',
          paidDate: new Date().toISOString()
        });
      }
      
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  async updatePayment(id: number, updateData: {
    notes?: string;
    reference?: string;
  }): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('Payment')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Client account endpoints
  async getClientAccounts(): Promise<ClientAccount[]> {
    try {
      const { data, error } = await supabase
        .from('ClientAccount')
        .select('*, client:Client(*)');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },

  // Report endpoints
  async getRevenueReport(): Promise<RevenueReport> {
    try {
      const { data: invoices, error } = await supabase
        .from('Invoice')
        .select('*')
        .eq('status', 'paid');
        
      if (error) throw error;
      
      // Group by month
      const revenueByMonth: Record<string, { total: number; count: number }> = invoices.reduce((months, inv) => {
        const month = new Date(inv.paidDate || inv.issuedDate).toISOString().substring(0, 7);
        if (!months[month]) {
          months[month] = { total: 0, count: 0 };
        }
        months[month].total += inv.totalAmount;
        months[month].count += 1;
        return months;
      }, {} as Record<string, { total: number; count: number }>);
      
      return { revenueByMonth };
    } catch (error) {
      return handleError(error);
    }
  },

  async getOutstandingReport(): Promise<OutstandingReport> {
    try {
      const { data: invoices, error } = await supabase
        .from('Invoice')
        .select('*, client:Client(*)')
        .in('status', ['pending', 'overdue']);
        
      if (error) throw error;
      
      // Calculate total and count overdue
      const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const now = new Date();
      const overdueInvoices = invoices.filter(inv => new Date(inv.dueDate) < now).length;
      
      return { invoices, totalOutstanding, overdueInvoices };
    } catch (error) {
      return handleError(error);
    }
  },

  async getCashFlowReport(): Promise<CashFlowReport> {
    try {
      const { data: payments, error } = await supabase
        .from('Payment')
        .select('*');
        
      if (error) throw error;
      
      // Group by month
      const cashFlowByMonth: Record<string, { total: number; count: number }> = payments.reduce((months, payment) => {
        const month = new Date(payment.paymentDate).toISOString().substring(0, 7);
        if (!months[month]) {
          months[month] = { total: 0, count: 0 };
        }
        months[month].total += payment.amount;
        months[month].count += 1;
        return months;
      }, {} as Record<string, { total: number; count: number }>);
      
      return { cashFlowByMonth };
    } catch (error) {
      return handleError(error);
    }
  },

  // Client endpoints (using users API for now)
  async getClients(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*, role:Role(*)');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
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

  async getFinanceReports(startDate?: string, endDate?: string): Promise<FinanceReport> {
    try {
      // Get all the necessary data
      const [revenue, , payments, invoices] = await Promise.all([
        this.getRevenueReport(),
        this.getOutstandingReport(), // We get this but don't use it directly, using the data from invoices instead
        this.getPayments(),
        this.getInvoices()
      ]);
      
      // Filter by date range if provided
      let filteredInvoices = invoices;
      let filteredPayments = payments;
      
      if (startDate) {
        filteredInvoices = filteredInvoices.filter(inv => 
          new Date(inv.issuedDate) >= new Date(startDate));
        filteredPayments = filteredPayments.filter(payment => 
          new Date(payment.paymentDate) >= new Date(startDate));
      }
      
      if (endDate) {
        filteredInvoices = filteredInvoices.filter(inv => 
          new Date(inv.issuedDate) <= new Date(endDate));
        filteredPayments = filteredPayments.filter(payment => 
          new Date(payment.paymentDate) <= new Date(endDate));
      }
      
      // Calculate payment methods breakdown
      const paymentMethods = Array.from(
        filteredPayments.reduce((methods, payment) => {
          const method = payment.paymentMethod;
          if (!methods.has(method)) {
            methods.set(method, { method, total: 0, count: 0 });
          }
          const data = methods.get(method)!;
          data.total += payment.amount;
          data.count += 1;
          return methods;
        }, new Map<string, { method: string; total: number; count: number }>())
      ).map(([, data]) => data);
      
      // Calculate top clients
      const clientPayments: Record<number, { clientId: number; name: string; total: number; count: number }> = 
        filteredPayments.reduce((clients, payment) => {
          const clientId = payment.invoice?.clientId;
          if (!clientId) return clients;
          
          if (!clients[clientId]) {
            clients[clientId] = { 
              clientId, 
              name: payment.invoice?.client?.name || 'Unknown',
              total: 0,
              count: 0
            };
          }
          clients[clientId].total += payment.amount;
          clients[clientId].count += 1;
          return clients;
        }, {} as Record<number, { clientId: number; name: string; total: number; count: number }>);
      
      const topClients = Object.values(clientPayments)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      
      // Create recent activity from payments and invoices
      const recentActivity = [
        ...filteredPayments.map(p => ({
          id: `payment-${p.id}`,
          type: 'payment',
          date: p.paymentDate,
          amount: p.amount,
          clientName: p.invoice?.client?.name || 'Unknown',
          description: `Payment received for invoice ${p.invoice?.invoiceNumber || p.invoiceId}`
        })),
        ...filteredInvoices.map(i => ({
          id: `invoice-${i.id}`,
          type: 'invoice',
          date: i.issuedDate,
          amount: i.totalAmount,
          clientName: i.client?.name || 'Unknown',
          description: `Invoice ${i.invoiceNumber} created`
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
       .slice(0, 10);
      
      // Calculate totals
      const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Calculate total invoices by status
      const totalInvoices = filteredInvoices.length;
      const paidInvoices = filteredInvoices.filter(i => i.status === 'paid').length;
      const pendingInvoices = filteredInvoices.filter(i => i.status === 'pending').length;
      
      // Calculate outstandingAmount
      const outstandingAmount = filteredInvoices
        .filter(i => ['pending', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + i.totalAmount, 0);
      
      // Count overdue invoices
      const now = new Date();
      const overdueInvoices = filteredInvoices.filter(i => 
        i.status !== 'paid' && new Date(i.dueDate) < now
      ).length;
      
      // Return complete report
      return {
        monthlyRevenue: Object.entries(revenue.revenueByMonth || {}).map(([month, data]) => ({
          month,
          amount: data.total || 0
        })),
        paymentMethods,
        topClients,
        recentActivity,
        totalRevenue,
        revenueGrowth: 0, // Would need historical data to calculate
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalPayments: totalRevenue,
        totalPaymentCount: filteredPayments.length,
        outstandingAmount,
        overdueInvoices,
      };
    } catch (error) {
      console.error('Error generating finance reports:', error);
      // Return empty data structure on error
      return {
        monthlyRevenue: [],
        paymentMethods: [],
        topClients: [],
        recentActivity: [],
        totalRevenue: 0,
        revenueGrowth: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        totalPayments: 0,
        totalPaymentCount: 0,
        outstandingAmount: 0,
        overdueInvoices: 0,
      };
    }
  },
};