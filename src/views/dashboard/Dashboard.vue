<!-- src/views/dashboard/Dashboard.vue - 仪表盘页面组件 -->
<template>
  <!-- 仪表盘容器 -->
  <div class="dashboard">
    <!-- 页面标题 -->
    <h2 class="page-title">仪表盘</h2>
    <!-- 网格布局 -->
    <div class="grid">
      <!-- 数据概览卡片 -->
      <div class="card">
        <div class="card-header">概览</div>
        <div class="stats">
          <!-- 活跃用户统计 -->
          <div class="stat"><div class="num">1,248</div><div class="label">活跃用户</div></div>
          <!-- 在线率统计 -->
          <div class="stat"><div class="num">98.2%</div><div class="label">在线率</div></div>
          <!-- 新订单统计 -->
          <div class="stat"><div class="num">432</div><div class="label">新订单</div></div>
        </div>
      </div>
      <!-- 快速操作卡片 -->
      <div class="card">
        <div class="card-header">快速操作</div>
        <el-space wrap>
          <el-button type="primary">新增用户</el-button>
          <el-button>导出报表</el-button>
          <el-button>系统设置</el-button>
        </el-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 仪表盘页面逻辑
// 当前组件无特殊逻辑，主要展示静态数据
</script>

<style scoped>
/* 仪表盘页面样式 */
.dashboard {
  width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.card-header {
  font-weight: 600;
  margin-bottom: 20px;
  font-size: 16px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat {
  background: #f8f9fa;
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.num {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
}

.label {
  color: var(--text-light);
}

/* 响应式设计 - 平板设备 */
@media (max-width: 992px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>