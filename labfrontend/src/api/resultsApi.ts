const API_BASE = 'http://localhost:4000/api/results';

export async function getResults() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch results');
  return res.json();
}

export async function getResult(id: number) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch result');
  return res.json();
}

export async function createResult(data: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create result');
  return res.json();
}

export async function updateResult(id: number, data: any) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update result');
  return res.json();
}

export async function deleteResult(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete result');
  return res.json();
} 