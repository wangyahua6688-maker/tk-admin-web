import { defineStore } from 'pinia';
import messageAPI, { type MessageItem } from '@/features/ui/api/messages';

export type MessageLevel = 'info' | 'success' | 'warning';

export interface SystemMessage {
  id: string;
  title: string;
  content: string;
  level: MessageLevel;
  createdAt: string;
  read: boolean;
}

interface MessageState {
  items: SystemMessage[];
  unreadCountValue: number;
  loaded: boolean;
  loading: boolean;
}

/**
 * 系统消息状态。
 * 说明：
 * 1. 使用后端接口作为真实数据源；
 * 2. 本地仅做读取与已读状态同步；
 * 3. unreadCount 用于头像红点展示。
 */
export const useMessageStore = defineStore('system-messages', {
  state: (): MessageState => ({
    items: [],
    unreadCountValue: 0,
    loaded: false,
    loading: false
  }),

  getters: {
    unreadCount: (state): number => state.unreadCountValue,
    orderedItems: (state): SystemMessage[] => [...state.items]
  },

  actions: {
    async ensureLoaded() {
      if (this.loaded || this.loading) return;
      await this.refreshMessages();
    },

    /**
     * 拉取系统消息列表（默认首页）。
     */
    async refreshMessages() {
      this.loading = true;
      try {
        const res = await messageAPI.listMessages({ page: 1, pageSize: 50 });
        this.items = res.items.map((item: MessageItem) => ({ ...item }));
        this.unreadCountValue = res.unreadCount;
        this.loaded = true;
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(messageId: string) {
      const target = this.items.find((item) => item.id === messageId);
      if (target && !target.read) {
        target.read = true;
        this.unreadCountValue = Math.max(0, this.unreadCountValue - 1);
      }

      try {
        await messageAPI.markRead(messageId);
      } catch {
        // 回写失败时重新同步，避免本地状态与后端不一致。
        await this.refreshMessages();
      }
    },

    async markAllRead() {
      if (this.unreadCountValue <= 0) return;

      this.items = this.items.map((item) => ({
        ...item,
        read: true
      }));
      this.unreadCountValue = 0;

      try {
        await messageAPI.markAllRead();
      } catch {
        await this.refreshMessages();
      }
    }
  }
});
