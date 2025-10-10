<!-- src/layouts/AppHeader.vue - 顶部导航栏组件 -->
<template>
  <!-- 导航栏容器 -->
  <div class="navbar">
    <!-- 左侧区域 -->
    <div class="navbar-left">
      <!-- 折叠/展开按钮 -->
      <el-button 
        :icon="collapsed ? 'Expand' : 'Fold'" 
        circle 
        size="small" 
        @click="$emit('toggle-collapse')"
        class="collapse-btn"
      />
      <!-- 面包屑 -->
      <div class="breadcrumb">{{ $route.meta.title || $route.name }}</div>
    </div>
    <!-- 用户菜单区域 -->
    <div class="user-menu">
      <!-- 消息提醒 -->
      <el-badge :value="unreadCount" :max="99" class="item">
        <el-icon 
          style="font-size: 20px; margin-right: 20px; cursor: pointer;" 
          @click="openMessageCenter"
        >
          <Bell />
        </el-icon>
      </el-badge>
      <!-- 用户信息 -->
      <div style="display: flex; align-items: center;">
        <!-- 用户头像 -->
        <div class="avatar">{{ userInitial }}</div>
        <!-- 用户下拉菜单 -->
        <el-dropdown>
          <span class="el-dropdown-link" style="margin-left: 8px; cursor: pointer;">
            {{ auth.user?.name || '管理员' }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 个人信息 -->
              <el-dropdown-item @click="onProfile">
                <el-icon><User /></el-icon>
                个人信息
              </el-dropdown-item>
              <!-- 消息中心 -->
              <el-dropdown-item @click="onMessages">
                <el-icon><Message /></el-icon>
                消息中心
              </el-dropdown-item>
              <!-- 退出登录 -->
              <el-dropdown-item divided @click="onLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 消息中心 -->
    <MessageCenter ref="messageCenterRef" />
  </div>
</template>

<script setup lang="ts">
// 顶部导航栏逻辑
// 导入所需模块和组件
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { Bell, User, Message, SwitchButton, ArrowDown } from '@element-plus/icons-vue';
import MessageCenter from './MessageCenter.vue';

// 组件属性接口定义
interface Props {
  collapsed: boolean; // 侧边栏是否折叠
}

// 定义组件属性
defineProps<Props>();

// 定义组件事件
defineEmits<{
  'toggle-collapse': []; // 切换侧边栏折叠状态事件
}>();

// 获取认证状态管理实例
const auth = useAuthStore();

// 获取路由实例
const router = useRouter();

// 消息中心引用
const messageCenterRef = ref();

// 用户首字母计算属性 - 用于头像显示
const userInitial = computed(() => auth.user?.name?.charAt(0).toUpperCase() || 'A');

// 未读消息数量
const unreadCount = ref(2); // 模拟未读消息数量

// 退出登录处理函数
function onLogout() {
  auth.logout();
  router.replace('/login');
}

// 个人信息处理函数
function onProfile() {
  // 跳转到个人信息页面
  console.log('跳转到个人信息页面');
}

// 消息中心处理函数
function onMessages() {
  // 跳转到消息中心页面
  openMessageCenter();
}

// 打开消息中心
function openMessageCenter() {
  messageCenterRef.value?.open();
}
</script>

<style scoped>
.navbar {
  height: 60px;
  background: #fff;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  margin-right: 8px;
}

.breadcrumb {
  font-size: 16px;
  font-weight: 500;
}

.user-menu {
  display: flex;
  align-items: center;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

@media (max-width: 992px) {
  .navbar { padding: 0 12px; }
  .breadcrumb { font-size: 14px; }
}
</style>


