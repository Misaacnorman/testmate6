const API_BASE = 'http://localhost:4000/api/users';
const ROLE_BASE = 'http://localhost:4000/api/roles';
const PERM_BASE = 'http://localhost:4000/api/permissions';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  status: string;
  role?: {
    name: string;
  };
}

export async function getUsers() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getUser(id: number) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function createUser(data: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to create user' }));
    throw new Error(errorData.error || 'Failed to create user');
  }
  return res.json();
}

export async function updateUser(id: number, data: any) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to update user' }));
    throw new Error(errorData.error || 'Failed to update user');
  }
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

// --- Role and Permission Management ---
export async function getRoles() {
  const res = await fetch(ROLE_BASE);
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}

export async function getRole(id: number) {
  const res = await fetch(`${ROLE_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch role');
  return res.json();
}

export async function createRole(data: any) {
  const res = await fetch(ROLE_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create role');
  return res.json();
}

export async function updateRole(id: number, data: any) {
  const res = await fetch(`${ROLE_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update role');
  return res.json();
}

export async function deleteRole(id: number) {
  const res = await fetch(`${ROLE_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete role');
  return res.json();
}

export async function getPermissions() {
  const res = await fetch(PERM_BASE);
  if (!res.ok) throw new Error('Failed to fetch permissions');
  return res.json();
}

// Get users by role level (for sample logs)
export const getUsersByRoleLevel = async (level: string): Promise<User[]> => {
  const response = await fetch(`${API_BASE}/by-role/${level}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch users by role level');
  }

  return response.json();
}; 