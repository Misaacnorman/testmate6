const API_BASE = 'http://localhost:4000/api/inventory';

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

export async function createInventoryItem(data: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create inventory item');
  return res.json();
}

export async function updateInventoryItem(id: number, data: any) {
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