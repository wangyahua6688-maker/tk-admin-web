<template>
  <div>
    <h2 class="page-title">菜单管理</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按菜单名/路径搜索" clearable style="max-width: 320px" />
      <el-button type="primary" @click="openCreate">新增菜单</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredMenus" stripe>
        <el-table-column prop="name" label="菜单名称" min-width="160" />
        <el-table-column prop="path" label="路径" min-width="180" />
        <el-table-column prop="component" label="组件路径" min-width="180" show-overflow-tooltip />
        <el-table-column label="图标" width="220">
          <template #default="{ row }">
            <div v-if="row.icon" class="icon-cell">
              <MenuIcon :icon="row.icon" :size="16" />
              <span>{{ getMenuIconDisplayName(row.icon) }}</span>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="parentName" label="父菜单" min-width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEdit(row)">编辑</el-button>
              <el-button text size="small" type="primary" @click="openBindPermissions(row)">关联权限</el-button>
              <el-button text size="small" type="danger" @click="remove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑菜单' : '新增菜单'" width="860px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="菜单名称" required>
          <el-input v-model="form.name" maxlength="200" />
        </el-form-item>

        <el-form-item label="路由路径" required>
          <el-input v-model="form.path" placeholder="示例：/system/users" />
        </el-form-item>

        <el-form-item label="组件路径">
          <el-input v-model="form.component" placeholder="示例：system/user/index" />
        </el-form-item>

        <el-form-item label="图标">
          <div ref="iconSelectorRoot" class="icon-selector">
            <div class="icon-input" @click.stop="toggleIconSelector">
              <template v-if="form.icon">
                <MenuIcon :icon="form.icon" :size="16" />
                <span class="icon-input-text">{{ getMenuIconDisplayName(form.icon) }}</span>
              </template>
              <span v-else class="icon-input-placeholder">点击选择图标（九宫格）</span>
              <el-icon class="icon-input-arrow"><ArrowDown /></el-icon>
            </div>

            <transition name="icon-fade">
              <div v-show="iconSelectorVisible" class="icon-panel icon-panel-floating" @click.stop>
                <div class="icon-panel-tools">
                  <el-input
                    v-model="iconKeyword"
                    placeholder="搜索图标名"
                    clearable
                    style="flex: 1"
                  />
                  <el-button text :disabled="!form.icon" @click="clearSelectedIcon">清空</el-button>
                </div>

                <el-tabs v-model="activeIconLibrary" class="icon-tabs" stretch>
                  <el-tab-pane
                    v-for="library in filteredIconLibraries"
                    :key="library.key"
                    :name="library.key"
                    :label="`${library.title}（${library.options.length}）`"
                  >
                    <div v-if="library.options.length > 0" class="icon-grid-scroll">
                      <div class="icon-grid">
                        <button
                          v-for="option in library.options"
                          :key="option.value"
                          type="button"
                          class="icon-item"
                          :class="{ active: normalizedFormIcon === option.value }"
                          :title="option.label"
                          @click="selectIcon(option.value)"
                        >
                          <MenuIcon :icon="option.value" :size="18" />
                          <span class="icon-name">{{ option.label }}</span>
                        </button>
                      </div>
                    </div>
                    <el-empty v-else description="未找到匹配图标" :image-size="80" />
                  </el-tab-pane>
                </el-tabs>
              </div>
            </transition>
          </div>
        </el-form-item>

        <el-form-item label="父菜单">
          <el-select v-model="form.parentId" style="width: 100%" clearable>
            <el-option label="无（根菜单）" value="" />
            <el-option
              v-for="item in parentCandidates"
              :key="item.id"
              :label="`${item.name} (${item.path})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialogVisible" title="关联菜单可见权限" width="1040px" destroy-on-close>
      <div class="dialog-subtitle">
        当前菜单：<strong>{{ currentMenu?.name || '-' }}</strong>
      </div>
      <div class="dialog-desc">
        说明：左侧可选权限，右侧已选权限；列表仅显示权限名称，权限编码悬浮展示在当前行右侧空白区。
      </div>

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
        <el-button type="primary" :loading="savingMenuPermissions" @click="saveMenuPermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, ElTooltip } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import menuAPI, { type MenuItem, type SaveMenuPayload, type MenuPermissionItem } from '@/features/rbac/api/menus';
import MenuIcon from '@/features/rbac/components/MenuIcon.vue';
import {
  type MenuIconLibrary,
  getMenuIconDisplayName,
  menuIconLibraries,
  normalizeMenuIconValue
} from '@/features/rbac/utils/menu-icons';
import { useNavigationStore } from '@/features/rbac/store/navigation';

