import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      // First create the auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
          }
        }
      });

      if (authError) throw new Error(authError.message);
      
      if (authData && authData.user) {
        // Now create the user in our custom User table
        const { error: userError } = await supabase
          .from('User')
          .insert([
            { 
              name: form.name, 
              email: form.email,
              username: form.email.split('@')[0], // Generate a username from email
              auth_id: authData.user.id, 
              department: form.department || null,
              status: 'Active',
              // Fetch the role ID based on the role name
              roleId: await getRoleIdByName(form.role)
            }
          ]);
        
        if (userError) throw new Error(userError.message);
        
        setMessage('Registration successful! Please check your email for verification.');
        setForm({ name: '', email: '', password: '', role: '', department: '' });
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get role ID by name
  const getRoleIdByName = async (roleName: string): Promise<number> => {
    const { data, error } = await supabase
      .from('Role')
      .select('id')
      .eq('name', roleName)
      .single();
    
    if (error) {
      console.error('Error fetching role:', error);
      throw new Error('Invalid role selected');
    }
    
    return data.id;
  };

  return (
    <section style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: 18, color: '#1976d2', fontSize: 32 }}>Sign Up</h2>
        <form className="lims-form" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input 
            name="name" 
            placeholder="Name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            style={inputStyle} 
            autoComplete="username"
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            style={inputStyle} 
            autoComplete="email"
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
            style={inputStyle} 
            autoComplete="new-password"
          />
          <select 
            name="role" 
            value={form.role} 
            onChange={handleChange} 
            required 
            style={selectStyle}
          >
            <option value="">Select Role</option>
            <option value="Super User">Super User</option>
            <option value="Admin">Admin</option>
            <option value="Materials Technician">Materials Technician</option>
            <option value="Materials Engineer">Materials Engineer</option>
            <option value="Business Development Manager">Business Development Manager</option>
            <option value="Client">Client</option>
          </select>
          <input 
            name="department" 
            placeholder="Department (optional)" 
            value={form.department} 
            onChange={handleChange} 
            style={inputStyle}
          />
          <button 
            type="submit" 
            style={buttonStyle} 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
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
