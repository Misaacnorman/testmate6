const API_BASE = 'http://localhost:4000/api/settings';

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
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function getSetting(id: number) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch setting');
  return res.json();
}

export async function createSetting(data: CreateSettingData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create setting');
  return res.json();
}

export async function updateSetting(id: number, data: UpdateSettingData) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update setting');
  return res.json();
}

export async function deleteSetting(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete setting');
  return res.json();
} 