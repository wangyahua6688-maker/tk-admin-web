<template>
  <div>
    <h2 class="page-title">权限管理</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按名称/编码/路径搜索" clearable style="max-width: 320px" />
      <el-button type="primary" @click="openCreate">新增权限</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredPermissions" stripe>
        <el-table-column prop="name" label="权限名称" min-width="160" />
        <el-table-column prop="code" label="权限编码" min-width="220" />
        <el-table-column prop="method" label="方法" width="110" />
        <el-table-column prop="path" label="接口路径" min-width="240" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEdit(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="remove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑权限' : '新增权限'" width="520px" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="权限名称" required>
          <el-input v-model="form.name" maxlength="100" />
        </el-form-item>
        <el-form-item label="权限编码" required>
          <el-input v-model="form.code" maxlength="100" placeholder="示例：sys:user:list" />
        </el-form-item>
        <el-form-item label="权限类型">
          <el-input model-value="API（固定）" disabled />
        </el-form-item>
        <el-form-item label="HTTP方法">
          <el-select v-model="form.method" style="width: 100%" clearable placeholder="可选">
            <el-option v-for="item in methods" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口路径">
          <el-input v-model="form.path" placeholder="示例：/api/users/" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import permissionAPI, { type Permission, type SavePermissionPayload } from '@/features/rbac/api/permissions';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const keyword = ref('');
const permissions = ref<Permission[]>([]);

const dialogVisible = ref(false);
const editing = ref(false);
const saving = ref(false);
const form = reactive<{ id: string; name: string; code: string; method: string; path: string }>({
  id: '',
  name: '',
  code: '',
  method: '',
  path: ''
});

const filteredPermissions = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return permissions.value;

  return permissions.value.filter((permission) =>
    `${permission.name} ${permission.code} ${permission.method} ${permission.path}`.toLowerCase().includes(q)
  );
});

async function loadPermissions() {
  permissions.value = await permissionAPI.getPermissions();
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: '',
    name: '',
    code: '',
    method: '',
    path: ''
  });
  dialogVisible.value = true;
}

function openEdit(permission: Permission) {
  editing.value = true;
  Object.assign(form, permission);
  dialogVisible.value = true;
}

function validateForm(): boolean {
  if (!form.name.trim()) {
    ElMessage.warning('权限名称不能为空');
    return false;
  }
  if (!form.code.trim()) {
    ElMessage.warning('权限编码不能为空');
    return false;
  }
  return true;
}

async function save() {
  if (!validateForm()) return;

  saving.value = true;
  try {
    const payload: SavePermissionPayload = {
      name: form.name.trim(),
      code: form.code.trim(),
      method: form.method.trim().toUpperCase(),
      path: form.path.trim()
    };

    if (editing.value && form.id) {
      const updated = await permissionAPI.updatePermission(form.id, payload);
      const idx = permissions.value.findIndex((item) => item.id === form.id);
      if (idx >= 0) permissions.value[idx] = updated;
      ElMessage.success('权限更新成功');
    } else {
      const created = await permissionAPI.createPermission(payload);
      permissions.value.unshift(created);
      ElMessage.success('权限创建成功');
    }

    dialogVisible.value = false;
  } finally {
    saving.value = false;
  }
}

async function remove(permission: Permission) {
  await ElMessageBox.confirm(`确认删除权限【${permission.name}】吗？`, '删除确认', {
    type: 'warning'
  });

  await permissionAPI.deletePermission(permission.id);
  permissions.value = permissions.value.filter((item) => item.id !== permission.id);
  ElMessage.success('权限删除成功');
}

onMounted(() => {
  void loadPermissions();
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
</style>
