<!-- src/layouts/AppShell.vue - 应用主布局组件 -->
<template>
  <!-- 应用容器 -->
  <div class="app-container">
    <!-- 侧边栏菜单 -->
    <SidebarMenu :collapsed="collapsed" />
    <!-- 主容器 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <AppHeader :collapsed="collapsed" @toggle-collapse="toggleCollapse" />
      <!-- 主内容区域 -->
      <div class="app-main">
        <!-- 路由视图出口 -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 应用主布局逻辑
// 导入所需组件
import { ref } from 'vue';
import SidebarMenu from '@/layouts/SidebarMenu.vue';
import AppHeader from '@/layouts/AppHeader.vue';

// 侧边栏折叠状态
const collapsed = ref(false);

// 切换侧边栏折叠状态
function toggleCollapse() {
  collapsed.value = !collapsed.value;
}
</script>

<style scoped>
/* 应用主布局样式 */
.app-container { 
  display: flex; 
  min-height: 100vh; 
}

.main-container { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
}

.app-main { 
  flex: 1; 
  padding: 20px; 
  overflow-y: auto; 
  background-color: #fff; 
  border-radius: var(--radius); 
  margin: 20px; 
  box-shadow: var(--shadow); 
}

/* 响应式设计 - 平板设备 */
@media (max-width: 768px) { 
  .app-main { 
    padding: 12px; 
  } 
}
</style>