const API_BASE = 'http://localhost:4000/api/material-tests';

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
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch material tests');
  return res.json();
}

export async function getMaterialTest(id: number) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch material test');
  return res.json();
}

export async function createMaterialTest(data: CreateMaterialTestData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create material test');
  return res.json();
}

export async function updateMaterialTest(id: number, data: UpdateMaterialTestData) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update material test');
  return res.json();
}

export async function deleteMaterialTest(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete material test');
  return res.json();
}

export async function deleteAllMaterialTests() {
  const res = await fetch(`${API_BASE}/all`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete all material tests');
  return res.json();
}

export async function exportMaterialTests() {
  const res = await fetch(`${API_BASE}/export`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error('Failed to export material tests');
  
  // Create blob and download
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'material-tests-export.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  return { success: true };
}

export async function getMaterialCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch material categories');
  return res.json();
}

export async function getMaterialTestsByCategory(category: string) {
  const res = await fetch(`${API_BASE}?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error('Failed to fetch material tests for category');
  return res.json();
} 