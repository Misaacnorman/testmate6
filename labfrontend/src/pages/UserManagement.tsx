import * as React from 'react';
import { useState, useEffect } from 'react';
// ...existing code...
import { getUsers, updateUser, deleteUser, getRoles, getPermissions, createRole, updateRole, deleteRole } from '../api/usersApi';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'lab_manager' | 'lab_technician' | 'data_entry' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  phoneNumber: string;
  permissions: string[];
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

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<{ name: string; description: string; permissions: string[]; isSystemRole: boolean }>({ name: '', description: '', permissions: [], isSystemRole: false });
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchRolesAndPerms = async () => {
      try {
        const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
        setRoles(rolesData);
        setPermissions(permsData);
      } catch (err) {
        console.error('Failed to fetch roles/permissions:', err);
      }
    };
    fetchRolesAndPerms();
  }, []);

  useEffect(() => {
    // Filter users based on search and filters
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'lab_manager': return 'role-manager';
      case 'lab_technician': return 'role-technician';
      case 'data_entry': return 'role-data';
      case 'viewer': return 'role-viewer';
      default: return 'role-default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'suspended': return 'status-suspended';
      default: return 'status-default';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'lab_manager': return 'Lab Manager';
      case 'lab_technician': return 'Lab Technician';
      case 'data_entry': return 'Data Entry';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const handleEditUser = async (user: User) => {
    setLoading(true);
    try {
      const updated = await updateUser(user.id, user);
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      setFilteredUsers(prev => prev.map(u => u.id === user.id ? updated : u));
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setLoading(true);
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setFilteredUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (userId: number, newStatus: 'active' | 'inactive' | 'suspended') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  // Removed unused function handleAddUser

  // --- Role Management Handlers ---
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
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setRoleForm(f => ({ ...f, [name]: checked }));
    } else {
      setRoleForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleRolePermToggle = (permKey: string) => {
    setRoleForm(f => ({ ...f, permissions: f.permissions.includes(permKey) ? f.permissions.filter(p => p !== permKey) : [...f.permissions, permKey] }));
  };
  const handleSaveRole = async () => {
    try {
      const rolePayload = { ...roleForm, permissions: JSON.stringify(roleForm.permissions) };
      if (editingRole) {
        await updateRole(editingRole.id, rolePayload);
      } else {
        await createRole(rolePayload);
      }
      const updatedRoles = await getRoles();
      setRoles(updatedRoles);
      setShowRoleModal(false);
    } catch {
      alert('Failed to save role');
    }
  };
  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm('Delete this role?')) return;
    try {
      await deleteRole(roleId);
      setRoles(await getRoles());
    } catch {
      alert('Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="user-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h1>User Management</h1>
        <p>Manage laboratory staff accounts, roles, and permissions</p>
        <div className="tab-controls">
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
          <button className={activeTab === 'roles' ? 'active' : ''} onClick={() => setActiveTab('roles')}>Roles & Permissions</button>
        </div>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Search and Filters */}
          <div className="search-filter-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by username, name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="lab_manager">Lab Manager</option>
                <option value="lab_technician">Lab Technician</option>
                <option value="data_entry">Data Entry</option>
                <option value="viewer">Viewer</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <p>Showing {filteredUsers.length} user(s)</p>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <span>+</span> Add New User
            </button>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">
                      No users found. {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first user!'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="user-details">
                            <strong>{user.fullName}</strong>
                            <p className="user-username">@{user.username}</p>
                            <p className="user-email">{user.email}</p>
                            <p className="user-phone">{user.phoneNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td>{user.department}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatDateTime(user.lastLogin)}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="actions">
                        <button className="btn-view" title="View Details">
                          👁️
                        </button>
                        <button 
                          className="btn-edit" 
                          title="Edit User"
                          onClick={() => handleEditUser(user)}
                        >
                          ✏️
                        </button>
                        <div className="status-actions">
                          {user.status === 'active' ? (
                            <>
                              <button 
                                className="btn-suspend" 
                                title="Suspend User"
                                onClick={() => handleStatusToggle(user.id, 'suspended')}
                              >
                                ⏸️
                              </button>
                              <button 
                                className="btn-deactivate" 
                                title="Deactivate User"
                                onClick={() => handleStatusToggle(user.id, 'inactive')}
                              >
                                🚫
                              </button>
                            </>
                          ) : user.status === 'suspended' ? (
                            <button 
                              className="btn-activate" 
                              title="Activate User"
                              onClick={() => handleStatusToggle(user.id, 'active')}
                            >
                              ▶️
                            </button>
                          ) : (
                            <button 
                              className="btn-activate" 
                              title="Activate User"
                              onClick={() => handleStatusToggle(user.id, 'active')}
                            >
                              ▶️
                            </button>
                          )}
                        </div>
                        <button 
                          className="btn-delete" 
                          title="Delete User"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* User Statistics */}
          <div className="user-statistics">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{users.length}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{users.filter(u => u.status === 'active').length}</h3>
                <p>Active Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔬</div>
              <div className="stat-content">
                <h3>{users.filter(u => u.role === 'lab_technician').length}</h3>
                <p>Lab Technicians</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{users.filter(u => u.role === 'admin').length}</h3>
                <p>Administrators</p>
              </div>
            </div>
          </div>

          {/* Add User Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Add New User</h2>
                  <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <p>User creation form would go here...</p>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button className="btn-primary">Create User</button>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && selectedUser && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Edit User: {selectedUser.fullName}</h2>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <p>User editing form would go here...</p>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button className="btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {activeTab === 'roles' && (
        <div className="role-management-section">
          <div className="role-management-header">
            <h2>Roles</h2>
            <button className="btn-primary" onClick={openAddRole}>+ Add Role</button>
          </div>
          <table className="roles-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>System</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.description}</td>
                  <td style={{ maxWidth: 300 }}>
                    {permissions.filter(p => (Array.isArray(role.permissions) ? role.permissions : JSON.parse(role.permissions as any)).includes(p.key)).map(p => p.description).join(', ')}
                  </td>
                  <td>{role.isSystemRole ? 'Yes' : 'No'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => openEditRole(role)}>Edit</button>
                    {!role.isSystemRole && <button className="btn-delete" onClick={() => handleDeleteRole(role.id)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingRole ? 'Edit Role' : 'Add Role'}</h2>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <label>Role Name
                <input name="name" value={roleForm.name} onChange={handleRoleFormChange} className="form-input" />
              </label>
              <label>Description
                <textarea name="description" value={roleForm.description} onChange={handleRoleFormChange} className="form-input" />
              </label>
              <label style={{ fontWeight: 600, marginTop: 12 }}>Permissions</label>
              <div className="permissions-list">
                {permissions.map(perm => (
                  <label key={perm.key} className="perm-checkbox">
                    <input type="checkbox" checked={roleForm.permissions.includes(perm.key)} onChange={() => handleRolePermToggle(perm.key)} />
                    {perm.description}
                  </label>
                ))}
              </div>
              <label style={{ marginTop: 12 }}>
                <input type="checkbox" name="isSystemRole" checked={roleForm.isSystemRole} onChange={handleRoleFormChange} /> System Role
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveRole}>{editingRole ? 'Save Changes' : 'Create Role'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
