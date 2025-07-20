import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api/users';

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
  width: '100%',
  margin: '0 auto',
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
  padding: '3em 2em 2.5em 2em',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: 16,
  padding: '0.9em',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: '#fff',
  color: '#222',
  fontSize: 16,
  boxSizing: 'border-box',
};
const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '1em',
  borderRadius: 8,
  border: 'none',
  background: '#1976d2',
  color: '#fff',
  fontWeight: 600,
  fontSize: 17,
  marginBottom: 10,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
const avatarBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 24,
  gap: 18,
};
const avatarStyle: React.CSSProperties = {
  width: 90,
  height: 90,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #e0e7ff',
  background: '#f5f7fa',
};
const fileButtonStyle: React.CSSProperties = {
  padding: '0.6em 1.2em',
  borderRadius: 6,
  border: '1px solid #ccc',
  background: '#f5f7fa',
  color: '#222',
  fontWeight: 500,
  fontSize: 15,
  cursor: 'pointer',
  marginRight: 10,
};
const fileNameStyle: React.CSSProperties = {
  color: '#222',
  fontSize: 15,
  fontWeight: 400,
  marginTop: 2,
};

const Profile = () => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setName(data.name || '');
        setDepartment(data.department || '');
        setUserId(data.id);
      } catch {
        setMessage('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, department }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setMessage('Profile updated!');
    } catch {
      setMessage('Failed to update profile');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: password }),
      });
      if (!res.ok) throw new Error('Failed to reset password');
      setMessage('Password reset!');
      setPassword('');
    } catch {
      setMessage('Failed to reset password');
    }
  };

  return (
    <section style={containerStyle}>
      <div style={cardStyle}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 17, marginBottom: 10, cursor: 'pointer', alignSelf: 'flex-start' }}>
          ← Back
        </button>
        <h2 style={{ color: '#1976d2', marginBottom: 28, fontSize: 30, textAlign: 'center' }}>Profile</h2>
        <form onSubmit={handleProfileSave} style={{ marginBottom: 36 }}>
          <div style={avatarBoxStyle}>
            <img src={avatar || 'https://ui-avatars.com/api/?name=User'} alt="avatar" style={avatarStyle} />
            <div>
              <button type="button" style={fileButtonStyle} onClick={() => fileInputRef.current?.click()}>
                Choose File
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              {fileName && <div style={fileNameStyle}>{fileName}</div>}
            </div>
          </div>
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} style={inputStyle} />
          <button type="submit" style={buttonStyle}>Save Profile</button>
        </form>
        <form onSubmit={handlePasswordReset}>
          <h3 style={{ marginBottom: 16, fontWeight: 600, color: '#1976d2' }}>Reset Password</h3>
          <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          <button type="submit" style={buttonStyle}>Reset Password</button>
        </form>
        {message && <div style={{ marginTop: 18, color: '#388e3c', textAlign: 'center' }}>{message}</div>}
      </div>
    </section>
  );
};

export default Profile; 