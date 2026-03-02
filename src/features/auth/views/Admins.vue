<!-- src/features/auth/views/Admins.vue - 管理员用户管理页面组件 -->
<template>
  <!-- 管理员用户容器 -->
  <div class="users-container">
    <!-- 页面标题 -->
    <div class="page-title">管理员用户</div>
    <!-- 工具栏 -->
    <div class="toolbar card">
      <!-- 搜索框 -->
      <el-input placeholder="搜索管理员" v-model="searchText" @clear="loadUsers" clearable class="search-input">
        <template #append>
          <el-button @click="loadUsers">搜索</el-button>
        </template>
      </el-input>
      <!-- 添加管理员按钮 -->
      <el-button type="primary" @click="openAddDialog">添加管理员</el-button>
    </div>

    <!-- 表格容器 -->
    <div class="table-container card">
      <!-- 管理员列表表格 -->
      <el-table :data="users" v-loading="loading">
        <!-- ID列 -->
        <el-table-column prop="id" label="ID" width="100"></el-table-column>
        <!-- 用户名列 -->
        <el-table-column prop="username" label="用户名"></el-table-column>
        <!-- 邮箱列 -->
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <!-- 创建时间列 -->
        <el-table-column prop="createdAt" label="创建时间" width="200"></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <!-- 编辑按钮 -->
              <el-tooltip content="编辑" placement="top">
                <el-button text size="small" @click="openEditDialog(scope.row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <!-- 删除按钮 -->
              <el-tooltip content="删除" placement="top">
                <el-button text size="small" type="danger" @click="deleteUser(scope.row.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
// 管理员用户管理页面逻辑
// 导入所需模块和组件
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue';
import adminAPI, { AdminUser } from "@/features/auth/api/admins";

// 管理员用户列表数据
const users = ref<(AdminUser)[]>([]);

// 加载状态
const loading = ref(false);

// 搜索文本
const searchText = ref('');

// 加载管理员用户列表
const loadUsers = async () => {
  loading.value = true;
  try {
    // 注意：这里我们仍然使用通用的 users API，但在实际应用中，您可能需要一个专门的管理员API
    const res = await adminAPI.getAdmins({ search: searchText.value });
    users.value = res as (AdminUser)[];
  } catch (error) {
    ElMessage.error('加载管理员列表失败');
  } finally {
    loading.value = false;
  }
};

// 打开添加管理员对话框
const openAddDialog = () => {
  // 实现添加管理员的逻辑
  ElMessage.info('添加管理员功能待实现');
};

// 打开编辑管理员对话框
const openEditDialog = (user: User) => {
  // 实现编辑管理员的逻辑
  ElMessage.info(`编辑管理员: ${user.username}`);
};

// 删除管理员用户
const deleteUser = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该管理员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消', 
      type: 'warning',
    });
    await userAPI.deleteUser(id);
    ElMessage.success('删除成功');
    loadUsers();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 组件挂载时加载数据
onMounted(loadUsers);
</script>

<style scoped>
/* 管理员用户管理页面样式 */
.users-container { padding: 20px; }
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.search-input { width: 300px; }
.table-container { background: #fff; }
.action-buttons { display: flex; gap: 8px; }
</style>
