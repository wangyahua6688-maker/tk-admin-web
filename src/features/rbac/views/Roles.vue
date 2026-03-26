<template>
  <div>
    <h2 class="page-title">角色管理</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按角色名/编码搜索" clearable style="max-width: 280px" />
      <el-button type="primary" @click="openCreate">新增角色</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredRoles" stripe>
        <el-table-column prop="name" label="角色名称" min-width="180" />
        <el-table-column prop="code" label="角色编码" min-width="200" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEdit(row)">编辑</el-button>
              <el-button text size="small" type="primary" @click="openPermissionDialog(row)">分配权限</el-button>
              <el-button text size="small" type="danger" @click="remove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="roleDialogVisible" :title="editing ? '编辑角色' : '新增角色'" width="480px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="角色名称" required>
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="角色编码" required>
          <el-input v-model="form.code" maxlength="100" show-word-limit placeholder="示例：admin / operator" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingRole" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialogVisible" title="分配角色权限" width="920px" destroy-on-close>
      <el-transfer
        v-model="selectedPermissionIds"
        class="permission-transfer"
        :data="permissionTransferList"
        :titles="['可选权限', '已选权限']"
        filterable
        :render-content="renderPermissionItem"
        :props="{ key: 'key', label: 'label' }"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingPermissions" @click="saveRolePermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, ElTooltip } from 'element-plus';
import roleAPI, { type Role } from '@/features/rbac/api/roles';
import permissionAPI, { type Permission } from '@/features/rbac/api/permissions';

/**
 * 列表与筛选状态。
 */
const keyword = ref('');
const roles = ref<Role[]>([]);
const permissions = ref<Permission[]>([]);

/**
 * 角色编辑弹窗状态。
 */
const roleDialogVisible = ref(false);
const editing = ref(false);
const savingRole = ref(false);
const form = reactive<{ id: string; name: string; code: string }>({
  id: '',
  name: '',
  code: ''
});

/**
 * 角色权限绑定弹窗状态。
 */
const permissionDialogVisible = ref(false);
const savingPermissions = ref(false);
const currentRoleId = ref('');
const selectedPermissionIds = ref<string[]>([]);

const filteredRoles = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return roles.value;
  return roles.value.filter((role) => `${role.name} ${role.code}`.toLowerCase().includes(q));
});

const permissionTransferList = computed(() => {
  return permissions.value
    .filter((permission) => permission.id)
    .map((permission) => ({
    key: permission.id,
    label: permission.name,
    code: permission.code
    }));
});

async function loadRoles() {
  roles.value = (await roleAPI.getRoles()).filter((role) => role.id);
}

async function loadPermissions() {
  // 去重，避免 transfer key 重复导致“点一个全选”。
  const raw = (await permissionAPI.getPermissions()).filter((permission) => permission.id);
  const map = new Map<string, Permission>();
  raw.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  permissions.value = Array.from(map.values());
}

function openCreate() {
  editing.value = false;
  Object.assign(form, { id: '', name: '', code: '' });
  roleDialogVisible.value = true;
}

function openEdit(role: Role) {
  editing.value = true;
  Object.assign(form, { id: role.id, name: role.name, code: role.code });
  roleDialogVisible.value = true;
}

function validateRoleForm(): boolean {
  if (!form.name.trim()) {
    ElMessage.warning('角色名称不能为空');
    return false;
  }
  if (!form.code.trim()) {
    ElMessage.warning('角色编码不能为空');
    return false;
  }
  return true;
}

async function saveRole() {
  if (!validateRoleForm()) return;

  savingRole.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim()
    };

    if (editing.value && form.id) {
      const updated = await roleAPI.updateRole(form.id, payload);
      const idx = roles.value.findIndex((item) => item.id === form.id);
      if (idx >= 0) roles.value[idx] = updated;
      ElMessage.success('角色更新成功');
    } else {
      const created = await roleAPI.createRole(payload);
      roles.value.unshift(created);
      ElMessage.success('角色创建成功');
    }

    roleDialogVisible.value = false;
  } finally {
    savingRole.value = false;
  }
}

async function remove(role: Role) {
  await ElMessageBox.confirm(`确认删除角色【${role.name}】吗？`, '删除确认', {
    type: 'warning'
  });

  await roleAPI.deleteRole(role.id);
  roles.value = roles.value.filter((item) => item.id !== role.id);
  ElMessage.success('角色删除成功');
}

/**
 * 打开权限分配弹窗，并回填当前角色已绑定权限。
 */
async function openPermissionDialog(role: Role) {
  try {
    if (!role.id) {
      ElMessage.warning('角色ID无效，无法分配权限');
      return;
    }
    if (permissions.value.length === 0) {
      await loadPermissions();
    }

    currentRoleId.value = role.id;
    const ids = await roleAPI.getRolePermissions(role.id);
    selectedPermissionIds.value = Array.from(new Set(ids)).filter((id) => id);
    permissionDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || '加载角色权限失败');
  }
}

async function saveRolePermissions() {
  if (!currentRoleId.value) return;

  savingPermissions.value = true;
  try {
    await roleAPI.assignRolePermissions(currentRoleId.value, selectedPermissionIds.value);
    permissionDialogVisible.value = false;
    ElMessage.success('角色权限保存成功');
  } catch (error: any) {
    ElMessage.error(error?.message || '角色权限保存失败');
  } finally {
    savingPermissions.value = false;
  }
}

/**
 * 穿梭框项渲染：
 * - 仅显示权限名称；
 * - 权限编码悬浮显示。
 */
function renderPermissionItem(_h: any, option: { label: string; code: string }) {
  return h(
    ElTooltip,
    {
      content: option.code || '无权限编码',
      placement: 'right'
    },
    {
      default: () => h('span', { class: 'permission-name' }, option.label)
    }
  );
}

onMounted(() => {
  void Promise.all([loadRoles(), loadPermissions()]);
});
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

:deep(.el-transfer-panel) {
  width: 440px;
}

:deep(.permission-transfer) {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

:deep(.permission-transfer .el-transfer-panel__item .el-checkbox__label) {
  max-width: 350px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.permission-transfer .permission-name) {
  display: inline-block;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

@media (max-width: 768px) {
  :deep(.permission-transfer) {
    flex-direction: column;
  }

  :deep(.permission-transfer .el-transfer-panel) {
    width: 100%;
  }
}
</style>
