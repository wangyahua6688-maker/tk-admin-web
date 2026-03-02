// src/features/auth/api/permissions.ts - 权限管理相关API接口
// 导入HTTP客户端实例
import http from '@/services/http';

// 权限信息接口定义
export interface Permission {
  id: string;          // 权限ID
  name: string;        // 权限名称
  code: string;        // 权限编码
  description: string; // 权限描述
}

// 创建权限请求参数接口定义
export interface CreatePermissionData {
  name: string;        // 权限名称
  code: string;        // 权限编码
  description: string; // 权限描述
}

// 更新权限请求参数接口定义
export interface UpdatePermissionData {
  name: string;        // 权限名称
  code: string;        // 权限编码
  description: string; // 权限描述
}

// 权限管理相关API接口对象
export const permissionAPI = {
  // 获取权限列表接口
  getPermissions: async (): Promise<Permission[]> => {
    try {
      const res = await http.get('/permissions'); // 发送GET请求
      return (res as any) || []; // 返回权限列表数据
    } catch (error) {
      console.error('获取权限列表失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 创建新权限接口
  createPermission: async (data: CreatePermissionData): Promise<Permission> => {
    try {
      const res = await http.post('/permissions', data); // 发送POST请求
      return res as any; // 返回创建的权限数据
    } catch (error) {
      console.error('创建权限失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 更新权限接口
  updatePermission: async (id: string, data: UpdatePermissionData): Promise<Permission> => {
    try {
      const res = await http.put(`/permissions/${id}`, data); // 发送PUT请求
      return res as any; // 返回更新后的权限数据
    } catch (error) {
      console.error('更新权限失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 删除权限接口
  deletePermission: async (id: string): Promise<void> => {
    try {
      await http.delete(`/permissions/${id}`); // 发送DELETE请求
    } catch (error) {
      console.error('删除权限失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  }
};

// 导出权限管理API接口对象
export default permissionAPI;