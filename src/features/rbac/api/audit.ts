import http from '@/services/http';

export interface LoginLogItem {
  id: string;
  user_id: number;
  username: string;
  ip: string;
  device: string;
  status: number;
  created_at: string;
}

export interface LoginLogQuery {
  page: number;
  page_size: number;
  username?: string;
}

export interface LoginLogPage {
  list: LoginLogItem[];
  total: number;
  page: number;
  page_size: number;
}

function normalizeLog(raw: any): LoginLogItem {
  const id = raw?.id ?? raw?.ID ?? '';
  return {
    id: String(id),
    user_id: Number(raw.user_id || 0),
    username: raw.username || '',
    ip: raw.ip || '',
    device: raw.device || '',
    status: Number(raw.status || 0),
    created_at: raw.created_at || ''
  };
}

export const auditAPI = {
  async getLoginLogs(query: LoginLogQuery): Promise<LoginLogPage> {
    const res = await http.get<any>('/api/audit/login-logs', { params: query });

    const list = Array.isArray(res?.list) ? res.list.map(normalizeLog) : [];
    return {
      list,
      total: Number(res?.total || 0),
      page: Number(res?.page || query.page),
      page_size: Number(res?.page_size || query.page_size)
    };
  }
};

export default auditAPI;
