import http from '@/services/http';

/**
 * 登录请求参数。
 */
export interface LoginPayload {
  username: string;
  password: string;
}

/**
 * 登录/刷新响应结构。
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_id: number;
  username: string;
  expires_in: number;
}

/**
 * 当前用户资料结构。
 */
export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

const authAPI = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return await http.post('/auth/login', payload);
  },

  async refresh(): Promise<LoginResponse> {
    return await http.post('/auth/refresh', {});
  },

  async me(): Promise<ProfileResponse> {
    return await http.get('/api/users/profile');
  },

  async logout(): Promise<void> {
    await http.post('/auth/logout');
  }
};

export default authAPI;
