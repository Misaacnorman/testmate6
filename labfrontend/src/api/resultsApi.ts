import { supabase, handleError } from '../utils/supabaseClient';

interface TestResult {
  id: number;
  sampleId: number;
  testId: number;
  value: number | string;
  unit?: string;
  status: 'pending' | 'in_progress' | 'pass' | 'fail';
  notes?: string;
  testDate: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}

type CreateResultData = Omit<TestResult, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateResultData = Partial<CreateResultData>;

export async function getResults() {
  try {
    const { data, error } = await supabase
      .from('TestResult')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function getResult(id: number) {
  try {
    const { data, error } = await supabase
      .from('TestResult')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function createResult(data: CreateResultData) {
  try {
    const { data: newResult, error } = await supabase
      .from('TestResult')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return newResult;
  } catch (error) {
    return handleError(error);
  }
}

export async function updateResult(id: number, data: UpdateResultData) {
  try {
    const { data: updatedResult, error } = await supabase
      .from('TestResult')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedResult;
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteResult(id: number) {
  try {
    const { data, error } = await supabase
      .from('TestResult')
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