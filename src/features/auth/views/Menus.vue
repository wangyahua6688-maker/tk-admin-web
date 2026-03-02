<!-- src/features/auth/views/Menus.vue - 菜单管理页面组件 -->
<template>
  <!-- 菜单管理容器 -->
  <div>
    <!-- 页面标题 -->
    <h2 class="page-title">菜单管理</h2>
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 搜索框 -->
      <el-input v-model="q" placeholder="搜索菜单" style="width:260px" clearable />
      <!-- 新增菜单按钮 -->
      <el-button type="primary" @click="openCreate">新增菜单</el-button>
    </div>
    <!-- 表格容器 -->
    <div class="card">
      <!-- 菜单列表表格 -->
      <el-table :data="filtered" stripe>
        <!-- 菜单名称列 -->
        <el-table-column prop="name" label="菜单名称" />
        <!-- 路径列 -->
        <el-table-column prop="path" label="路径" />
        <!-- 图标列 -->
        <el-table-column prop="icon" label="图标">
          <template #default="{ row }">
            <div v-if="row.icon" style="display: flex; align-items: center; gap: 8px;">
              <el-icon>
                <component :is="iconMap[row.icon] || iconMap.Menu" />
              </el-icon>
              <span>{{ row.icon }}</span>
            </div>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <!-- 父菜单列 -->
        <el-table-column prop="parentName" label="父菜单" />
        <!-- 排序列 -->
        <el-table-column prop="sort" label="排序" width="80" />
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

    <!-- 菜单编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑菜单' : '新增菜单'" :width="dialogWidth" destroy-on-close>
      <!-- 菜单表单 -->
      <el-form :model="form" label-position="top">
        <!-- 菜单名称输入框 -->
        <el-form-item label="菜单名称"><el-input v-model="form.name" /></el-form-item>
        <!-- 路径输入框 -->
        <el-form-item label="路径"><el-input v-model="form.path" /></el-form-item>
        <!-- 图标选择器 -->
        <el-form-item label="图标">
          <!-- 图标选择表单框 -->
          <div ref="iconInputRef" class="icon-input-wrapper" style="position: relative; width: 100%;">
            <el-input 
              v-model="iconDisplayText" 
              placeholder="点击选择图标" 
              readonly 
              style="cursor: pointer; width: 100%;"
              @click="showIconSelector"
            >
              <template #prefix>
                <el-icon v-if="form.icon" :size="18"><component :is="iconMap[form.icon]" /></el-icon>
              </template>
            </el-input>
            
            <!-- 浮动图标选择器 - 现在位于输入框内部，实现真正的浮动效果 -->
            <div 
              v-if="iconSelectorVisible"
              class="icon-selector-container"
              :style="{
                position: 'absolute',
                top: '100%',
                left: '0',
                zIndex: 2000,
                backgroundColor: '#fff',
                borderRadius: '6px',
                boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
                padding: '12px',
                width: '320px',
                maxHeight: '400px',
                overflow: 'hidden'
              }"
            >
              <!-- 搜索框 -->
              <el-input 
                v-model="iconSearchQuery" 
                placeholder="搜索图标" 
                style="margin-bottom: 12px;"
              >
                <template #prefix>
                  <el-icon><component :is="iconMap['Search']" /></el-icon>
                </template>
              </el-input>
              
              <!-- 图标网格 - 调整为3-4列布局，减小图标项大小 -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; max-height: 250px; overflow-y: auto; overflow-x: hidden;">
                <div 
                  v-for="icon in filteredIcons" 
                  :key="icon.value"
                  @click="selectIcon(icon.value)"
                  :class="{ 'selected': form.icon === icon.value }"
                  style="cursor: pointer; padding: 6px; text-align: center; border: 1px solid #dcdfe6; border-radius: 4px; transition: all 0.3s;"
                  :style="{
                    backgroundColor: form.icon === icon.value ? '#409eff' : 'transparent',
                    color: form.icon === icon.value ? '#fff' : '#606266'
                  }"
                >
                  <div v-if="icon.value" style="display: block; margin: 0 auto 2px;">
                    <el-icon :size="16"><component :is="iconMap[icon.value]" /></el-icon>
                  </div>
                  <div v-else style="height: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2px;">
                    <span style="font-size: 8px; color: #909399;">无</span>
                  </div>
                  <span style="font-size: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; max-width: 100%;">{{ icon.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        
        <!-- 父菜单选择器 -->
        <el-form-item label="父菜单">
          <el-select v-model="form.parentId" style="width:100%">
            <el-option label="无" value="" />
            <el-option v-for="menu in parentMenus" :key="menu.id" :label="menu.name" :value="menu.id" />
          </el-select>
        </el-form-item>
        <!-- 排序输入框 -->
        <el-form-item label="排序"><el-input v-model="form.sort" type="number" /></el-form-item>
        <!-- 是否显示开关 -->
        <el-form-item label="是否显示">
          <el-switch v-model="form.visible" />
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
// 菜单管理页面逻辑
// 导入所需模块和组件
import { computed, reactive, ref, onUnmounted } from 'vue';
import menuAPI, { Menu, CreateMenuData, UpdateMenuData } from '@/features/auth/api/menus';
import * as Icons from '@element-plus/icons-vue';
import { Edit, Delete } from '@element-plus/icons-vue';

// 图标映射对象
const iconMap = Icons as unknown as Record<string, any>;

// 图标显示文本 - 根据选中的图标值显示对应文本
const iconDisplayText = computed(() => {
  if (!form.icon) return '';
  return form.icon;
});

// 图标选择器显示状态
const iconSelectorVisible = ref(false);

// 图标选择器位置（占位，当前不计算绝对定位）
const iconSelectorPosition = reactive({ top: 0, left: 0 });

// 图标输入框引用
const iconInputRef = ref<HTMLElement>();

// 图标搜索查询
const iconSearchQuery = ref('');

// 图标项接口定义
interface IconItem {
  value: string;
  label: string;
}

// 过滤后的图标列表 - 根据搜索关键词过滤
const filteredIcons = computed(() => {
  if (!iconSearchQuery.value) {
    return allIcons.value as IconItem[];
  }
  const query = iconSearchQuery.value.toLowerCase();
  return (allIcons.value as IconItem[]).filter((icon: IconItem) =>
    icon.label.toLowerCase().includes(query) ||
    icon.value.toLowerCase().includes(query)
  );
});

// 所有Element Plus图标列表
const allIcons = computed(() => {
  const icons = Object.keys(Icons).filter(key => 
    // 过滤掉非图标组件
    key !== 'default' && 
    typeof Icons[key as keyof typeof Icons] === 'object' && 
    // 排除一些特殊组件
    !key.toLowerCase().includes('install') &&
    !key.toLowerCase().includes('version')
  );
  
  // 添加无图标选项
  return [{ value: '', label: '无图标' }, ...icons.map(key => ({ value: key, label: key }))];
});

// 显示图标选择器
function showIconSelector() {
  iconSelectorVisible.value = true;
  // 添加点击事件监听器
  setTimeout(() => {
    window.addEventListener('click', handleClickOutside);
  }, 10);
}

// 关闭图标选择器
function closeIconSelector() {
  iconSelectorVisible.value = false;
  // 移除点击事件监听器
  window.removeEventListener('click', handleClickOutside);
}

// 选择图标
function selectIcon(iconValue: string) {
  form.icon = iconValue;
  closeIconSelector();
}

// 点击其他地方关闭图标选择器
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (iconInputRef.value && !iconInputRef.value.contains(target as Node) && 
      iconSelectorVisible.value && 
      !(target && typeof target.closest === 'function' && target.closest('.icon-selector-container'))) {
    closeIconSelector();
  }
}

// 在组件卸载时确保移除事件监听器
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});

