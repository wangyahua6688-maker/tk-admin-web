<template>
  <div class="page-grid">
    <section class="card">
      <div class="inner-toolbar">
        <h2 class="page-title">图库管理（分类配置）</h2>
        <div class="toolbar-actions">
          <el-input
            v-model="categoryKeyword"
            placeholder="按分类键/名称/关键字搜索"
            clearable
            style="max-width: 340px"
            @keyup.enter="reloadCategories"
          />
          <el-button @click="reloadCategories">搜索</el-button>
          <el-button type="primary" @click="openCreateCategory">新增分类</el-button>
        </div>
      </div>

      <el-table :data="categories" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="category_key" label="分类键" min-width="120" />
        <el-table-column prop="name" label="分类名称" min-width="140" />
        <el-table-column prop="search_keywords" label="搜索关键字" min-width="260" show-overflow-tooltip />
        <el-table-column label="首页展示" width="110">
          <template #default="{ row }">
            <el-tag :type="Number(row.show_on_home) === 1 ? 'success' : 'info'">
              {{ Number(row.show_on_home) === 1 ? '展示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'warning'">
              {{ Number(row.status) === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEditCategory(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="removeCategory(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="card">
      <div class="inner-toolbar">
        <h2>图库内容管理（按分类归档 + 动物竞猜码）</h2>
        <div class="toolbar-actions">
          <el-input v-model="infoKeyword" placeholder="按期号/标题搜索" clearable style="max-width: 260px" />
          <el-button type="primary" @click="openCreateInfo">新增图库内容</el-button>
        </div>
      </div>

      <el-table :data="filteredInfos" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="图库分类" min-width="150">
          <template #default="{ row }">
            {{ categoryLabel(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="issue" label="期号" width="110" />
        <el-table-column prop="title" label="标题" min-width="140" />
        <el-table-column label="动物竞猜码" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ optionNamesText(row.id) }}
          </template>
        </el-table-column>
        <el-table-column prop="draw_code" label="暗码" min-width="120" />
        <el-table-column label="互动统计" min-width="220">
          <template #default="{ row }">
            👍{{ row.likes_count || 0 }} / 💬{{ row.comment_count || 0 }} / ☆{{ row.favorite_count || 0 }} / 👁{{ row.read_count || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="投票配置" width="150">
          <template #default="{ row }">
            {{ Number(row.poll_enabled) === 1 ? '显示' : '隐藏' }} / {{ Number(row.poll_default_expand) === 1 ? '默认展开' : '默认收起' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'warning'">{{ Number(row.status) === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEditInfo(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="removeInfo(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="categoryDialogVisible" :title="editingCategory ? '编辑分类' : '新增分类'" width="560px" destroy-on-close>
      <el-form label-position="top" :model="categoryForm">
        <el-form-item label="分类键" required>
          <el-input v-model="categoryForm.category_key" maxlength="32" placeholder="如：九肖系列" />
        </el-form-item>

        <el-form-item label="分类名称" required>
          <el-input v-model="categoryForm.name" maxlength="32" />
        </el-form-item>

        <el-form-item label="搜索关键字">
          <el-input v-model="categoryForm.search_keywords" maxlength="255" placeholder="多个关键字可空格分隔" />
        </el-form-item>

        <el-form-item label="首页展示">
          <el-switch v-model="categoryForm.show_on_home" active-text="启用" inactive-text="停用" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="categoryForm.status" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingCategory" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="infoDialogVisible" :title="editingInfo ? '编辑图库内容' : '新增图库内容'" width="960px" destroy-on-close>
      <el-form :model="infoForm" label-position="top">
        <el-form-item label="图库分类（单选）" required>
          <el-select v-model="infoForm.category_id" filterable style="width: 100%">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="`${item.name} (${item.category_key})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="期号" required>
          <el-input v-model="infoForm.issue" maxlength="32" />
        </el-form-item>

        <el-form-item label="年份">
          <el-input-number v-model="infoForm.year" :min="2000" :max="2100" style="width: 100%" />
        </el-form-item>

        <el-form-item label="标题" required>
          <el-input v-model="infoForm.title" maxlength="120" />
        </el-form-item>

        <el-form-item label="封面图上传">
          <ImageUploadField v-model="infoForm.cover_image_url" />
        </el-form-item>

        <el-form-item label="详情图上传">
          <ImageUploadField v-model="infoForm.detail_image_url" />
        </el-form-item>

        <el-form-item label="暗码">
          <el-input v-model="infoForm.draw_code" maxlength="120" />
        </el-form-item>

        <el-form-item label="动物竞猜码（可多选）" required>
          <el-select
            v-model="infoForm.option_names"
            multiple
            filterable
            allow-create
            default-first-option
            style="width: 100%"
            placeholder="请选择或输入竞猜动物"
          >
            <el-option v-for="name in defaultAnimalOptions" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>

        <el-form-item label="点赞数（可选，不填默认隐藏）">
          <el-input-number v-model="infoForm.likes_count" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="评论数（可选，不填默认隐藏）">
          <el-input-number v-model="infoForm.comment_count" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="收藏数（可选，不填默认隐藏）">
          <el-input-number v-model="infoForm.favorite_count" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="阅读数（可选，不填默认隐藏）">
          <el-input-number v-model="infoForm.read_count" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="投票区开关">
          <el-switch v-model="infoForm.poll_enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>

        <el-form-item label="投票默认展开">
          <el-switch v-model="infoForm.poll_default_expand" active-text="展开" inactive-text="收起" />
        </el-form-item>

        <el-form-item label="推荐图纸ID（逗号分隔）">
          <el-input v-model="infoForm.recommend_info_ids" maxlength="255" placeholder="如：101,108,126" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="infoForm.status" active-text="启用" inactive-text="停用" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="infoForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="infoDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingInfo" @click="saveInfo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import ImageUploadField from '@/features/ui/components/ImageUploadField.vue';
import bizConfigAPI, {
  type LotteryCategoryItem,
  type LotteryInfoItem
} from '@/features/bizconfig/api/biz-config';

const categoryKeyword = ref('');
const infoKeyword = ref('');

const categories = ref<LotteryCategoryItem[]>([]);
const infos = ref<LotteryInfoItem[]>([]);
const optionNamesByInfoID = ref<Record<string, string[]>>({});

const categoryDialogVisible = ref(false);
const editingCategory = ref(false);
const savingCategory = ref(false);

const infoDialogVisible = ref(false);
const editingInfo = ref(false);
const savingInfo = ref(false);

const defaultAnimalOptions = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const categoryForm = reactive<{
  id: number;
  category_key: string;
  name: string;
  search_keywords: string;
  show_on_home: boolean;
  status: boolean;
  sort: number;
}>({
  id: 0,
  category_key: '',
  name: '',
  search_keywords: '',
  show_on_home: true,
  status: true,
  sort: 0
});

const infoForm = reactive({
  id: 0,
  category_id: 0,
  issue: '',
  year: new Date().getFullYear(),
  title: '',
  cover_image_url: '',
  detail_image_url: '',
  draw_code: '',
  likes_count: 0,
  comment_count: 0,
  favorite_count: 0,
  read_count: 0,
  poll_enabled: true,
  poll_default_expand: false,
  recommend_info_ids: '',
  option_names: [...defaultAnimalOptions],
  status: true,
  sort: 0
});

const categoryMap = computed(() => {
  const map = new Map<number, LotteryCategoryItem>();
  categories.value.forEach((item) => {
    map.set(item.id, item);
  });
  return map;
});

const filteredInfos = computed(() => {
  const q = infoKeyword.value.trim().toLowerCase();
  if (!q) return infos.value;
  return infos.value.filter((item) => `${item.issue} ${item.title}`.toLowerCase().includes(q));
});

function categoryLabel(row: LotteryInfoItem): string {
  const cat = categoryMap.value.get(row.category_id);
  if (cat) return `${cat.name} (${cat.category_key})`;
  return row.category_tag || '-';
}

function optionNamesText(infoID: number): string {
  const names = optionNamesByInfoID.value[String(infoID)] || [];
  if (names.length === 0) return '-';
  return names.join('、');
}

function resolveCategoryIDByTag(tag: string): number {
  const needle = String(tag || '').trim();
  if (!needle) return 0;
  const target = categories.value.find((item) => item.category_key === needle || item.name === needle);
  return target?.id || 0;
}

async function reloadAll() {
  const [categoryResp, infoResp] = await Promise.all([
    bizConfigAPI.getLotteryCategories(categoryKeyword.value),
    bizConfigAPI.getLotteryInfos()
  ]);
  categories.value = categoryResp.items || [];
  infos.value = infoResp.items || [];
  optionNamesByInfoID.value = infoResp.option_names_by_info_id || {};
}

async function reloadCategories() {
  const resp = await bizConfigAPI.getLotteryCategories(categoryKeyword.value);
  categories.value = resp.items || [];
}

function openCreateCategory() {
  editingCategory.value = false;
  Object.assign(categoryForm, {
    id: 0,
    category_key: '',
    name: '',
    search_keywords: '',
    show_on_home: true,
    status: true,
    sort: 0
  });
  categoryDialogVisible.value = true;
}

function openEditCategory(row: LotteryCategoryItem) {
  editingCategory.value = true;
  Object.assign(categoryForm, {
    id: row.id,
    category_key: row.category_key || '',
    name: row.name || '',
    search_keywords: row.search_keywords || '',
    show_on_home: Number(row.show_on_home) === 1,
    status: Number(row.status) === 1,
    sort: row.sort || 0
  });
  categoryDialogVisible.value = true;
}

async function saveCategory() {
  if (!categoryForm.category_key.trim() || !categoryForm.name.trim()) {
    ElMessage.warning('请填写分类键和分类名称');
    return;
  }

  savingCategory.value = true;
  try {
    const payload = {
      category_key: categoryForm.category_key.trim(),
      name: categoryForm.name.trim(),
      search_keywords: categoryForm.search_keywords.trim(),
      show_on_home: categoryForm.show_on_home ? 1 : 0,
      status: categoryForm.status ? 1 : 0,
      sort: categoryForm.sort
    };

    if (editingCategory.value) {
      await bizConfigAPI.updateLotteryCategory(categoryForm.id, payload);
      ElMessage.success('分类更新成功');
    } else {
      await bizConfigAPI.createLotteryCategory(payload);
      ElMessage.success('分类创建成功');
    }

    categoryDialogVisible.value = false;
    await reloadAll();
  } finally {
    savingCategory.value = false;
  }
}

async function removeCategory(row: LotteryCategoryItem) {
  await ElMessageBox.confirm(`确认删除分类【${row.name}】吗？`, '删除确认', { type: 'warning' });
  await bizConfigAPI.deleteLotteryCategory(row.id);
  ElMessage.success('分类删除成功');
  await reloadAll();
}

function openCreateInfo() {
  editingInfo.value = false;
  Object.assign(infoForm, {
    id: 0,
    category_id: categories.value[0]?.id || 0,
    issue: '',
    year: new Date().getFullYear(),
    title: '',
    cover_image_url: '',
    detail_image_url: '',
    draw_code: '',
    likes_count: 0,
    comment_count: 0,
    favorite_count: 0,
    read_count: 0,
    poll_enabled: true,
    poll_default_expand: false,
    recommend_info_ids: '',
    option_names: [...defaultAnimalOptions],
    status: true,
    sort: 0
  });
  infoDialogVisible.value = true;
}

function openEditInfo(row: LotteryInfoItem) {
  editingInfo.value = true;
  Object.assign(infoForm, {
    id: row.id,
    category_id: row.category_id || resolveCategoryIDByTag(row.category_tag),
    issue: row.issue || '',
    year: row.year || new Date().getFullYear(),
    title: row.title || '',
    cover_image_url: row.cover_image_url || '',
    detail_image_url: row.detail_image_url || '',
    draw_code: row.draw_code || '',
    likes_count: row.likes_count || 0,
    comment_count: row.comment_count || 0,
    favorite_count: row.favorite_count || 0,
    read_count: row.read_count || 0,
    poll_enabled: Number(row.poll_enabled) !== 0,
    poll_default_expand: Number(row.poll_default_expand) === 1,
    recommend_info_ids: row.recommend_info_ids || '',
    option_names: [...(optionNamesByInfoID.value[String(row.id)] || defaultAnimalOptions)],
    status: Number(row.status) === 1,
    sort: row.sort || 0
  });
  infoDialogVisible.value = true;
}

async function saveInfo() {
  if (infoForm.category_id <= 0 || !infoForm.issue.trim() || !infoForm.title.trim()) {
    ElMessage.warning('分类、期号、标题不能为空');
    return;
  }
  const optionNames = infoForm.option_names.map((name) => name.trim()).filter((name) => name !== '');
  if (optionNames.length === 0) {
    ElMessage.warning('请至少选择一个动物竞猜码');
    return;
  }

  savingInfo.value = true;
  try {
    const category = categoryMap.value.get(infoForm.category_id);
    const payload = {
      special_lottery_id: 0,
      category_id: infoForm.category_id,
      category_tag: category?.category_key || '',
      issue: infoForm.issue.trim(),
      year: infoForm.year,
      title: infoForm.title.trim(),
      cover_image_url: infoForm.cover_image_url,
      detail_image_url: infoForm.detail_image_url,
      draw_code: infoForm.draw_code.trim(),
      likes_count: infoForm.likes_count,
      comment_count: infoForm.comment_count,
      favorite_count: infoForm.favorite_count,
      read_count: infoForm.read_count,
      poll_enabled: infoForm.poll_enabled ? 1 : 0,
      poll_default_expand: infoForm.poll_default_expand ? 1 : 0,
      recommend_info_ids: infoForm.recommend_info_ids.trim(),
      option_names: optionNames,
      status: infoForm.status ? 1 : 0,
      sort: infoForm.sort
    };

    if (editingInfo.value) {
      await bizConfigAPI.updateLotteryInfo(infoForm.id, payload);
      ElMessage.success('图库内容更新成功');
    } else {
      await bizConfigAPI.createLotteryInfo(payload);
      ElMessage.success('图库内容创建成功');
    }

    infoDialogVisible.value = false;
    await reloadAll();
  } finally {
    savingInfo.value = false;
  }
}

async function removeInfo(row: LotteryInfoItem) {
  await ElMessageBox.confirm(`确认删除图库内容【${row.issue}】吗？`, '删除确认', { type: 'warning' });
  await bizConfigAPI.deleteLotteryInfo(row.id);
  ElMessage.success('删除成功');
  await reloadAll();
}

onMounted(() => {
  void reloadAll();
});
</script>

<style scoped>
.page-grid {
  display: grid;
  gap: 16px;
}

.inner-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 1200px) {
  .toolbar-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .inner-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
