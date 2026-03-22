<template>
  <div class="state-page">
    <div class="state-card">
      <h2>403 无权限访问</h2>
      <p>当前账号没有该页面权限，请联系管理员分配角色或权限。</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/features/rbac/store/navigation';

const router = useRouter();
const navigation = useNavigationStore();

function goHome() {
  router.replace(navigation.firstPath || '/login');
}
</script>

<style scoped>
.state-page {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
}

.state-card {
  width: min(560px, 92vw);
  padding: 36px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 45px rgba(15, 23, 42, 0.12);
  text-align: center;
}

h2 {
  margin-bottom: 12px;
}

p {
  color: var(--text-secondary);
  margin-bottom: 18px;
}
</style>