interface MenuPermissionTransferItem {
  key: string;
  label: string;
  code: string;
}

const router = useRouter();
const navigation = useNavigationStore();

const keyword = ref('');
const menus = ref<MenuItem[]>([]);
const permissionOptions = ref<MenuPermissionItem[]>([]);

const dialogVisible = ref(false);
const editing = ref(false);
const saving = ref(false);

const form = reactive<{ id: string; name: string; path: string; icon: string; parentId: string; sort: number; component: string }>({
  id: '',
  name: '',
  path: '',
  icon: '',
  parentId: '',
  sort: 0,
  component: ''
});

/**
 * 图标选择器状态。
 * 说明：仅当点击图标输入框时，才展开九宫格图标面板。
 */
const iconSelectorVisible = ref(false);
const iconSelectorRoot = ref<HTMLElement | null>(null);
const iconKeyword = ref('');
const activeIconLibrary = ref<MenuIconLibrary>('ep');

const permissionDialogVisible = ref(false);
const currentMenu = ref<MenuItem | null>(null);
const selectedPermissionIds = ref<string[]>([]);
const savingMenuPermissions = ref(false);

const filteredMenus = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return menus.value;
  return menus.value.filter((item) => `${item.name} ${item.path} ${item.parentName}`.toLowerCase().includes(q));
});

const normalizedFormIcon = computed(() => {
  return form.icon ? normalizeMenuIconValue(form.icon) : '';
});

/**
 * 图标库过滤结果（按关键字搜索）。
 */
const filteredIconLibraries = computed(() => {
  const q = iconKeyword.value.trim().toLowerCase();
  return menuIconLibraries.map((library) => {
    if (!q) return library;

    const options = library.options.filter((option) => {
      const text = `${option.label} ${option.value}`.toLowerCase();
      return text.includes(q);
    });

    return {
      ...library,
      options
    };
  });
});

/**
 * 仅允许选择“非当前菜单”作为父菜单，避免出现自引用。
 */
const parentCandidates = computed(() => {
  return menus.value.filter((item) => item.id !== form.id);
});

const permissionTransferList = computed<MenuPermissionTransferItem[]>(() => {
  const map = new Map<string, MenuPermissionTransferItem>();
  permissionOptions.value
    .filter((item) => item.id)
    .forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, {
          key: item.id,
          label: item.name,
          code: item.code
        });
      }
    });

  return Array.from(map.values());
});

async function reloadMenus() {
  menus.value = await menuAPI.getMenus();
}

async function reloadPermissionOptions() {
  permissionOptions.value = (await menuAPI.getPermissionOptions()).filter((item) => item.id);
}

/**
 * 刷新左侧 RBAC 菜单树。
 */
async function refreshSidebarMenus() {
  if (!navigation.initialized) return;
  try {
    await navigation.refresh(router);
  } catch (error: any) {
    ElMessage.warning(error?.message || '菜单已保存，但左侧导航刷新失败，请重新登录后重试');
  }
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: '',
    name: '',
    path: '',
    icon: '',
    parentId: '',
    sort: 0,
    component: ''
  });

  iconKeyword.value = '';
  activeIconLibrary.value = 'ep';
  iconSelectorVisible.value = false;
  dialogVisible.value = true;
}

function openEdit(menu: MenuItem) {
  editing.value = true;
  Object.assign(form, {
    id: menu.id,
    name: menu.name,
    path: menu.path,
    icon: menu.icon ? normalizeMenuIconValue(menu.icon) : '',
    parentId: menu.parentId,
    sort: menu.sort,
    component: menu.component
  });

  iconKeyword.value = '';
  activeIconLibrary.value = form.icon.startsWith('lucide:') ? 'lucide' : 'ep';
  iconSelectorVisible.value = false;
  dialogVisible.value = true;
}

function clearSelectedIcon() {
  form.icon = '';
}

/**
 * 手动切换图标选择面板。
 * 说明：使用手动控制可避免 Popover 在复杂弹窗中出现“点击后瞬间关闭”的问题。
 */
function toggleIconSelector() {
  iconSelectorVisible.value = !iconSelectorVisible.value;
}

function selectIcon(iconValue: string) {
  form.icon = iconValue;
  iconSelectorVisible.value = false;
}

/**
 * 点击图标选择器外部区域时自动关闭面板。
 */
function handleDocumentClick(event: MouseEvent) {
  if (!iconSelectorVisible.value) return;
  const root = iconSelectorRoot.value;
  if (!root) return;

  const target = event.target as Node | null;
  if (target && root.contains(target)) return;
  iconSelectorVisible.value = false;
}

