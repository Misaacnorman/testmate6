import React, { useState, useEffect } from 'react';
import './UserRoleAdmin.css';
import { getUsers, getRoles, getPermissions, createRole, updateRole, deleteRole, createUser, updateUser, deleteUser } from '../api/usersApi';

// --- Types ---
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  department: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  phoneNumber: string;
  roleId: number;
  role?: Role;
  customPermissions: string[];
}
interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}
interface Permission {
  id: number;
  key: string;
  description: string;
}

const ROLE_ICONS: Record<string, string> = {
  'Level 01': '1️⃣',
  'Level 02': '2️⃣',
  'Level 03': '3️⃣',
  'Level 04': '4️⃣',
  'Level 05': '5️⃣',
  'Super User': '⭐',
  'Accounts': '💼',
};
const STATUS_ICONS: Record<string, string> = {
  active: '✅',
  inactive: '🚫',
  suspended: '⏸️',
};

const UserRoleAdmin: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'users'|'roles'|'permissions'|'matrix'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<{ name: string; description: string; permissions: string[]; isSystemRole: boolean }>({ name: '', description: '', permissions: [], isSystemRole: false });
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<any>({
    name: '',
    email: '',
    username: '',
    department: '',
    status: 'active',
    password: '',
    roleId: '',
    customPermissions: [],
  });
  const [userModalError, setUserModalError] = useState<string | null>(null);

  // --- Fetch data ---
  useEffect(() => {
    setLoading(true);
    Promise.all([getUsers(), getRoles(), getPermissions()])
      .then(([users, roles, perms]) => {
        setUsers(users);
        setRoles(roles);
        setPermissions(perms);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      });
  }, []);

  // --- Role Modal Handlers ---
  const openAddRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', description: '', permissions: [], isSystemRole: false });
    setShowRoleModal(true);
  };
  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: Array.isArray(role.permissions) ? role.permissions : JSON.parse(role.permissions as any),
      isSystemRole: role.isSystemRole,
    });
    setShowRoleModal(true);
  };
  const handleRoleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setRoleForm(f => ({ ...f, [name]: e.target.checked }));
    } else {
      setRoleForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleRolePermToggle = (permKey: string) => {
    setRoleForm(f => ({ ...f, permissions: f.permissions.includes(permKey) ? f.permissions.filter(p => p !== permKey) : [...f.permissions, permKey] }));
  };
  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, { ...roleForm });
      } else {
        await createRole(roleForm);
      }
      setRoles(await getRoles());
      setShowRoleModal(false);
    } catch (err) {
      alert('Failed to save role');
    }
  };
  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm('Delete this role?')) return;
    try {
      await deleteRole(roleId);
      setRoles(await getRoles());
    } catch (err) {
      alert('Failed to delete role');
    }
  };

  // --- User Modal Handlers ---
  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', username: '', department: '', status: 'active', password: '', roleId: '', customPermissions: [] });
    setShowUserModal(true);
    setUserModalError(null);
  };
  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      username: user.username,
      department: user.department,
      status: user.status,
      password: '',
      roleId: String(user.roleId),
      customPermissions: user.customPermissions ? (Array.isArray(user.customPermissions) ? user.customPermissions : JSON.parse(user.customPermissions)) : [],
    });
    setShowUserModal(true);
    setUserModalError(null);
  };
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm((f: any) => ({ ...f, [name]: value }));
  };
  const handleUserPermToggle = (permKey: string) => {
    setUserForm((f: any) => ({ ...f, customPermissions: f.customPermissions.includes(permKey) ? f.customPermissions.filter((p: string) => p !== permKey) : [...f.customPermissions, permKey] }));
  };
  const handleSaveUser = async () => {
    setUserModalError(null);
    try {
      // Check for missing required fields with specific messages
      if (!userForm.name?.trim()) {
        setUserModalError('Name is required.');
        return;
      }
      if (!userForm.email?.trim()) {
        setUserModalError('Email is required.');
        return;
      }
      if (!userForm.roleId || userForm.roleId === '') {
        setUserModalError('Please select a role for the user.');
        return;
      }
      if (!editingUser && !userForm.password?.trim()) {
        setUserModalError('Password is required for new users.');
        return;
      }
      
      // Convert roleId to number for backend
      const userData = {
        ...userForm,
        roleId: Number(userForm.roleId),
        customPermissions: userForm.customPermissions
      };
      
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      setUsers(await getUsers());
      setShowUserModal(false);
    } catch (err: any) {
      setUserModalError(err.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await deleteUser(userId);
      setUsers(await getUsers());
    } catch (err: any) {
      alert('Failed to delete user: ' + (err.message || 'Unknown error'));
    }
  };

  // --- Render ---
  if (loading) return <div className="user-management-loading"><div className="loading-spinner"></div><p>Loading...</p></div>;
  if (error) return <div className="user-management-loading" style={{color:'#dc2626'}}><div className="loading-spinner"></div><p>Error: {error}</p><p>Check your backend API endpoints and authentication.</p></div>;

  return (
    <div className="user-role-admin">
      <div className="user-role-admin-header">
        <h1><span role="img" aria-label="users">👥</span> User, Role & Permission Admin</h1>
      </div>
      <div className="tab-bar">
        <button className={activeTab==='users'?'active':''} onClick={()=>setActiveTab('users')}><span role="img" aria-label="users">👤</span> Users</button>
        <button className={activeTab==='roles'?'active':''} onClick={()=>setActiveTab('roles')}><span role="img" aria-label="roles">🛡️</span> Roles</button>
        <button className={activeTab==='permissions'?'active':''} onClick={()=>setActiveTab('permissions')}><span role="img" aria-label="permissions">🔑</span> Permissions</button>
        <button className={activeTab==='matrix'?'active':''} onClick={()=>setActiveTab('matrix')}><span role="img" aria-label="matrix">📊</span> Access Matrix</button>
      </div>
      <div className="section-card">
        {activeTab === 'users' && (
          <div className="users-section table-responsive">
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1rem'}}>
              <button className="btn-primary" onClick={openAddUser}>+ Add User</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const role = roles.find(r => r.id === user.roleId);
                  return (
                    <tr key={user.id}>
                      <td><div className="user-avatar">{user.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div></td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.department}</td>
                      <td><span className="role-badge">{ROLE_ICONS[role?.name||'']||'🛡️'} {role?.name}</span></td>
                      <td><span className={`status-badge ${user.status}`}>{STATUS_ICONS[user.status]||'❔'} {user.status}</span></td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</td>
                      <td style={{position:'relative'}}>
                        <UserActionsDropdown user={user} openEditUser={openEditUser} handleDeleteUser={handleDeleteUser} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'roles' && (
          <div className="role-management-section table-responsive">
            <div className="role-management-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2><span role="img" aria-label="roles">🛡️</span> Roles</h2>
              <button className="btn-primary" onClick={openAddRole}>+ Add Role</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>System</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id}>
                    <td style={{fontSize:'1.5rem'}}>{ROLE_ICONS[role.name]||'🛡️'}</td>
                    <td>{role.name}</td>
                    <td>{role.description}</td>
                    <td>{role.isSystemRole ? 'Yes' : 'No'}</td>
                    <td style={{position:'relative'}}>
                      <RoleActionsDropdown role={role} openEditRole={openEditRole} handleDeleteRole={handleDeleteRole} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'permissions' && (
          <div className="permissions-section table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Key</th>
                  <th>Description</th>
                  <th>Assigned Roles</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map(perm => (
                  <tr key={perm.id}>
                    <td style={{fontSize:'1.3rem'}}>🔑</td>
                    <td>{perm.key}</td>
                    <td>{perm.description}</td>
                    <td>{roles.filter(r => (Array.isArray(r.permissions) ? r.permissions : JSON.parse(r.permissions as any)).includes(perm.key)).map(r => <span key={r.id} className="role-badge">{ROLE_ICONS[r.name]||'🛡️'} {r.name}</span>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'matrix' && (
          <div className="matrix-section">
            <h2><span role="img" aria-label="matrix">📊</span> Access Matrix</h2>
            <div className="matrix-scroll">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    {permissions.map(perm => <th key={perm.key}><span title={perm.description}>🔑</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => {
                    const perms = Array.isArray(role.permissions) ? role.permissions : JSON.parse(role.permissions as any);
                    return (
                      <tr key={role.id}>
                        <td><span className="role-badge">{ROLE_ICONS[role.name]||'🛡️'} {role.name}</span></td>
                        {permissions.map(perm => <td key={perm.key} style={{textAlign:'center'}}>{perms.includes(perm.key) ? '✅' : ''}</td>)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* --- Role Modal --- */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modern-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon">🛡️</div>
                <div>
                  <h2>{editingRole ? 'Edit Role' : 'Add Role'}</h2>
                  <p>{editingRole ? 'Update role details and permissions' : 'Create a new role and assign permissions'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>
            <form className="modern-form" onSubmit={e => { e.preventDefault(); handleSaveRole(); }}>
              <div className="form-sections">
                <div className="form-section">
                  <h3 className="section-title"><span className="section-icon">📝</span>Role Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Role Name <span className="required">*</span></label>
                      <input name="name" value={roleForm.name} onChange={handleRoleFormChange} className="form-input" required />
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label className="form-label">Description</label>
                      <textarea name="description" value={roleForm.description} onChange={handleRoleFormChange} className="form-input" style={{minHeight:60}} />
                    </div>
                    <div className="form-group">
                      <label className="form-label"><input type="checkbox" name="isSystemRole" checked={roleForm.isSystemRole} onChange={handleRoleFormChange} /> System Role</label>
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <h3 className="section-title"><span className="section-icon">🔑</span>Permissions</h3>
                  <div className="form-grid">
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <div className="permissions-list">
                        {permissions.map(perm => (
                          <label key={perm.key} className="perm-checkbox">
                            <input type="checkbox" checked={roleForm.permissions.includes(perm.key)} onChange={() => handleRolePermToggle(perm.key)} />
                            {perm.description}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRoleModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingRole ? 'Save Changes' : 'Create Role'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- User Modal --- */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modern-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon">👤</div>
                <div>
                  <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                  <p>{editingUser ? 'Update user details, role, and permissions' : 'Create a new user and assign role/permissions'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <form className="modern-form" onSubmit={e => { e.preventDefault(); handleSaveUser(); }}>
              <div className="form-sections">
                <div className="form-section">
                  <h3 className="section-title"><span className="section-icon">📋</span>User Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Name <span className="required">*</span></label>
                      <input name="name" value={userForm.name} onChange={handleUserFormChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email <span className="required">*</span></label>
                      <input name="email" value={userForm.email} onChange={handleUserFormChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input name="username" value={userForm.username} onChange={handleUserFormChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input name="department" value={userForm.department} onChange={handleUserFormChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select name="status" value={userForm.status} onChange={handleUserFormChange} className="form-input">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    {!editingUser && (
                      <div className="form-group">
                        <label className="form-label">Password <span className="required">*</span></label>
                        <input name="password" type="password" value={userForm.password} onChange={handleUserFormChange} className="form-input" required />
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Role <span className="required">*</span></label>
                      <select name="roleId" value={userForm.roleId} onChange={handleUserFormChange} className="form-input" required>
                        <option value="">Select Role</option>
                        {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <h3 className="section-title"><span className="section-icon">🔑</span>Extra Permissions</h3>
                  <div className="form-grid">
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <div className="permissions-list">
                        {permissions.map(perm => (
                          <label key={perm.key} className="perm-checkbox">
                            <input type="checkbox" checked={userForm.customPermissions.includes(perm.key)} onChange={() => handleUserPermToggle(perm.key)} />
                            {perm.description}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {userModalError && <div className="error-message">{userModalError}</div>}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const UserActionsDropdown: React.FC<{user: User, openEditUser: (user: User) => void, handleDeleteUser: (userId: number) => void}> = ({ user, openEditUser, handleDeleteUser }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{display:'inline-block'}}>
      <button className="user-actions-dash" onClick={()=>setOpen(o=>!o)} style={{fontSize:'2rem',lineHeight:1,background:'none',border:'none',cursor:'pointer',padding:'0 0.5rem',color:'#2563eb'}}>—</button>
      {open && (
        <div className="user-actions-dropdown" style={{position:'absolute',zIndex:10,background:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,0.12)',borderRadius:8,padding:'0.5rem 0',right:0,minWidth:120}}>
          <button className="btn-edit" style={{width:'100%',margin:0,borderRadius:0,background:'none',color:'#2563eb',textAlign:'left',padding:'0.5rem 1rem'}} onClick={()=>{ setOpen(false); openEditUser(user); }}>Edit</button>
          <button className="btn-delete" style={{width:'100%',margin:0,borderRadius:0,background:'none',color:'#ef4444',textAlign:'left',padding:'0.5rem 1rem'}} onClick={()=>{ setOpen(false); handleDeleteUser(user.id); }}>Delete</button>
        </div>
      )}
    </div>
  );
};

const RoleActionsDropdown: React.FC<{role: Role, openEditRole: (role: Role) => void, handleDeleteRole: (roleId: number) => void}> = ({ role, openEditRole, handleDeleteRole }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{display:'inline-block'}}>
      <button className="role-actions-dash" onClick={()=>setOpen(o=>!o)} style={{fontSize:'2rem',lineHeight:1,background:'none',border:'none',cursor:'pointer',padding:'0 0.5rem',color:'#2563eb'}}>—</button>
      {open && (
        <div className="role-actions-dropdown" style={{position:'absolute',zIndex:10,background:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,0.12)',borderRadius:8,padding:'0.5rem 0',right:0,minWidth:120}}>
          <button className="btn-edit" style={{width:'100%',margin:0,borderRadius:0,background:'none',color:'#2563eb',textAlign:'left',padding:'0.5rem 1rem'}} onClick={()=>{ setOpen(false); openEditRole(role); }}>Edit</button>
          {!role.isSystemRole && <button className="btn-delete" style={{width:'100%',margin:0,borderRadius:0,background:'none',color:'#ef4444',textAlign:'left',padding:'0.5rem 1rem'}} onClick={()=>{ setOpen(false); handleDeleteRole(role.id); }}>Delete</button>}
        </div>
      )}
    </div>
  );
};

export default UserRoleAdmin; 