// 搜索关键词
const q = ref('');

// 响应式弹窗宽度 - 根据屏幕宽度调整对话框大小
const dialogWidth = computed(() => {
  const width = window.innerWidth;
  if (width < 768) return '90%';
  if (width < 1200) return '60%';
  return '40%';
});

// 图标组件映射对象（保留占位，实际使用 iconMap）
const iconComponents = { ...Icons };

// 菜单列表数据
const menus = ref<Menu[]>([]);

// 父菜单列表数据
const parentMenus = ref<Menu[]>([]);

// 加载菜单列表
const loadMenus = async () => {
  try {
    menus.value = await menuAPI.getMenus();
    parentMenus.value = menus.value.filter(menu => !menu.parentId);
  } catch (error) {
    console.error('加载菜单列表失败:', error);
  }
};

// 过滤后的菜单列表 - 根据搜索关键词过滤
const filtered = computed(() => menus.value.filter(menu =>
  [menu.name, menu.path, menu.icon, menu.parentName].join(' ').toLowerCase().includes(q.value.toLowerCase())
));

// 对话框相关状态
const dialogVisible = ref(false);
const editing = ref(false);

// 菜单表单数据
const form = reactive<Partial<Menu>>({
  name: '',
  path: '',
  icon: '',
  parentId: '',
  sort: 0,
  visible: true
});

// 打开新增菜单对话框
function openCreate() {
  Object.assign(form, {
    name: '',
    path: '',
    icon: '',
    parentId: '',
    sort: 0,
    visible: true
  });
  editing.value = false;
  dialogVisible.value = true;
}

// 编辑菜单
function edit(row: Menu) {
  Object.assign(form, row);
  editing.value = true;
  dialogVisible.value = true;
}

// 保存菜单
async function save() {
  try {
    if (editing.value && form.id) {
      // 更新菜单
      const updatedMenu = await menuAPI.updateMenu(form.id, form as UpdateMenuData);
      const idx = menus.value.findIndex(menu => menu.id === form.id);
      menus.value[idx] = updatedMenu;
    } else {
      // 创建新菜单
      const newMenu = await menuAPI.createMenu(form as CreateMenuData);
      menus.value.push(newMenu);
    }
    dialogVisible.value = false;
    loadMenus(); // 重新加载菜单列表
  } catch (error) {
    console.error('保存菜单失败:', error);
  }
}

// 删除菜单
async function remove(row: Menu) {
  try {
    await menuAPI.deleteMenu(row.id);
    menus.value = menus.value.filter(menu => menu.id !== row.id);
  } catch (error) {
    console.error('删除菜单失败:', error);
  }
}

// 初始化加载菜单数据
loadMenus();
</script>

<style scoped>
/* 菜单管理页面样式 */
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
