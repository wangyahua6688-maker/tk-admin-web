<template>
  <div class="state-page">
    <div class="state-card">
      <h2>404 页面不存在</h2>
      <p>当前访问地址无效，请从左侧菜单进入业务页面。</p>
      <el-button type="primary" @click="goBack">返回可访问页面</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/features/rbac/store/navigation';

const router = useRouter();
const navigation = useNavigationStore();

function goBack() {
  router.replace(navigation.firstPath || '/login');
}
</script>

<style scoped>
.state-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 15% 20%, #e5efff 0, #f7f9fc 42%, #fdfdfd 100%);
}

.state-card {
  width: min(560px, 92vw);
  padding: 36px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.14);
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
