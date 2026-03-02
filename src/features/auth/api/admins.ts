// src/features/auth/api/admins.ts - 管理员用户相关API接口
// 导入HTTP客户端实例
import http from '@/services/http';

// 管理员用户信息接口定义
export interface AdminUser {
  id: string;        // 管理员ID
  username: string;  // 用户名
  email: string;     // 邮箱
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// 创建管理员用户请求参数接口定义
export interface CreateAdminUserData {
  username: string;  // 用户名
  email: string;     // 邮箱
  password: string;  // 密码
}

// 更新管理员用户请求参数接口定义
export interface UpdateAdminUserData {
  username: string;  // 用户名
  email: string;     // 邮箱
  password?: string; // 密码（可选）
}

// 管理员用户相关API接口对象
export const adminAPI = {
  // 获取管理员列表接口
  getAdmins: async (params?: { search: string }): Promise<AdminUser[]> => {
    try {
      const res = await http.get('/admin-users', { params }); // 发送GET请求，支持搜索参数
      return (res as any) || []; // 返回管理员列表数据
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 创建管理员接口
  createAdmin: async (data: CreateAdminUserData): Promise<AdminUser> => {
    try {
      const res = await http.post('/admin-users', data); // 发送POST请求
      return res as any; // 返回创建的管理员数据
    } catch (error) {
      console.error('创建管理员失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 更新管理员接口
  updateAdmin: async (id: string, data: UpdateAdminUserData): Promise<AdminUser> => {
    try {
      const res = await http.put(`/admin-users/${id}`, data); // 发送PUT请求
      return res as any; // 返回更新后的管理员数据
    } catch (error) {
      console.error('更新管理员失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 删除管理员接口
  deleteAdmin: async (id: string): Promise<void> => {
    try {
      await http.delete(`/admin-users/${id}`); // 发送DELETE请求
    } catch (error) {
      console.error('删除管理员失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  }
};

// 导出管理员用户API接口对象
export default adminAPI;