// src/features/auth/api/auth.ts - 认证相关API接口
// 导入HTTP客户端实例
import http from '@/services/http';

// 登录请求参数接口定义
export interface LoginPayload {
  username: string;  // 用户名
  password: string;  // 密码
}

// 用户信息接口定义
export interface AuthUser {
  id: string;      // 用户ID
  name: string;    // 用户名
  role: string;    // 用户角色
}

// 登录响应数据接口定义
export interface LoginResponse {
  user: AuthUser;
}

// 会话信息接口定义
export interface SessionResponse {
  user: AuthUser;
}

// 认证相关API接口对象
const authAPI = {

  // fixme 模拟登录
  async login(payload: LoginPayload): Promise<LoginResponse> {
    // --- 模拟登录开关 ---
    if (process.env.NODE_ENV === 'development') {
      console.log('正在执行模拟登录...', payload);
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟登录逻辑
      if (payload.username === 'admin' && payload.password === '123456') {
        return {
          token: 'mock-token-apple-style-admin',
          user: { id: 1, username: '管理员', role: 'admin' }
        } as unknown as LoginResponse;
      } else {
        throw new Error('用户名或密码错误');
      }
    }
    // --- 正常逻辑 ---
    const res = await http.post('/login', payload);
    return res as unknown as LoginResponse;
  },


  //fixme 暂时 // 用户登录接口
  // async login(payload: LoginPayload): Promise<LoginResponse> {
  //   const res = await http.post('/login', payload); // 发送POST请求
  //   return res as unknown as LoginResponse; // 类型断言为登录响应数据
  // },

  // 获取当前会话用户信息
  async me(): Promise<SessionResponse> {
    const res = await http.get('/me');
    return res as unknown as SessionResponse;
  },

  // 退出登录（清除 HttpOnly Cookie）
  async logout(): Promise<void> {
    await http.post('/logout');
  }
};

// 导出认证API接口对象
export default authAPI;
