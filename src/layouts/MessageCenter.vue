<!-- src/layouts/MessageCenter.vue - 消息中心组件 -->
<template>
  <!-- 抽屉组件 -->
  <el-drawer
    v-model="visible"
    title="消息中心"
    direction="rtl"
    size="400px"
    :before-close="handleClose"
  >
    <!-- 消息中心容器 -->
    <div class="message-center">
      <!-- 消息统计 -->
      <div class="message-stats">
        <el-badge :value="unreadCount" :max="99" class="stats-badge">
          <span>未读消息 {{ unreadCount }}</span>
        </el-badge>
        <!-- 全部已读按钮 -->
        <el-button text size="small" @click="markAllRead" v-if="unreadCount > 0">
          全部已读
        </el-button>
      </div>

      <!-- 消息列表 -->
      <div class="message-list" ref="messageListRef">
        <!-- 遍历消息项 -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ unread: !message.read }"
          @click="markAsRead(message)"
        >
          <!-- 消息图标 -->
          <div class="message-icon">
            <el-icon :color="getMessageIconColor(message.type)">
              <component :is="getMessageIcon(message.type)" />
            </el-icon>
          </div>
          <!-- 消息内容 -->
          <div class="message-content">
            <div class="message-title">{{ message.title }}</div>
            <div class="message-desc">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
          </div>
          <!-- 消息操作 -->
          <div class="message-actions">
            <el-button text size="small" @click.stop="deleteMessage(message)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <el-empty v-if="messages.length === 0" description="暂无消息" />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
// 消息中心逻辑
// 导入所需模块和组件
import { ref, computed, onMounted, nextTick } from 'vue';
import { Bell, InfoFilled, WarningFilled, SuccessFilled, Delete } from '@element-plus/icons-vue';

// 消息接口定义
interface Message {
  id: string;              // 消息ID
  title: string;           // 消息标题
  content: string;         // 消息内容
  type: 'info' | 'warning' | 'success' | 'error'; // 消息类型
  read: boolean;           // 是否已读
  createdAt: string;       // 创建时间
}

// 抽屉可见性状态
const visible = ref(false);

// 消息列表引用
const messageListRef = ref<HTMLElement>();

// 模拟消息数据
const messages = ref<Message[]>([
  {
    id: '1',
    title: '系统通知',
    content: '系统将在今晚 23:00-01:00 进行维护升级',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '2',
    title: '权限变更',
    content: '您的角色权限已更新，请重新登录',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: '3',
    title: '操作成功',
    content: '用户数据导出已完成',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
]);

// 未读消息数量计算属性
const unreadCount = computed(() => messages.value.filter(m => !m.read).length);

// 获取消息图标函数 - 根据消息类型返回对应图标
function getMessageIcon(type: string) {
  const iconMap = {
    info: Bell,
    warning: WarningFilled,
    success: SuccessFilled,
    error: WarningFilled
  };
  return iconMap[type as keyof typeof iconMap] || Bell;
}

// 获取消息图标颜色函数 - 根据消息类型返回对应颜色
function getMessageIconColor(type: string) {
  const colorMap = {
    info: '#409eff',
    warning: '#e6a23c',
    success: '#67c23a',
    error: '#f56c6c'
  };
  return colorMap[type as keyof typeof colorMap] || '#409eff';
}

// 格式化时间函数 - 将时间戳转换为友好显示格式
function formatTime(timeStr: string) {
  const time = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  
  if (diff < 1000 * 60) return '刚刚';
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}分钟前`;
  if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}小时前`;
  return time.toLocaleDateString();
}

// 标记为已读函数
function markAsRead(message: Message) {
  message.read = true;
  // 滚动到未读消息
  nextTick(() => {
    scrollToUnread();
  });
}

// 全部标记为已读函数
function markAllRead() {
  messages.value.forEach(message => {
    message.read = true;
  });
}

// 删除消息函数
function deleteMessage(message: Message) {
  const index = messages.value.findIndex(m => m.id === message.id);
  if (index > -1) {
    messages.value.splice(index, 1);
  }
}

// 滚动到未读消息函数
function scrollToUnread() {
  if (!messageListRef.value) return;
  
  const unreadItem = messageListRef.value.querySelector('.message-item.unread');
  if (unreadItem) {
    unreadItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// 处理关闭函数
function handleClose() {
  visible.value = false;
}

// 暴露方法给父组件
defineExpose({
  open: () => { 
    visible.value = true; 
    nextTick(scrollToUnread); 
  },
  close: () => { 
    visible.value = false; 
  }
});
</script>

<style scoped>
/* 消息中心样式 */
.message-center {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.stats-badge {
  font-weight: 500;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.message-item:hover {
  background-color: var(--hover-color);
}

.message-item.unread {
  background-color: rgba(64, 158, 255, 0.05);
  border-left-color: var(--primary-color);
  font-weight: 500;
}

.message-icon {
  margin-right: 12px;
  margin-top: 2px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color);
}

.message-desc {
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-time {
  font-size: 11px;
  color: #999;
}

.message-actions {
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 4px;
}

.message-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.message-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
