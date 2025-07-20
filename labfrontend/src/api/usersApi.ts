import { supabase, handleError } from '../utils/supabaseClient';

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
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*, role:roleId(name)');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function getUser(id: number) {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*, role:roleId(name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function createUser(data: any) {
  try {
    // If authentication is required, first create auth user
    // const { data: authData, error: authError } = await supabase.auth.signUp({
    //   email: data.email,
    //   password: data.password,
    // });
    // if (authError) throw authError;

    // Then create DB user
    const { data: newUser, error } = await supabase
      .from('User')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return newUser;
  } catch (error) {
    return handleError(error);
  }
}

export async function updateUser(id: number, data: any) {
  try {
    const { data: updatedUser, error } = await supabase
      .from('User')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedUser;
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteUser(id: number) {
  try {
    const { data, error } = await supabase
      .from('User')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

// --- Role and Permission Management ---
export async function getRoles() {
  try {
    const { data, error } = await supabase
      .from('Role')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function getRole(id: number) {
  try {
    const { data, error } = await supabase
      .from('Role')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function createRole(data: any) {
  try {
    const { data: newRole, error } = await supabase
      .from('Role')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return newRole;
  } catch (error) {
    return handleError(error);
  }
}

export async function updateRole(id: number, data: any) {
  try {
    const { data: updatedRole, error } = await supabase
      .from('Role')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedRole;
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteRole(id: number) {
  try {
    const { data, error } = await supabase
      .from('Role')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function getPermissions() {
  try {
    const { data, error } = await supabase
      .from('Permission')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

// Get users by role level (for sample logs)
export const getUsersByRoleLevel = async (level: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*, role:roleId(name)')
      .eq('role.name', level);
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
};