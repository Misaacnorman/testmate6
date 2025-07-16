const API_BASE = 'http://localhost:4000/api/inventory';

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
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function getInventoryItem(id: number) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch inventory item');
  return res.json();
}

export async function createInventoryItem(data: CreateInventoryItemData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create inventory item');
  return res.json();
}

export async function updateInventoryItem(id: number, data: UpdateInventoryItemData) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update inventory item');
  return res.json();
}

export async function deleteInventoryItem(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete inventory item');
  return res.json();
} 