const API_BASE = 'http://localhost:4000/api/reports';

interface Report {
  id: number;
  title: string;
  description?: string;
  type: 'financial' | 'technical' | 'inventory' | 'summary';
  dateRange?: { start: string; end: string };
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

type CreateReportData = Omit<Report, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateReportData = Partial<CreateReportData>;

export async function getReports() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function getReport(id: number) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function createReport(data: CreateReportData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create report');
  return res.json();
}

export async function updateReport(id: number, data: UpdateReportData) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update report');
  return res.json();
}

export async function deleteReport(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete report');
  return res.json();
} 