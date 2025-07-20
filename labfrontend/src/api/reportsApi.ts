import { supabase, handleError } from '../utils/supabaseClient';

interface Report {
  id: number;
  title: string;
  description?: string;
  type: 'financial' | 'technical' | 'inventory' | 'summary';
  dateRange?: { start: string; end: string };
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

type CreateReportData = Omit<Report, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateReportData = Partial<CreateReportData>;

export async function getReports() {
  try {
    const { data, error } = await supabase
      .from('Report')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function getReport(id: number) {
  try {
    const { data, error } = await supabase
      .from('Report')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function createReport(data: CreateReportData) {
  try {
    const { data: newReport, error } = await supabase
      .from('Report')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return newReport;
  } catch (error) {
    return handleError(error);
  }
}

export async function updateReport(id: number, data: UpdateReportData) {
  try {
    const { data: updatedReport, error } = await supabase
      .from('Report')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedReport;
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteReport(id: number) {
  try {
    const { data, error } = await supabase
      .from('Report')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}