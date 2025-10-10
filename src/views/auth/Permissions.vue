<!-- src/views/auth/Permissions.vue - 权限管理页面组件 -->
<template>
  <!-- 权限管理容器 -->
  <div>
    <!-- 页面标题 -->
    <h2 class="page-title">权限管理</h2>
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 搜索框 -->
      <el-input v-model="q" placeholder="搜索权限" style="width:260px" clearable />
      <!-- 新增权限按钮 -->
      <el-button type="primary" @click="openCreate">新增权限</el-button>
    </div>
    <!-- 表格容器 -->
    <div class="card">
      <!-- 权限列表表格 -->
      <el-table :data="filtered" stripe>
        <!-- 权限名称列 -->
        <el-table-column prop="name" label="权限名称" />
        <!-- 权限代码列 -->
        <el-table-column prop="code" label="权限代码" />
        <!-- 权限描述列 -->
        <el-table-column prop="description" label="权限描述" />
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
    </div>

    <!-- 权限编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑权限' : '新增权限'" :width="dialogWidth" destroy-on-close>
      <!-- 权限表单 -->
      <el-form :model="form" label-position="top">
        <!-- 权限名称输入框 -->
        <el-form-item label="权限名称"><el-input v-model="form.name" /></el-form-item>
        <!-- 权限代码输入框 -->
        <el-form-item label="权限代码"><el-input v-model="form.code" /></el-form-item>
        <!-- 权限描述输入框 -->
        <el-form-item label="权限描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
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
// 权限管理页面逻辑
// 导入所需模块和组件
import { computed, reactive, ref } from 'vue';
import permissionAPI, { Permission, CreatePermissionData, UpdatePermissionData } from '@/services/api/permissions';
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

// 权限列表数据
const permissions = ref<Permission[]>([]);

// 加载权限列表
const loadPermissions = async () => {
  try {
    permissions.value = await permissionAPI.getPermissions();
  } catch (error) {
    console.error('加载权限列表失败:', error);
  }
};

// 过滤后的权限列表 - 根据搜索关键词过滤
const filtered = computed(() => permissions.value.filter(permission =>
  [permission.name, permission.code, permission.description].join(' ').toLowerCase().includes(q.value.toLowerCase())
));

// 对话框相关状态
const dialogVisible = ref(false);
const editing = ref(false);

// 权限表单数据
const form = reactive<Partial<Permission>>({
  name: '',
  code: '',
  description: ''
});

// 打开新增权限对话框
function openCreate() {
  Object.assign(form, {
    name: '',
    code: '',
    description: ''
  });
  editing.value = false;
  dialogVisible.value = true;
}

// 编辑权限
function edit(row: Permission) {
  Object.assign(form, row);
  editing.value = true;
  dialogVisible.value = true;
}

// 保存权限
async function save() {
  try {
    if (editing.value && form.id) {
      // 更新权限
      const updatedPermission = await permissionAPI.updatePermission(form.id, form as UpdatePermissionData);
      const idx = permissions.value.findIndex(permission => permission.id === form.id);
      permissions.value[idx] = updatedPermission;
    } else {
      // 创建新权限
      const newPermission = await permissionAPI.createPermission(form as CreatePermissionData);
      permissions.value.push(newPermission);
    }
    dialogVisible.value = false;
  } catch (error) {
    console.error('保存权限失败:', error);
  }
}

// 删除权限
async function remove(row: Permission) {
  try {
    await permissionAPI.deletePermission(row.id);
    permissions.value = permissions.value.filter(permission => permission.id !== row.id);
  } catch (error) {
    console.error('删除权限失败:', error);
  }
}

// 初始化加载权限数据
loadPermissions();
</script>

<style scoped>
/* 权限管理页面样式 */
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
</style>