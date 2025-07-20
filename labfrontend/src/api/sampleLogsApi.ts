import { supabase, handleError } from '../utils/supabaseClient';

// Types for sample receipts
export interface SampleReceipt {
  id: number;
  sampleReceiptNumber: string;
  dateOfReceipt: string;
  clientName: string;
  project: string;
  receivedBy: string;
  type: 'regular' | 'special';
  createdAt: string;
}

// Sample Receipts API
export const getSampleReceipts = async (filters?: {
  dateFrom?: string;
  dateTo?: string;
  client?: string;
  project?: string;
  receivedBy?: string;
  search?: string;
}): Promise<SampleReceipt[]> => {
  try {
    let query = supabase
      .from('SampleReceipt')
      .select('*');
    
    // Apply filters
    if (filters?.dateFrom) {
      query = query.gte('dateOfReceipt', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('dateOfReceipt', filters.dateTo);
    }
    if (filters?.client) {
      query = query.eq('clientName', filters.client);
    }
    if (filters?.project) {
      query = query.eq('project', filters.project);
    }
    if (filters?.receivedBy) {
      query = query.eq('receivedBy', filters.receivedBy);
    }
    if (filters?.search) {
      query = query.or(`sampleReceiptNumber.ilike.%${filters.search}%,clientName.ilike.%${filters.search}%,project.ilike.%${filters.search}%`);
    }
    
    console.log('Executing Supabase query');
    
    const { data, error } = await query;
    
    console.log('Response data:', data);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return handleError(error);
  }
};

// Download sample receipt PDF
export const downloadSampleReceipt = async (sampleId: number): Promise<void> => {
  try {
    // First get file path from database
    const { data: receipt, error: fetchError } = await supabase
      .from('SampleReceipt')
      .select('receipt_file_path')
      .eq('id', sampleId)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!receipt?.receipt_file_path) {
      throw new Error('Receipt file not found');
    }
    
    // Then download the file from storage
    const { data, error: downloadError } = await supabase
      .storage
      .from('receipts')
      .download(receipt.receipt_file_path);
    
    if (downloadError) throw downloadError;
    
    // Create download link
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample-receipt-${sampleId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    return handleError(error);
  }
};