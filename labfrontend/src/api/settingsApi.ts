import { supabase, handleError } from '../utils/supabaseClient';

interface Setting {
  id: number;
  key: string;
  value: string | number | boolean;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

type CreateSettingData = Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateSettingData = Partial<CreateSettingData>;

export async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('Setting')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function getSetting(id: number) {
  try {
    const { data, error } = await supabase
      .from('Setting')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function createSetting(data: CreateSettingData) {
  try {
    const { data: newSetting, error } = await supabase
      .from('Setting')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return newSetting;
  } catch (error) {
    return handleError(error);
  }
}

export async function updateSetting(id: number, data: UpdateSettingData) {
  try {
    const { data: updatedSetting, error } = await supabase
      .from('Setting')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedSetting;
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteSetting(id: number) {
  try {
    const { data, error } = await supabase
      .from('Setting')
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