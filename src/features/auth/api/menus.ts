// src/features/auth/api/menus.ts - 菜单管理相关API接口
// 导入HTTP客户端实例
import http from '@/services/http';

// 菜单信息接口定义
export interface Menu {
  id: string;       // 菜单ID
  name: string;     // 菜单名称
  path: string;     // 菜单路径
  icon: string;     // 菜单图标
  parentId: string; // 父菜单ID
  parentName: string; // 父菜单名称
  sort: number;     // 排序值
  visible: boolean; // 是否可见
}

// 创建菜单请求参数接口定义
export interface CreateMenuData {
  name: string;     // 菜单名称
  path: string;     // 菜单路径
  icon: string;     // 菜单图标
  parentId: string; // 父菜单ID
  sort: number;     // 排序值
  visible: boolean; // 是否可见
}

// 更新菜单请求参数接口定义
export interface UpdateMenuData {
  name: string;     // 菜单名称
  path: string;     // 菜单路径
  icon: string;     // 菜单图标
  parentId: string; // 父菜单ID
  sort: number;     // 排序值
  visible: boolean; // 是否可见
}

// 菜单管理相关API接口对象
export const menuAPI = {
  // 获取菜单列表接口
  getMenus: async (): Promise<Menu[]> => {
    try {
      const res = await http.get('/menus'); // 发送GET请求
      return (res as any) || []; // 返回菜单列表数据
    } catch (error) {
      console.error('获取菜单列表失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 创建新菜单接口
  createMenu: async (data: CreateMenuData): Promise<Menu> => {
    try {
      const res = await http.post('/menus', data); // 发送POST请求
      return res as any; // 返回创建的菜单数据
    } catch (error) {
      console.error('创建菜单失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 更新菜单接口
  updateMenu: async (id: string, data: UpdateMenuData): Promise<Menu> => {
    try {
      const res = await http.put(`/menus/${id}`, data); // 发送PUT请求
      return res as any; // 返回更新后的菜单数据
    } catch (error) {
      console.error('更新菜单失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  },

  // 删除菜单接口
  deleteMenu: async (id: string): Promise<void> => {
    try {
      await http.delete(`/menus/${id}`); // 发送DELETE请求
    } catch (error) {
      console.error('删除菜单失败:', error);
      throw error; // 抛出错误供调用方处理
    }
  }
};

// 导出菜单管理API接口对象
export default menuAPI;