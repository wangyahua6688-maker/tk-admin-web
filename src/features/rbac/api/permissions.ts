import http from '@/services/http';

/**
 * 权限模型。
 * 与后端 sys_permissions 字段保持一致。
 */
export interface Permission {
  id: string;
  name: string;
  code: string;
  type: string;
  method: string;
  path: string;
}

export interface SavePermissionPayload {
  name: string;
  code: string;
  method: string;
  path: string;
}

function normalizePermission(raw: any): Permission {
  const id = raw?.id ?? raw?.ID ?? '';
  return {
    id: String(id),
    name: raw.name || '',
    code: raw.code || '',
    type: raw.type || 'api',
    method: raw.method || '',
    path: raw.path || ''
  };
}

function toBackendPayload(data: SavePermissionPayload) {
  return {
    name: data.name,
    code: data.code,
    // 当前项目以 API 权限为主，统一写 api，避免前端误配。
    type: 'api',
    method: data.method,
    path: data.path
  };
}

export const permissionAPI = {
  async getPermissions(): Promise<Permission[]> {
    const res = await http.get<any[]>('/api/permissions/');
    return Array.isArray(res) ? res.map(normalizePermission) : [];
  },

  async createPermission(data: SavePermissionPayload): Promise<Permission> {
    const res = await http.post<any>('/api/permissions/', toBackendPayload(data));
    return normalizePermission(res);
  },

  async updatePermission(id: string, data: SavePermissionPayload): Promise<Permission> {
    const res = await http.put<any>(`/api/permissions/${id}`, toBackendPayload(data));
    return normalizePermission(res);
  },

  async deletePermission(id: string): Promise<void> {
    await http.delete(`/api/permissions/${id}`);
  }
};

export default permissionAPI;
