// src/features/users/api/users.ts - 用户管理相关API接口
// 导入HTTP客户端实例
import http from '@/services/http';

// 用户信息接口定义
export interface User {
  id: string;           // 用户ID
  username: string;     // 用户名
  email: string;        // 邮箱
  roleIds: string[];    // 角色ID列表
  status: boolean;      // 用户状态（启用/禁用）
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}

// 创建用户请求参数接口定义
export interface CreateUserData {
  username: string;     // 用户名
  email: string;        // 邮箱
  password: string;     // 密码
  roleIds: string[];    // 角色ID列表
  status: boolean;      // 用户状态
}

// 更新用户请求参数接口定义
export interface UpdateUserData {
  username: string;     // 用户名
  email: string;        // 邮箱
  roleIds: string[];    // 角色ID列表
  status: boolean;      // 用户状态
  password?: string;    // 密码（可选）
}

// 用户管理相关API接口对象
export const userAPI = {
  // 获取用户列表接口
  getUsers: async (): Promise<User[]> => {
    try {
      const res = await http.get('/users'); // 发送GET请求
      return (res as any) || []; // 返回用户列表数据
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 创建新用户接口
  createUser: async (data: CreateUserData): Promise<User> => {
    try {
      const res = await http.post('/users', data); // 发送POST请求
      return res as any; // 返回创建的用户数据
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 更新用户接口
  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    try {
      const res = await http.put(`/users/${id}`, data); // 发送PUT请求
      return res as any; // 返回更新后的用户数据
    } catch (error) {
      console.error('更新用户失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 删除用户接口
  deleteUser: async (id: string): Promise<void> => {
    try {
      await http.delete(`/users/${id}`); // 发送DELETE请求
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 切换用户状态接口
  toggleUserStatus: async (id: string, status: boolean): Promise<void> => {
    try {
      await http.patch(`/users/${id}/status`, { status }); // 发送PATCH请求
    } catch (error) {
      console.error('切换用户状态失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  }
};

// 导出用户管理API接口对象
export default userAPI;