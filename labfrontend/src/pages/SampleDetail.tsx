import { useEffect, useState } from 'react';

interface Sample {
  id: number;
  projectId: number;
  clientId: number;
  assignedTo?: number;
  status: string;
  receivedDate: string;
  deliveryInfo?: string;
  notes?: string;
  // Add more fields as needed
}

const SampleDetail = ({ sampleId }: { sampleId: number }) => {
  const [sample, setSample] = useState<Sample | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/samples/${sampleId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setSample(data);
        else setError('Sample not found');
      })
      .catch(() => setError('Failed to fetch sample'));
  }, [sampleId]);

  if (error) return <div className="error-msg">{error}</div>;
  if (!sample) return <div>Loading...</div>;

  return (
    <section>
      <h2>Sample Detail</h2>
      <ul>
        <li><b>ID:</b> {sample.id}</li>
        <li><b>Project:</b> {sample.projectId}</li>
        <li><b>Client:</b> {sample.clientId}</li>
        <li><b>Status:</b> {sample.status}</li>
        <li><b>Received Date:</b> {sample.receivedDate?.split('T')[0]}</li>
        <li><b>Assigned To:</b> {sample.assignedTo || '-'}</li>
        <li><b>Delivery Info:</b> {sample.deliveryInfo || '-'}</li>
        <li><b>Notes:</b> {sample.notes || '-'}</li>
      </ul>
    </section>
  );
};

export default SampleDetail; 