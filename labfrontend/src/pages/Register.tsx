import React, { useState } from 'react';

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(120deg, #e0e7ff 0%, #f5f7fa 100%)',
};
const cardStyle: React.CSSProperties = {
  maxWidth: 500,
  minWidth: 350,
  width: '100%',
  padding: '3em 3em 2.5em 3em',
  borderRadius: 16,
  boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '1em',
  margin: '0.7em 0',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 18,
  background: '#fff',
  color: '#222',
};
const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '1em',
  margin: '0.7em 0',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 18,
  background: '#fff',
  color: '#222',
};
const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '1em',
  margin: '1.2em 0 0.7em 0',
  borderRadius: 8,
  border: 'none',
  background: '#1976d2',
  color: '#fff',
  fontWeight: 600,
  fontSize: 18,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
const linkStyle: React.CSSProperties = {
  color: '#1976d2',
  textDecoration: 'none',
  fontWeight: 500,
  cursor: 'pointer',
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', department: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setMessage(data.message);
      setForm({ name: '', email: '', password: '', role: '', department: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <section style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: 18, color: '#1976d2', fontSize: 32 }}>Sign Up</h2>
        <form className="lims-form" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={inputStyle} autoComplete="username" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={inputStyle} autoComplete="email" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} autoComplete="new-password" />
          <select name="role" value={form.role} onChange={handleChange} required style={selectStyle}>
            <option value="">Select Role</option>
            <option value="Super User">Super User</option>
            <option value="Admin">Admin</option>
            <option value="Materials Technician">Materials Technician</option>
            <option value="Materials Engineer">Materials Engineer</option>
            <option value="Finance Department">Finance Department</option>
            <option value="Business Development Manager">Business Development Manager</option>
            <option value="Client">Client</option>
          </select>
          <input name="department" placeholder="Department (optional)" value={form.department} onChange={handleChange} style={inputStyle} />
          <button type="submit" style={buttonStyle}>Sign Up</button>
        </form>
        {message && <div className="success-msg" style={{ color: '#388e3c', marginTop: 8 }}>{message}</div>}
        {error && <div className="error-msg" style={{ color: '#d32f2f', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: '2em', fontSize: 16 }}>
          <span>Already have an account? </span>
          <a href="/login" style={linkStyle}>Sign in</a>
        </div>
      </div>
    </section>
  );
};

export default Register;
