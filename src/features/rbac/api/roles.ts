import http from '@/services/http';

/**
 * 角色模型。
 */
export interface Role {
  id: string;
  name: string;
  code: string;
}

export interface SaveRolePayload {
  name: string;
  code: string;
}

function normalizeRole(raw: any): Role {
  const id = raw?.id ?? raw?.ID ?? '';
  return {
    id: String(id),
    name: raw.name || '',
    code: raw.code || ''
  };
}

export const roleAPI = {
  async getRoles(): Promise<Role[]> {
    const res = await http.get<any[]>('/api/roles/');
    return Array.isArray(res) ? res.map(normalizeRole) : [];
  },

  async createRole(data: SaveRolePayload): Promise<Role> {
    const res = await http.post<any>('/api/roles/', {
      name: data.name,
      code: data.code
    });
    return normalizeRole(res);
  },

  async updateRole(id: string, data: SaveRolePayload): Promise<Role> {
    const res = await http.put<any>(`/api/roles/${id}`, {
      name: data.name,
      code: data.code
    });
    return normalizeRole(res);
  },

  async deleteRole(id: string): Promise<void> {
    await http.delete(`/api/roles/${id}`);
  },

  /**
   * 获取角色已绑定权限ID。
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const res = await http.get<any[]>(`/api/roles/${roleId}/permissions`);
    if (!Array.isArray(res)) return [];
    return res
      .map((item) => String(item?.id ?? item?.ID ?? ''))
      .filter((id) => id !== '');
  },

  /**
   * 全量覆盖角色权限绑定。
   */
  async assignRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const uniqueIds = Array.from(new Set(permissionIds))
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    await http.put(`/api/roles/${roleId}/permissions`, {
      permission_ids: uniqueIds
    });
  }
};

export default roleAPI;
