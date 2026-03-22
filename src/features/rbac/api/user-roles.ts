import http from '@/services/http';
import type { Role } from '@/features/rbac/api/roles';

function normalizeRole(raw: any): Role {
  return {
    id: String(raw.id ?? raw.ID ?? ''),
    name: raw.name || '',
    code: raw.code || ''
  };
}

export const userRoleAPI = {
  /**
   * 查询用户已有角色。
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const res = await http.get<any[]>(`/api/users/role/${userId}`);
    if (!Array.isArray(res)) return [];
    return res.map(normalizeRole);
  },

  /**
   * 全量覆盖用户角色。
   */
  async bindUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const uniqueIds = Array.from(new Set(roleIds))
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    await http.post('/api/users/role/bind', {
      user_id: Number(userId),
      role_ids: uniqueIds
    });
  }
};

export default userRoleAPI;
