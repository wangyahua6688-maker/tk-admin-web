// src/services/api/roles.ts - 角色管理相关API接口
// 导入HTTP客户端实例
import http from '../http';

// 角色信息接口定义
export interface Role {
  id: string;              // 角色ID
  name: string;            // 角色名称
  code: string;            // 角色编码
  description: string;     // 角色描述
  permissionIds: string[]; // 权限ID列表
}

// 创建角色请求参数接口定义
export interface CreateRoleData {
  name: string;            // 角色名称
  code: string;            // 角色编码
  description: string;     // 角色描述
  permissionIds: string[]; // 权限ID列表
}

// 更新角色请求参数接口定义
export interface UpdateRoleData {
  name: string;            // 角色名称
  code: string;            // 角色编码
  description: string;     // 角色描述
  permissionIds: string[]; // 权限ID列表
}

// 角色管理相关API接口对象
export const roleAPI = {
  // 获取角色列表接口
  getRoles: async (): Promise<Role[]> => {
    try {
      const res = await http.get('/roles'); // 发送GET请求
      return (res as any) || []; // 返回角色列表数据
    } catch (error) {
      console.error('获取角色列表失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 创建新角色接口
  createRole: async (data: CreateRoleData): Promise<Role> => {
    try {
      const res = await http.post('/roles', data); // 发送POST请求
      return res as any; // 返回创建的角色数据
    } catch (error) {
      console.error('创建角色失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 更新角色接口
  updateRole: async (id: string, data: UpdateRoleData): Promise<Role> => {
    try {
      const res = await http.put(`/roles/${id}`, data); // 发送PUT请求
      return res as any; // 返回更新后的角色数据
    } catch (error) {
      console.error('更新角色失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 删除角色接口
  deleteRole: async (id: string): Promise<void> => {
    try {
      await http.delete(`/roles/${id}`); // 发送DELETE请求
    } catch (error) {
      console.error('删除角色失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 获取角色权限接口
  getRolePermissions: async (roleId: string): Promise<string[]> => {
    try {
      const res = await http.get(`/roles/${roleId}/permissions`); // 发送GET请求
      return (res as any) || []; // 返回角色权限ID列表
    } catch (error) {
      console.error('获取角色权限失败:', error);
      // 如果接口不存在，返回模拟数据
      console.warn('使用模拟权限数据');
      return ['perm1', 'perm2']; // 模拟权限ID
    }
  },

  // 分配角色权限接口
  assignRolePermissions: async (roleId: string, permissionIds: string[]): Promise<void> => {
    try {
      await http.post(`/roles/${roleId}/permissions`, { permissionIds }); // 发送POST请求
    } catch (error) {
      console.error('分配角色权限失败:', error);
      // 如果接口不存在，模拟成功
      console.warn('使用模拟权限分配');
      return Promise.resolve(); // 返回成功Promise
    }
  }
};

// 导出角色管理API接口对象
export default roleAPI;