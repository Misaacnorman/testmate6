import { supabase, handleError } from '../utils/supabaseClient';

interface InventoryItem {
  id: number;
  itemCode: string;
  itemName: string;
  category: 'equipment' | 'supplies' | 'chemicals' | 'glassware' | 'tools';
  description: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  cost: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'maintenance' | 'retired';
  expiryDate?: string;
  calibrationDate?: string;
  nextCalibration?: string;
}

type CreateInventoryItemData = Omit<InventoryItem, 'id' | 'lastUpdated'>;
type UpdateInventoryItemData = Partial<CreateInventoryItemData>;

export async function getInventory() {
  try {
    const { data, error } = await supabase
      .from('Inventory')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function getInventoryItem(id: number) {
  try {
    const { data, error } = await supabase
      .from('Inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function createInventoryItem(data: CreateInventoryItemData) {
  try {
    // Set the lastUpdated field to current timestamp
    const itemWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    
    const { data: newItem, error } = await supabase
      .from('Inventory')
      .insert([itemWithTimestamp])
      .select()
      .single();
    
    if (error) throw error;
    return newItem;
  } catch (error) {
    return handleError(error);
  }
}

export async function updateInventoryItem(id: number, data: UpdateInventoryItemData) {
  try {
    // Set the lastUpdated field to current timestamp
    const updateWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    
    const { data: updatedItem, error } = await supabase
      .from('Inventory')
      .update(updateWithTimestamp)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedItem;
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteInventoryItem(id: number) {
  try {
    const { data, error } = await supabase
      .from('Inventory')
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