// src/services/api/auth.ts - 认证相关API接口
// 导入HTTP客户端实例
import http from '../http';

// 登录请求参数接口定义
export interface LoginPayload {
  username: string;  // 用户名
  password: string;  // 密码
}

// 登录响应数据接口定义
export interface LoginResponse {
  token: string;     // 认证令牌
  user: {
    id: string;      // 用户ID
    name: string;    // 用户名
    role: string;    // 用户角色
  };
}

// 认证相关API接口对象
const authAPI = {
  // 用户登录接口
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await http.post('/login', payload); // 发送POST请求
    return res as unknown as LoginResponse; // 类型断言为登录响应数据
  }
};

// 导出认证API接口对象
export default authAPI;