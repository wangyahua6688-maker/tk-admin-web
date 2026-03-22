import http from '@/services/http';
import type { BackendMenuNode, NavMenuNode } from '@/features/rbac/types/menu';
import { normalizeMenuIconValue } from '@/features/rbac/utils/menu-icons';

/**
 * 菜单管理页使用的列表项结构。
 */
export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  parentId: string;
  parentName: string;
  sort: number;
  component: string;
}

export interface MenuPermissionItem {
  id: string;
  name: string;
  code: string;
}

export interface SaveMenuPayload {
  name: string;
  path: string;
  icon: string;
  parentId: string;
  sort: number;
  component: string;
}

/**
 * 统一处理后端菜单原始结构，转成前端菜单列表。
 */
function normalizeMenuList(rawList: any[]): MenuItem[] {
  const parentNameMap: Record<string, string> = {};

  rawList.forEach((item) => {
    const id = item?.id ?? item?.ID ?? '';
    parentNameMap[String(id)] = item.title || '';
  });

  return rawList.map((item) => {
    const id = item?.id ?? item?.ID ?? '';
    const parentId = item.parent_id ? String(item.parent_id) : '';
    return {
      id: String(id),
      name: item.title || '',
      path: item.path || '',
      icon: item.icon ? normalizeMenuIconValue(item.icon) : '',
      parentId,
      parentName: parentId ? parentNameMap[parentId] || '' : '',
      sort: Number(item.order_num || 0),
      component: item.component || ''
    };
  });
}

/**
 * 菜单树递归标准化。
 */
function normalizeMenuTree(rawTree: any[]): NavMenuNode[] {
  return rawTree
    .map((item) => ({
      id: Number(item?.id ?? item?.ID ?? 0),
      title: item.title || '',
      path: item.path || '',
      icon: item.icon ? normalizeMenuIconValue(item.icon) : '',
      order: Number(item.order_num || 0),
      children: normalizeMenuTree(Array.isArray(item.children) ? item.children : [])
    }))
    .sort((a, b) => a.order - b.order || a.id - b.id);
}

function toBackendPayload(data: SaveMenuPayload) {
  return {
    title: data.name,
    path: data.path,
    icon: data.icon ? normalizeMenuIconValue(data.icon) : '',
    parent_id: data.parentId ? Number(data.parentId) : 0,
    component: data.component,
    order_num: Number(data.sort || 0)
  };
}

function normalizePermission(raw: any): MenuPermissionItem {
  const id = raw?.id ?? raw?.ID ?? '';
  return {
    id: String(id),
    name: raw.name || '',
    code: raw.code || ''
  };
}

export const menuAPI = {
  /**
   * 获取菜单管理列表（全量）。
   */
  async getMenus(): Promise<MenuItem[]> {
    const res = await http.get<any[]>('/api/menus/');
    return Array.isArray(res) ? normalizeMenuList(res) : [];
  },

  /**
   * 获取当前登录用户可访问的前端菜单树（RBAC核心接口）。
   */
  async getFrontendTree(): Promise<NavMenuNode[]> {
    const res = await http.get<BackendMenuNode[] | any[]>('/api/menus/frontend/tree');
    return Array.isArray(res) ? normalizeMenuTree(res) : [];
  },

  async createMenu(data: SaveMenuPayload): Promise<MenuItem> {
    const res = await http.post<any>('/api/menus/', toBackendPayload(data));
    return normalizeMenuList([res])[0];
  },

  async updateMenu(id: string, data: SaveMenuPayload): Promise<MenuItem> {
    const res = await http.put<any>(`/api/menus/${id}`, toBackendPayload(data));
    return normalizeMenuList([res])[0];
  },

  async deleteMenu(id: string): Promise<void> {
    await http.delete(`/api/menus/${id}`);
  },

  /**
   * 查询菜单绑定的权限集合。
   */
  async getMenuPermissions(menuId: string): Promise<string[]> {
    const res = await http.get<any[]>(`/api/menus/${menuId}/permissions`);
    if (!Array.isArray(res)) return [];
    return res
      .map((item) => String(item?.id ?? item?.ID ?? ''))
      .filter((id) => id !== '');
  },

  /**
   * 全量覆盖绑定菜单权限。
   */
  async bindMenuPermissions(menuId: string, permissionIds: string[]): Promise<void> {
    const uniqueIds = Array.from(new Set(permissionIds))
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    await http.put(`/api/menus/${menuId}/permissions`, {
      permission_ids: uniqueIds
    });
  },

  /**
   * 菜单权限管理弹窗中展示可选权限。
   */
  async getPermissionOptions(): Promise<MenuPermissionItem[]> {
    const res = await http.get<any[]>('/api/permissions/');
    if (!Array.isArray(res)) return [];
    return res.map(normalizePermission);
  }
};

export default menuAPI;
