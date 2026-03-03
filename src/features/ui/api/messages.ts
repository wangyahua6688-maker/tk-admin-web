import http from '@/services/http';

export interface MessageItem {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'success' | 'warning';
  createdAt: string;
  read: boolean;
}

interface MessageListResp {
  items: any[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

interface MessageListQuery {
  page?: number;
  pageSize?: number;
  onlyUnread?: boolean;
}

function normalizeMessage(raw: any): MessageItem {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title || ''),
    content: String(raw.content || ''),
    level: normalizeLevel(raw.level),
    createdAt: String(raw.created_at || raw.createdAt || ''),
    read: Boolean(raw.is_read ?? raw.read)
  };
}

function normalizeLevel(raw: any): MessageItem['level'] {
  const value = String(raw || '').toLowerCase();
  if (value === 'success') return 'success';
  if (value === 'warning') return 'warning';
  return 'info';
}

export const messageAPI = {
  async listMessages(query?: MessageListQuery): Promise<{ items: MessageItem[]; total: number; unreadCount: number }> {
    const res = await http.get<MessageListResp>('/api/messages/', {
      params: {
        page: query?.page || 1,
        page_size: query?.pageSize || 30,
        only_unread: query?.onlyUnread ? 1 : 0
      }
    });

    const rawItems = Array.isArray(res?.items) ? res.items : [];
    return {
      items: rawItems.map(normalizeMessage),
      total: Number(res?.total || 0),
      unreadCount: Number(res?.unread_count || 0)
    };
  },

  async markRead(messageID: string): Promise<void> {
    await http.post(`/api/messages/${messageID}/read`);
  },

  async markAllRead(): Promise<void> {
    await http.post('/api/messages/read-all');
  }
};

export default messageAPI;

