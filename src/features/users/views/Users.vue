<!-- src/features/users/views/Users.vue - 用户管理页面组件 -->
<template>
  <!-- 用户管理容器 -->
  <div>
    <!-- 页面标题 -->
    <h2 class="page-title">用户管理</h2>
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 搜索框 -->
      <el-input v-model="q" placeholder="搜索用户" style="width:260px" clearable />
      <!-- 新增用户按钮 -->
      <el-button type="primary" @click="openCreate">新增用户</el-button>
    </div>
    <!-- 表格容器 -->
    <div class="card">
      <!-- 用户列表表格 -->
      <el-table :data="filtered" stripe>
        <!-- 姓名列 -->
        <el-table-column prop="name" label="姓名" />
        <!-- 邮箱列 -->
        <el-table-column prop="email" label="邮箱" />
        <!-- 角色列 -->
        <el-table-column prop="role" label="角色" />
        <!-- 操作列 -->
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <!-- 编辑按钮 -->
              <el-tooltip content="编辑" placement="top">
                <el-button text size="small" @click="edit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <!-- 删除按钮 -->
              <el-tooltip content="删除" placement="top">
                <el-button text size="small" type="danger" @click="remove(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="filtered.length"
        layout="prev, pager, next"
        class="pager"
      />
    </div>

    <!-- 用户编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑用户' : '新增用户'" :width="dialogWidth" destroy-on-close>
      <!-- 用户表单 -->
      <el-form :model="form" label-position="top">
        <!-- 姓名输入框 -->
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <!-- 邮箱输入框 -->
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
        <!-- 角色选择器 -->
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width:100%">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
            <el-option label="访客" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 对话框底部操作按钮 -->
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 用户管理页面逻辑
// 导入所需模块和组件
import { computed, reactive, ref } from 'vue';
import userAPI, { type User, CreateUserData, UpdateUserData } from '@/features/users/api/users';
import { Edit, Delete } from '@element-plus/icons-vue';

// 搜索关键词
const q = ref('');

// 响应式弹窗宽度 - 根据屏幕宽度调整对话框大小
const dialogWidth = computed(() => {
  const width = window.innerWidth;
  if (width < 768) return '90%';
  if (width < 1200) return '60%';
  return '40%';
});

// 分页相关状态
const page = ref(1);
const size = ref(10);

// 用户列表数据
const users = ref<User[]>([]);

// 加载用户列表
const loadUsers = async () => {
  try {
    users.value = await userAPI.getUsers();
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
};

// 过滤后的用户列表 - 根据搜索关键词过滤
const filtered = computed(() => users.value.filter(u =>
  [u.name, u.email, u.role].join(' ').toLowerCase().includes(q.value.toLowerCase())
));

// 对话框相关状态
const dialogVisible = ref(false);
const editing = ref(false);

// 表单数据
const form = reactive<User>({ id: '', name: '', email: '', role: 'viewer' });

// 打开新增用户对话框
function openCreate() {
  Object.assign(form, { id: '', name: '', email: '', role: 'viewer' });
  editing.value = false;
  dialogVisible.value = true;
}

// 编辑用户
function edit(row: User) {
  Object.assign(form, row);
  editing.value = true;
  dialogVisible.value = true;
}

// 保存用户
async function save() {
  try {
    if (editing.value) {
      // 更新用户
      const updatedUser = await userAPI.updateUser(form.id, form as UpdateUserData);
      const idx = users.value.findIndex(u => u.id === form.id);
      users.value[idx] = updatedUser;
    } else {
      // 创建新用户
      const newUser = await userAPI.createUser(form as CreateUserData);
      users.value.unshift(newUser);
    }
    dialogVisible.value = false;
  } catch (error) {
    console.error('保存用户失败:', error);
  }
}

// 删除用户
async function remove(row: User) {
  try {
    await userAPI.deleteUser(row.id);
    users.value = users.value.filter(u => u.id !== row.id);
  } catch (error) {
    console.error('删除用户失败:', error);
  }
}

// 初始化加载用户数据
loadUsers();
</script>

<style scoped>
/* 用户管理页面样式 */
.toolbar {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
}

.pager {
  margin-top: 20px;
  justify-content: center;
  display: flex;
}
</style>
