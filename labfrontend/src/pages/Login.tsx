import { useState } from 'react';
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

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      // Use Supabase authentication
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) throw new Error(signInError.message);
      
      if (data && data.user) {
        setMessage('Login successful!');
        
        // Fetch user data from our database based on the auth user's ID
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*, role:roleId(name)')
          .eq('auth_id', data.user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching user data:', userError);
        }
        
        // Store user information
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        navigate('/');
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: 18, color: '#1976d2', fontSize: 32 }}>Sign In</h2>
        <form className="lims-form" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            style={inputStyle} 
            autoComplete="username" 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
            style={inputStyle} 
            autoComplete="current-password" 
          />
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {message && <div className="success-msg" style={{ color: '#388e3c', marginTop: 8 }}>{message}</div>}
        {error && <div className="error-msg" style={{ color: '#d32f2f', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: '2em', fontSize: 16 }}>
          <span>Don't have an account? </span>
          <a href="/register" style={linkStyle}>Sign up</a>
        </div>
      </div>
    </section>
  );
};

export default Login;
