const API_BASE_URL = 'http://localhost:4000/api';

// Types for sample receipts
export interface SampleReceipt {
  id: number;
  sampleReceiptNumber: string;
  dateOfReceipt: string;
  clientName: string;
  project: string;
  receivedBy: string;
  type: 'regular' | 'special';
  createdAt: string;
}

// Sample Receipts API
export const getSampleReceipts = async (filters?: {
  dateFrom?: string;
  dateTo?: string;
  client?: string;
  project?: string;
  receivedBy?: string;
  search?: string;
}): Promise<SampleReceipt[]> => {
  const params = new URLSearchParams();
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.client) params.append('client', filters.client);
  if (filters?.project) params.append('project', filters.project);
  if (filters?.receivedBy) params.append('receivedBy', filters.receivedBy);
  if (filters?.search) params.append('search', filters.search);

  const url = `${API_BASE_URL}/sample-logs/receipts?${params.toString()}`;
  console.log('API URL:', url);
  
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    throw new Error(error.error || 'Failed to fetch sample receipts');
  }

  const data = await response.json();
  console.log('API Response data:', data);
  return data;
};

// Download sample receipt PDF
export const downloadSampleReceipt = async (sampleId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/samples/${sampleId}/receipt`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to download receipt');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sample-receipt-${sampleId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}; 