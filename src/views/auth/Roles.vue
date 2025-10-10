<!-- src/views/auth/Roles.vue - 角色管理页面组件 -->
<template>
  <!-- 角色管理容器 -->
  <div>
    <!-- 页面标题 -->
    <h2 class="page-title">角色管理</h2>
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 搜索框 -->
      <el-input v-model="q" placeholder="搜索角色" style="width:260px" clearable />
      <!-- 新增角色按钮 -->
      <el-button type="primary" @click="openCreate">新增角色</el-button>
    </div>
    <!-- 表格容器 -->
    <div class="card">
      <!-- 角色列表表格 -->
      <el-table :data="filtered" stripe>
        <!-- 角色名称列 -->
        <el-table-column prop="name" label="角色名称" />
        <!-- 角色描述列 -->
        <el-table-column prop="description" label="角色描述" />
        <!-- 操作列 -->
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <!-- 编辑按钮 -->
              <el-tooltip content="编辑" placement="top">
                <el-button text size="small" @click="edit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <!-- 分配权限按钮 -->
              <el-tooltip content="分配权限" placement="top">
                <el-button text size="small" @click="assignPermissions(row)">
                  <el-icon><Key /></el-icon>
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

    <!-- 角色编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑角色' : '新增角色'" :width="dialogWidth" destroy-on-close>
      <!-- 角色表单 -->
      <el-form :model="form" label-position="top">
        <!-- 角色名称输入框 -->
        <el-form-item label="角色名称"><el-input v-model="form.name" /></el-form-item>
        <!-- 角色描述输入框 -->
        <el-form-item label="角色描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
      </el-form>
      <!-- 对话框底部操作按钮 -->
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" :width="dialogWidth" destroy-on-close>
      <!-- 权限分配穿梭框 -->
      <el-transfer
        v-model="rolePermissionIds"
        :data="permissionList"
        :titles="['可选权限', '已选权限']"
        :props="{ key: 'key', label: 'label' }"
      />
      <!-- 对话框底部操作按钮 -->
      <template #footer>
        <el-button @click="permissionDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveRolePermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 角色管理页面逻辑
// 导入所需模块和组件
import { computed, reactive, ref } from 'vue';
import roleAPI, { type Role, CreateRoleData, UpdateRoleData } from '@/services/api/roles';
import permissionAPI, { type Permission } from '@/services/api/permissions';
import { Edit, Key, Delete } from '@element-plus/icons-vue';

// 搜索关键词
const q = ref('');

// 响应式弹窗宽度 - 根据屏幕宽度调整对话框大小
const dialogWidth = computed(() => {
  const width = window.innerWidth;
  if (width < 768) return '90%';
  if (width < 1200) return '60%';
  return '40%';
});

// 角色列表数据
const roles = ref<Role[]>([]);

// 权限列表数据
const permissions = ref<Permission[]>([]);

// 加载角色列表
const loadRoles = async () => {
  try {
    roles.value = await roleAPI.getRoles();
  } catch (error) {
    console.error('加载角色列表失败:', error);
  }
};

// 加载权限列表
const loadPermissions = async () => {
  try {
    permissions.value = await permissionAPI.getPermissions();
  } catch (error) {
    console.error('加载权限列表失败:', error);
  }
};

// 过滤后的角色列表 - 根据搜索关键词过滤
const filtered = computed(() => roles.value.filter(role =>
  [role.name, role.description].join(' ').toLowerCase().includes(q.value.toLowerCase())
));

// 用于权限分配的数据 - 将权限列表转换为穿梭框所需格式
const permissionList = computed(() => permissions.value.map(permission => ({
  key: permission.id,
  label: `${permission.name}(${permission.code})`
})));

// 角色编辑相关状态
const dialogVisible = ref(false);
const editing = ref(false);

// 角色表单数据
const form = reactive<Partial<Role>>({
  name: '',
  description: ''
});

// 权限分配相关状态
const permissionDialogVisible = ref(false);
const currentRoleId = ref('');
const rolePermissionIds = ref<string[]>([]);

// 打开新增角色对话框
function openCreate() {
  Object.assign(form, {
    name: '',
    description: ''
  });
  editing.value = false;
  dialogVisible.value = true;
}

// 编辑角色
function edit(row: Role) {
  Object.assign(form, row);
  editing.value = true;
  dialogVisible.value = true;
}

// 保存角色
async function save() {
  try {
    if (editing.value && form.id) {
      // 更新角色
      const updatedRole = await roleAPI.updateRole(form.id, form as UpdateRoleData);
      const idx = roles.value.findIndex(role => role.id === form.id);
      roles.value[idx] = updatedRole;
    } else {
      // 创建新角色
      const newRole = await roleAPI.createRole(form as CreateRoleData);
      roles.value.push(newRole);
    }
    dialogVisible.value = false;
  } catch (error) {
    console.error('保存角色失败:', error);
  }
}

// 删除角色
async function remove(row: Role) {
  try {
    await roleAPI.deleteRole(row.id);
    roles.value = roles.value.filter(role => role.id !== row.id);
  } catch (error) {
    console.error('删除角色失败:', error);
  }
}

// 分配权限 - 打开权限分配对话框
async function assignPermissions(role: Role) {
  currentRoleId.value = role.id;
  try {
    // 获取角色已有权限
    rolePermissionIds.value = await roleAPI.getRolePermissions(role.id);
    permissionDialogVisible.value = true;
  } catch (error) {
    console.error('获取角色权限失败:', error);
  }
}

// 保存角色权限
async function saveRolePermissions() {
  try {
    await roleAPI.assignRolePermissions(currentRoleId.value, rolePermissionIds.value);
    permissionDialogVisible.value = false;
  } catch (error) {
    console.error('保存角色权限失败:', error);
  }
}

// 初始化加载数据
loadRoles();
loadPermissions();
</script>

<style scoped>
/* 角色管理页面样式 */
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