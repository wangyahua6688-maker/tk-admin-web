<template>
  <div class="dashboard-page">
    <section class="hero card">
      <div class="hero-main">
        <h2 class="hero-title">后台首页</h2>
        <p class="hero-subtitle">
          欢迎回来，{{ auth.username || '管理员' }}。这里汇总当前系统关键数据，便于快速掌握运行状态。
        </p>
        <p class="hero-time">最近刷新：{{ lastRefreshText }}</p>
      </div>

      <el-button type="primary" :loading="loading" @click="reloadDashboard">
        <el-icon><RefreshRight /></el-icon>
        <span>刷新数据</span>
      </el-button>
    </section>

    <section class="kpi-grid">
      <article v-for="item in kpiCards" :key="item.key" class="kpi-card card">
        <div class="kpi-icon" :class="`kpi-icon-${item.key}`">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
        </div>

        <div class="kpi-content">
          <div class="kpi-title">{{ item.title }}</div>
          <div class="kpi-value">{{ item.value }}</div>
          <div class="kpi-desc">{{ item.desc }}</div>
        </div>
      </article>
    </section>

    <section class="panel-grid">
      <article class="card panel">
        <header class="panel-head">
          <h3>近7天登录趋势</h3>
          <span class="panel-meta">登录日志统计</span>
        </header>

        <div v-if="loginTrend.length === 0" class="panel-empty">暂无可展示数据</div>
        <div v-else class="trend-wrap">
          <div v-for="item in loginTrend" :key="item.day" class="trend-item">
            <div class="trend-bar">
              <div class="trend-bar-fill" :style="{ height: `${calcTrendPercent(item.count)}%` }"></div>
            </div>
            <div class="trend-label">{{ item.label }}</div>
            <div class="trend-count">{{ item.count }}</div>
          </div>
        </div>
      </article>

      <article class="card panel">
        <header class="panel-head">
          <h3>系统消息</h3>
          <span class="panel-meta">最近 {{ recentMessages.length }} 条</span>
        </header>

        <div v-if="recentMessages.length === 0" class="panel-empty">暂无系统消息</div>
        <ul v-else class="message-list">
          <li v-for="msg in recentMessages" :key="msg.id" class="message-item">
            <div class="message-row">
              <span class="message-title">{{ msg.title }}</span>
              <el-tag size="small" effect="plain" :type="levelTagTypeMap[msg.level]">
                {{ levelLabelMap[msg.level] }}
              </el-tag>
            </div>
            <p class="message-content">{{ msg.content }}</p>
            <div class="message-time">{{ msg.createdAt }}</div>
          </li>
        </ul>
      </article>
    </section>

    <section class="card panel">
      <header class="panel-head">
        <h3>最近登录记录</h3>
        <span class="panel-meta">展示最新 8 条</span>
      </header>

      <el-table :data="recentLogs" size="small" stripe>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="ip" label="IP" min-width="120" />
        <el-table-column prop="device" label="设备信息" min-width="220" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="登录时间" min-width="170" />
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Bell, Key, RefreshRight, User, UserFilled } from '@element-plus/icons-vue';
import { useAuthStore } from '@/features/auth/store/auth';
import userAPI from '@/features/users/api/users';
import roleAPI from '@/features/rbac/api/roles';
import permissionAPI from '@/features/rbac/api/permissions';
import auditAPI, { type LoginLogItem } from '@/features/rbac/api/audit';
import messageAPI, { type MessageItem } from '@/features/ui/api/messages';

type MessageLevel = MessageItem['level'];

interface TrendItem {
  day: string;
  label: string;
  count: number;
}

const auth = useAuthStore();

const loading = ref(false);
const lastRefreshAt = ref<Date | null>(null);

const userCount = ref<number | null>(null);
const enabledUserCount = ref<number>(0);
const roleCount = ref<number | null>(null);
const permissionCount = ref<number | null>(null);
const unreadMessageCount = ref<number | null>(null);

const recentMessages = ref<MessageItem[]>([]);
const recentLogs = ref<LoginLogItem[]>([]);
const loginTrend = ref<TrendItem[]>([]);

const levelLabelMap: Record<MessageLevel, string> = {
  info: '通知',
  success: '完成',
  warning: '提醒'
};

const levelTagTypeMap: Record<MessageLevel, '' | 'success' | 'warning' | 'danger' | 'info'> = {
  info: 'info',
  success: 'success',
  warning: 'warning'
};

const kpiCards = computed(() => [
  {
    key: 'user',
    title: '用户总数',
    value: toStatText(userCount.value),
    desc: `启用账号 ${enabledUserCount.value}`,
    icon: User
  },
  {
    key: 'role',
    title: '角色数量',
    value: toStatText(roleCount.value),
    desc: '角色越清晰，权限越可控',
    icon: UserFilled
  },
  {
    key: 'permission',
    title: '权限总数',
    value: toStatText(permissionCount.value),
    desc: '建议定期审计高危权限',
    icon: Key
  },
  {
    key: 'message',
    title: '未读消息',
    value: toStatText(unreadMessageCount.value),
    desc: '及时处理权限变更通知',
    icon: Bell
  }
]);