function validateMenuForm(): boolean {
  if (!form.name.trim()) {
    ElMessage.warning('菜单名称不能为空');
    return false;
  }
  if (!form.path.trim()) {
    ElMessage.warning('菜单路径不能为空');
    return false;
  }
  if (!form.path.startsWith('/')) {
    ElMessage.warning('菜单路径必须以 / 开头');
    return false;
  }
  if (form.parentId && form.parentId === form.id) {
    ElMessage.warning('父菜单不能选择自身');
    return false;
  }
  return true;
}

async function save() {
  if (!validateMenuForm()) return;

  const payload: SaveMenuPayload = {
    name: form.name.trim(),
    path: form.path.trim(),
    icon: form.icon,
    parentId: form.parentId,
    sort: Number(form.sort || 0),
    component: form.component.trim()
  };

  saving.value = true;
  try {
    if (editing.value && form.id) {
      await menuAPI.updateMenu(form.id, payload);
      ElMessage.success('菜单更新成功');
    } else {
      await menuAPI.createMenu(payload);
      ElMessage.success('菜单创建成功');
    }

    dialogVisible.value = false;
    await reloadMenus();
    await refreshSidebarMenus();
  } finally {
    saving.value = false;
  }
}

async function remove(menu: MenuItem) {
  await ElMessageBox.confirm(`确认删除菜单【${menu.name}】吗？`, '删除确认', {
    type: 'warning'
  });

  await menuAPI.deleteMenu(menu.id);
  ElMessage.success('菜单删除成功');
  await reloadMenus();
  await refreshSidebarMenus();
}

/**
 * 菜单权限绑定：
 * 1. 打开弹窗时拉取当前菜单已绑定权限；
 * 2. 保存时做全量覆盖。
 */
async function openBindPermissions(menu: MenuItem) {
  try {
    if (!menu.id) {
      ElMessage.warning('菜单ID无效，无法关联权限');
      return;
    }
    if (permissionOptions.value.length === 0) {
      await reloadPermissionOptions();
    }

    currentMenu.value = menu;
    const ids = await menuAPI.getMenuPermissions(menu.id);
    selectedPermissionIds.value = Array.from(new Set(ids)).filter((id) => id);
    permissionDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || '加载菜单关联权限失败');
  }
}

async function saveMenuPermissions() {
  if (!currentMenu.value) return;

  savingMenuPermissions.value = true;
  try {
    await menuAPI.bindMenuPermissions(currentMenu.value.id, selectedPermissionIds.value);
    permissionDialogVisible.value = false;
    ElMessage.success('菜单权限保存成功');
    await refreshSidebarMenus();
  } catch (error: any) {
    ElMessage.error(error?.message || '菜单权限保存失败');
  } finally {
    savingMenuPermissions.value = false;
  }
}

/**
 * 穿梭框渲染函数：
 * - 列表只显示权限名称；
 * - 权限编码通过悬浮提示展示在当前行右侧。
 */
function renderPermissionItem(_h: any, option: MenuPermissionTransferItem) {
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
  document.addEventListener('click', handleDocumentClick, true);
  void Promise.all([reloadMenus(), reloadPermissionOptions()]);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick, true);
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

.dialog-subtitle {
  margin-bottom: 14px;
  color: var(--text-secondary);
}

.dialog-desc {
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--text-secondary);
}

.icon-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.icon-input {
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.icon-input:hover {
  border-color: #93c5fd;
}

.icon-input-text {
  color: var(--text-primary);
}

.icon-input-placeholder {
  color: #94a3b8;
}

.icon-input-arrow {
  margin-left: auto;
  color: #94a3b8;
}

.icon-selector {
  position: relative;
}

.icon-panel-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.icon-panel-floating {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: min(560px, calc(100vw - 120px));
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  z-index: 2200;
}

.icon-tabs {
  margin-top: 4px;
}

.icon-grid-scroll {
  max-height: 248px;
  overflow-y: auto;
  padding-right: 4px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.icon-item {
  height: 74px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.icon-item.active {
  border-color: #3b82f6;
  background: #dbeafe;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.icon-name {
  font-size: 12px;
  color: #334155;
  max-width: 92px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-transfer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

:deep(.permission-transfer .el-transfer-panel) {
  width: 470px;
}

:deep(.permission-transfer .el-transfer-panel__item .el-checkbox__label) {
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.permission-transfer .permission-name) {
  display: inline-block;
  max-width: 330px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

@media (max-width: 1100px) {
  :deep(.permission-transfer .el-transfer-panel) {
    width: 420px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .icon-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .permission-transfer {
    flex-direction: column;
  }

  :deep(.permission-transfer .el-transfer-panel) {
    width: 100%;
  }
}
</style>
