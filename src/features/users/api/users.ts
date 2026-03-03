import http from '@/services/http';

/**
 * 用户模型（前端展示结构）。
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  avatar?: string;
  password: string;
  status: boolean;
}

export interface UpdateUserData {
  username: string;
  email: string;
  avatar?: string;
  password?: string;
  status: boolean;
}

function normalizeUser(raw: any): User {
  return {
    id: String(raw.id ?? raw.ID ?? ''),
    username: raw.username || '',
    email: raw.email || '',
    avatar: raw.avatar || '',
    status: Number(raw.status) === 1,
    createdAt: raw.created_at || '',
    updatedAt: raw.updated_at || ''
  };
}

export const userAPI = {
  async getUsers(): Promise<User[]> {
    const res = await http.get<any[]>('/api/users/');
    return Array.isArray(res) ? res.map(normalizeUser) : [];
  },

  async createUser(data: CreateUserData): Promise<User> {
    const res = await http.post<any>('/api/users/', {
      username: data.username,
      email: data.email,
      avatar: data.avatar || '',
      password: data.password,
      status: data.status ? 1 : 0
    });
    return normalizeUser(res);
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const payload: Record<string, any> = {
      email: data.email,
      avatar: data.avatar || '',
      status: data.status ? 1 : 0
    };

    if (data.password) {
      payload.password = data.password;
    }

    const res = await http.put<any>(`/api/users/${id}`, payload);
    return normalizeUser(res);
  },

  async deleteUser(id: string): Promise<void> {
    await http.delete(`/api/users/${id}`);
  }
};

export default userAPI;