const maxTrendCount = computed(() => {
  return Math.max(1, ...loginTrend.value.map((item) => item.count));
});

const lastRefreshText = computed(() => {
  if (!lastRefreshAt.value) return '尚未刷新';
  return formatDateTime(lastRefreshAt.value);
});

/**
 * 首页数据加载策略：
 * 1. 并发请求提升首屏速度；
 * 2. 任一接口失败不阻断全局，按“--”降级显示。
 */
async function reloadDashboard() {
  if (loading.value) return;
  loading.value = true;

  const tasks = await Promise.allSettled([
    userAPI.getUsers(),
    roleAPI.getRoles(),
    permissionAPI.getPermissions(),
    messageAPI.listMessages({ page: 1, pageSize: 6 }),
    auditAPI.getLoginLogs({ page: 1, page_size: 80, username: '' })
  ]);

  const [usersRes, rolesRes, permsRes, messagesRes, logsRes] = tasks;

  if (usersRes.status === 'fulfilled') {
    userCount.value = usersRes.value.length;
    enabledUserCount.value = usersRes.value.filter((user) => user.status).length;
  } else {
    userCount.value = null;
    enabledUserCount.value = 0;
  }

  roleCount.value = rolesRes.status === 'fulfilled' ? rolesRes.value.length : null;
  permissionCount.value = permsRes.status === 'fulfilled' ? permsRes.value.length : null;

  if (messagesRes.status === 'fulfilled') {
    unreadMessageCount.value = messagesRes.value.unreadCount;
    recentMessages.value = messagesRes.value.items.slice(0, 5);
  } else {
    unreadMessageCount.value = null;
    recentMessages.value = [];
  }

  if (logsRes.status === 'fulfilled') {
    recentLogs.value = logsRes.value.list.slice(0, 8);
    loginTrend.value = buildSevenDayTrend(logsRes.value.list);
  } else {
    recentLogs.value = [];
    loginTrend.value = [];
  }

  lastRefreshAt.value = new Date();
  loading.value = false;
}

function toStatText(value: number | null): string {
  return value === null ? '--' : String(value);
}

function calcTrendPercent(value: number): number {
  return Math.max(8, Math.round((value / maxTrendCount.value) * 100));
}

/**
 * 生成近7天登录趋势（按本地日期聚合）。
 */
function buildSevenDayTrend(logs: LoginLogItem[]): TrendItem[] {
  const buckets = new Map<string, number>();

  logs.forEach((log) => {
    const day = String(log.created_at || '').slice(0, 10);
    if (!day) return;
    buckets.set(day, (buckets.get(day) || 0) + 1);
  });

  const result: TrendItem[] = [];
  const now = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    const day = toDayString(date);
    result.push({
      day,
      label: day.slice(5),
      count: buckets.get(day) || 0
    });
  }

  return result;
}

function toDayString(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mm = `${date.getMinutes()}`.padStart(2, '0');
  const ss = `${date.getSeconds()}`.padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

onMounted(() => {
  void reloadDashboard();
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.hero-main {
  min-width: 0;
}

.hero-title {
  margin: 0;
  font-size: clamp(21px, 2.6vw, 28px);
}

.hero-subtitle {
  margin: 8px 0 6px;
  color: var(--text-secondary);
}

.hero-time {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.kpi-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 18px;
  color: #fff;
  flex: 0 0 auto;
}

.kpi-icon-user {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
}

.kpi-icon-role {
  background: linear-gradient(135deg, #0ea5a4 0%, #2dd4bf 100%);
}

.kpi-icon-permission {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.kpi-icon-message {
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
}

.kpi-content {
  min-width: 0;
}

.kpi-title {
  font-size: 12px;
  color: #6b7280;
}

.kpi-value {
  margin-top: 2px;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 700;
  color: #0f172a;
}

.kpi-desc {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 12px;
}

.panel {
  padding: 14px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.panel-head h3 {
  margin: 0;
  font-size: 16px;
}

.panel-meta {
  font-size: 12px;
  color: #64748b;
}

.panel-empty {
  min-height: 120px;
  display: grid;
  place-items: center;
  color: #94a3b8;
}

.trend-wrap {
  height: 220px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 10px;
}

.trend-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}

.trend-bar {
  width: 100%;
  max-width: 30px;
  height: 148px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.trend-bar-fill {
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
  transition: height 0.25s ease;
}

.trend-label {
  font-size: 12px;
  color: #64748b;
}

.trend-count {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}

.message-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-item {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(248, 250, 252, 0.8);
}

.message-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.message-title {
  font-weight: 600;
  color: #111827;
}

.message-content {
  margin: 8px 0 6px;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.message-time {
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .trend-wrap {
    gap: 6px;
  }

  .trend-bar {
    max-width: 24px;
  }
}
</style>
