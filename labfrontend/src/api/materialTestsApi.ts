import { supabase, handleError } from '../utils/supabaseClient';

interface MaterialTest {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  procedure?: string | null;
  equipment?: string | null;
  duration?: number | null;
  cost?: number | null;
  createdAt: string;
  updatedAt: string;
}

type CreateMaterialTestData = Omit<MaterialTest, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateMaterialTestData = Partial<CreateMaterialTestData>;

export async function getMaterialTests() {
  try {
    const { data, error } = await supabase
      .from('MaterialTest')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function getMaterialTest(id: number) {
  try {
    const { data, error } = await supabase
      .from('MaterialTest')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function createMaterialTest(data: CreateMaterialTestData) {
  try {
    const { data: newTest, error } = await supabase
      .from('MaterialTest')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return newTest;
  } catch (error) {
    return handleError(error);
  }
}

export async function updateMaterialTest(id: number, data: UpdateMaterialTestData) {
  try {
    const { data: updatedTest, error } = await supabase
      .from('MaterialTest')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedTest;
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteMaterialTest(id: number) {
  try {
    const { data, error } = await supabase
      .from('MaterialTest')
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

export async function deleteAllMaterialTests() {
  try {
    const { data, error }: { data: MaterialTest[] | null, error: any } = await supabase
      .from('MaterialTest')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (error) throw error;
    return { success: true, count: Array.isArray(data) && data ? (data as MaterialTest[]).length : 0 };
  } catch (error) {
    return handleError(error);
  }
}

export async function exportMaterialTests() {
  try {
    // Get all material tests
    const { data, error } = await supabase
      .from('MaterialTest')
      .select('*');
    
    if (error) throw error;
    
    // Convert to XLSX format (this would typically require a library like xlsx)
    // For demo purposes, we'll create a CSV as text/csv blob
    const headers = ['id', 'name', 'category', 'description', 'procedure', 'equipment', 'duration', 'cost', 'createdAt', 'updatedAt'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => 
          item[header] !== null && item[header] !== undefined ? 
          `"${String(item[header]).replace(/"/g, '""')}"` : 
          ''
        ).join(',')
      )
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'material-tests-export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function getMaterialCategories() {
  try {
    // Get distinct categories
    const { data, error } = await supabase
      .from('MaterialTest')
      .select('category')
      .order('category');
    
    if (error) throw error;
    
    // Extract unique categories
    const uniqueCategories = [...new Set(data.map(item => item.category))];
    return uniqueCategories;
  } catch (error) {
    return handleError(error);
  }
}

export async function getMaterialTestsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('MaterialTest')
      .select('*')
      .eq('category', category);
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}