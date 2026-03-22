<template>
  <div class="page-grid">
    <section class="card">
      <div class="inner-toolbar">
        <h2>开奖信息配置（彩种）</h2>
        <div class="toolbar-actions">
          <el-input v-model="specialKeyword" placeholder="按名称/编码搜索" clearable style="max-width: 260px" />
          <el-button type="primary" @click="openCreateSpecial">新增彩种</el-button>
        </div>
      </div>

      <el-table :data="filteredSpecials" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="code" label="编码" width="110" />
        <el-table-column prop="current_issue" label="当前期号" min-width="120" />
        <el-table-column prop="live_status" label="直播状态" width="110" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEditSpecial(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="removeSpecial(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="card">
      <div class="inner-toolbar">
        <h2>开奖区配置（首页开奖区 / 历史开奖 / 开奖详情）</h2>
        <div class="toolbar-actions">
          <el-select v-model="drawSpecialFilter" clearable placeholder="按彩种筛选" style="min-width: 180px">
            <el-option v-for="item in specials" :key="item.id" :label="`${item.name}(${item.code})`" :value="item.id" />
          </el-select>
          <el-input v-model="drawKeyword" placeholder="按期号搜索" clearable style="max-width: 220px" />
          <el-button @click="reloadDrawRecords">刷新</el-button>
          <el-button type="primary" @click="openCreateDraw">新增开奖记录</el-button>
        </div>
      </div>

      <el-table :data="filteredDrawRecords" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="彩种" min-width="130">
          <template #default="{ row }">
            {{ specialLabel(row.special_lottery_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="issue" label="期号" width="120" />
        <el-table-column label="开奖号码(6+1)" min-width="220">
          <template #default="{ row }">
            {{ formatDrawResult(row.normal_draw_result, row.special_draw_result, row.draw_result) }}
          </template>
        </el-table-column>
        <el-table-column prop="draw_at" label="本期开奖时间" min-width="170" />
        <el-table-column prop="playback_url" label="回放地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="当前期" width="90">
          <template #default="{ row }">
            <el-tag :type="Number(row.is_current) === 1 ? 'success' : 'info'">{{ Number(row.is_current) === 1 ? '是' : '否' }}</el-tag>
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
              <el-button text size="small" @click="openEditDraw(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="removeDraw(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="specialDialogVisible" :title="editingSpecial ? '编辑彩种' : '新增彩种'" width="620px" destroy-on-close>
      <el-form :model="specialForm" label-position="top">
        <el-form-item label="名称" required>
          <el-input v-model="specialForm.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="编码" required>
          <el-input v-model="specialForm.code" maxlength="32" />
        </el-form-item>
        <el-form-item label="当前期号">
          <el-input v-model="specialForm.current_issue" maxlength="32" />
        </el-form-item>
        <el-form-item label="下期开奖时间（倒计时基准）">
          <el-time-picker
            v-model="specialForm.next_draw_at"
            style="width: 100%"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="每天开奖时间（如 21:30:00）"
          />
        </el-form-item>
        <el-form-item label="直播状态">
          <el-select v-model="specialForm.live_status" style="width: 100%">
            <el-option label="pending" value="pending" />
            <el-option label="live" value="live" />
            <el-option label="ended" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item label="直播开关">
          <el-switch v-model="specialForm.live_enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="直播流地址">
          <el-input v-model="specialForm.live_stream_url" maxlength="255" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="specialForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="specialForm.status" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="specialDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingSpecial" @click="saveSpecial">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="drawDialogVisible" :title="editingDraw ? '编辑开奖记录' : '新增开奖记录'" width="1080px" destroy-on-close>
      <el-form :model="drawForm" label-position="top">
        <el-form-item label="彩种" required>
          <el-select v-model="drawForm.special_lottery_id" style="width: 100%">
            <el-option v-for="item in specials" :key="item.id" :label="`${item.name}(${item.code})`" :value="item.id" />
          </el-select>
          <div class="picked-tip">当前选择：{{ selectedDrawSpecialText }}</div>
        </el-form-item>

        <el-form-item label="期号" required>
          <el-input v-model="drawForm.issue" maxlength="32" placeholder="如：2026-063" />
        </el-form-item>

        <el-form-item label="年份">
          <el-input-number v-model="drawForm.year" :min="2000" :max="2100" style="width: 100%" />
        </el-form-item>

        <el-form-item label="本期开奖时间（历史结果）">
          <el-date-picker
            v-model="drawForm.draw_at"
            type="datetime"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            placeholder="选择时间"
          />
        </el-form-item>

        <el-form-item label="普通号码（6个）" required>
          <div class="number-picker">
            <div class="picked-row">
              <el-tag
                v-for="n in selectedNormalNumbers"
                :key="`normal-picked-${n}`"
                type="danger"
                effect="dark"
                round
              >
                {{ pad2(n) }}
              </el-tag>
              <span class="picked-tip">已选 {{ selectedNormalNumbers.length }}/6</span>
            </div>
            <div class="number-grid">
              <button
                v-for="n in numberPool"
                :key="`normal-${n}`"
                type="button"
                class="num-btn"
                :class="{ selected: isNormalSelected(n) }"
                @click="toggleNormalNumber(n)"
              >
                {{ pad2(n) }}
              </button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="特别号码（1个）" required>
          <div class="number-picker">
            <div class="picked-row">
              <el-tag v-if="selectedSpecialNumber !== null" type="success" effect="dark" round>
                {{ pad2(selectedSpecialNumber) }}
              </el-tag>
              <span class="picked-tip">仅可选择 1 个，且不可与普通号码重复</span>
            </div>
            <div class="number-grid">
              <button
                v-for="n in numberPool"
                :key="`special-${n}`"
                type="button"
                class="num-btn special"
                :class="{ selected: isSpecialSelected(n) }"
                @click="selectSpecialNumber(n)"
              >
                {{ pad2(n) }}
              </button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="号码标签配置（逐号设置属相/五行）" required>
          <div class="label-editor">
            <div v-if="selectedNumberLabelRows.length === 0" class="picked-tip">请先选择普通号码与特别号码，再配置对应属相与五行</div>
            <div v-for="row in selectedNumberLabelRows" :key="`label-row-${row.type}-${row.number}`" class="label-row">
              <el-tag :type="row.type === 'special' ? 'success' : 'danger'" effect="dark" round>
                {{ row.type === 'special' ? '特' : '正' }}{{ pad2(row.number) }}
              </el-tag>
              <el-select v-model="numberLabelMap[row.number].zodiac" placeholder="属相" class="label-select">
                <el-option v-for="item in zodiacOptions" :key="`zodiac-${row.number}-${item}`" :label="item" :value="item" />
              </el-select>
              <el-select v-model="numberLabelMap[row.number].wuxing" placeholder="五行" class="label-select">
                <el-option v-for="item in wuxingOptions" :key="`wuxing-${row.number}-${item}`" :label="item" :value="item" />
              </el-select>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="开奖标签预览">
          <el-alert :title="drawLabelsPreviewText" type="info" :closable="false" show-icon />
        </el-form-item>

        <el-form-item label="开奖结果预览">
          <el-alert :title="drawPreviewText" type="success" :closable="false" show-icon />
        </el-form-item>

        <el-form-item label="开奖回放地址（直播结束后录入）">
          <el-input v-model="drawForm.playback_url" maxlength="255" placeholder="https://..." />
        </el-form-item>

        <el-form-item label="特码单双">
          <el-input v-model="drawForm.special_single_double" maxlength="16" placeholder="留空自动计算" />
        </el-form-item>

        <el-form-item label="特码大小">
          <el-input v-model="drawForm.special_big_small" maxlength="16" placeholder="留空自动计算" />
        </el-form-item>

        <el-form-item label="总和单双">
          <el-input v-model="drawForm.sum_single_double" maxlength="16" placeholder="留空自动计算" />
        </el-form-item>

        <el-form-item label="总和大小">
          <el-input v-model="drawForm.sum_big_small" maxlength="16" placeholder="留空自动计算" />
        </el-form-item>

        <el-form-item label="六肖推荐">
          <el-input v-model="drawForm.recommend_six" maxlength="120" placeholder="如：马 龙 羊 虎 牛 猪" />
        </el-form-item>

        <el-form-item label="四肖推荐">
          <el-input v-model="drawForm.recommend_four" maxlength="120" placeholder="如：马 龙 羊 虎" />
        </el-form-item>

        <el-form-item label="一肖推荐">
          <el-input v-model="drawForm.recommend_one" maxlength="32" placeholder="如：马" />
        </el-form-item>

        <el-form-item label="十码推荐">
          <el-input v-model="drawForm.recommend_ten" maxlength="255" placeholder="如：13 49 39 36 05 42 32 34 26 33" />
        </el-form-item>

        <el-form-item label="特码（数字）">
          <el-input v-model="drawForm.special_code" maxlength="16" placeholder="留空自动填充特别号" />
        </el-form-item>

        <el-form-item label="正码（逗号分隔）">
          <el-input v-model="drawForm.normal_code" maxlength="120" placeholder="留空自动填充前6个普通号" />
        </el-form-item>

        <el-form-item label="正1特说明">
          <el-input v-model="drawForm.zheng1" maxlength="120" />
        </el-form-item>

        <el-form-item label="正2特说明">
          <el-input v-model="drawForm.zheng2" maxlength="120" />
        </el-form-item>

        <el-form-item label="正3特说明">
          <el-input v-model="drawForm.zheng3" maxlength="120" />
        </el-form-item>

        <el-form-item label="正4特说明">
          <el-input v-model="drawForm.zheng4" maxlength="120" />
        </el-form-item>

        <el-form-item label="正5特说明">
          <el-input v-model="drawForm.zheng5" maxlength="120" />
        </el-form-item>

        <el-form-item label="正6特说明">
          <el-input v-model="drawForm.zheng6" maxlength="120" />
        </el-form-item>

        <el-form-item label="当前期">
          <el-switch v-model="drawForm.is_current" active-text="启用" inactive-text="停用" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="drawForm.status" active-text="启用" inactive-text="停用" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="drawForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="drawDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingDraw" @click="saveDraw">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import bizConfigAPI, { type DrawRecordItem, type SpecialLotteryItem } from '@/features/bizconfig/api/biz-config';

const specialKeyword = ref('');
const drawKeyword = ref('');
const drawSpecialFilter = ref<number | undefined>(undefined);

const specials = ref<SpecialLotteryItem[]>([]);
const drawRecords = ref<DrawRecordItem[]>([]);

const specialDialogVisible = ref(false);
const editingSpecial = ref(false);
const savingSpecial = ref(false);

const drawDialogVisible = ref(false);
const editingDraw = ref(false);
const savingDraw = ref(false);

const numberPool = Array.from({ length: 49 }, (_, idx) => idx + 1);
const selectedNormalNumbers = ref<number[]>([]);
const selectedSpecialNumber = ref<number | null>(null);
const zodiacOptions = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const wuxingOptions = ['金', '木', '水', '火', '土'];
const numberLabelMap = reactive<Record<number, { zodiac: string; wuxing: string }>>({});

const specialForm = reactive({
  id: 0,
  name: '',
  code: '',
  current_issue: '',
  next_draw_at: '' as string | Date | null,
  live_enabled: false,
  live_status: 'pending',
  live_stream_url: '',
  status: true,
  sort: 0
});

const drawForm = reactive({
  id: 0,
  special_lottery_id: 0,
  issue: '',
  year: new Date().getFullYear(),
  draw_at: '',
  normal_draw_result: '',
  special_draw_result: '',
  draw_result: '',
  draw_labels: '',
  playback_url: '',
  special_single_double: '',
  special_big_small: '',
  sum_single_double: '',
  sum_big_small: '',
  recommend_six: '',
  recommend_four: '',
  recommend_one: '',
  recommend_ten: '',
  special_code: '',
  normal_code: '',
  zheng1: '',
  zheng2: '',
  zheng3: '',
  zheng4: '',
  zheng5: '',
  zheng6: '',
  is_current: false,
  status: true,
  sort: 0
});

const specialMap = computed(() => {
  const map = new Map<number, SpecialLotteryItem>();
  specials.value.forEach((item) => map.set(item.id, item));
  return map;
});

const filteredSpecials = computed(() => {
  const q = specialKeyword.value.trim().toLowerCase();
  if (!q) return specials.value;
  return specials.value.filter((item) => `${item.name} ${item.code}`.toLowerCase().includes(q));
});

const filteredDrawRecords = computed(() => {
  const q = drawKeyword.value.trim().toLowerCase();
  return drawRecords.value.filter((item) => {
    if (drawSpecialFilter.value && item.special_lottery_id !== drawSpecialFilter.value) {
      return false;
    }
    if (!q) return true;
    return `${item.issue}`.toLowerCase().includes(q);
  });
});

const drawPreviewText = computed(() => {
  const normal = selectedNormalNumbers.value.map((n) => pad2(n)).join(' ');
  const special = selectedSpecialNumber.value === null ? '--' : pad2(selectedSpecialNumber.value);
  return `普通号码：${normal || '--'}   +   特别号码：${special}`;
});

const selectedDrawSpecialText = computed(() => {
  if (!drawForm.special_lottery_id) {
    return '未选择彩种';
  }
  return specialLabel(drawForm.special_lottery_id);
});

const selectedNumberLabelRows = computed(() => {
  const rows: Array<{ number: number; type: 'normal' | 'special' }> = selectedNormalNumbers.value.map((num) => ({
    number: num,
    type: 'normal'
  }));
  if (selectedSpecialNumber.value !== null) {
    rows.push({ number: selectedSpecialNumber.value, type: 'special' });
  }
  return rows;
});

const drawLabelsPreviewText = computed(() => {
  const text = buildDrawLabelsText(false);
  return text || '请先为每个开奖号码选择属相和五行';
});

function specialLabel(id: number): string {
  const row = specialMap.value.get(id);
  if (!row) return `彩种#${id}`;
  return `${row.name}(${row.code})`;
}

function parseCSVNumbers(raw: string): number[] {
  return String(raw || '')
    .split(/[,\s|/]+/)
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((num) => Number.isInteger(num) && num >= 1 && num <= 49);
}

function normalizeDailyTimeText(raw: unknown): string {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return `${String(raw.getHours()).padStart(2, '0')}:${String(raw.getMinutes()).padStart(2, '0')}:${String(raw.getSeconds()).padStart(2, '0')}`;
  }
  if (raw && typeof raw === 'object') {
    const maybeObj = raw as { format?: (pattern?: string) => string; $d?: Date };
    if (typeof maybeObj.format === 'function') {
      const text = maybeObj.format('HH:mm:ss');
      const normalized = normalizeDailyTimeText(text);
      if (normalized) return normalized;
    }
    if (maybeObj.$d instanceof Date && !Number.isNaN(maybeObj.$d.getTime())) {
      return normalizeDailyTimeText(maybeObj.$d);
    }
  }

  const value = String(raw || '').trim();
  if (!value) return '';
  const matched = value.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (matched) {
    const h = Number.parseInt(matched[1], 10);
    const m = Number.parseInt(matched[2], 10);
    const s = Number.parseInt(matched[3] || '0', 10);
    if (Number.isFinite(h) && Number.isFinite(m) && Number.isFinite(s) && h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}:${String(parsed.getSeconds()).padStart(2, '0')}`;
}

function pad2(num: number): string {
  return String(num).padStart(2, '0');
}

function selectedNumbersInOrder(): number[] {
  const values = [...selectedNormalNumbers.value];
  if (selectedSpecialNumber.value !== null) {
    values.push(selectedSpecialNumber.value);
  }
  return values;
}

function syncNumberLabelMap() {
  const selectedSet = new Set<number>(selectedNumbersInOrder());
  Object.keys(numberLabelMap).forEach((key) => {
    const number = Number.parseInt(key, 10);
    if (!selectedSet.has(number)) {
      delete numberLabelMap[number];
    }
  });
  selectedSet.forEach((number) => {
    if (!numberLabelMap[number]) {
      numberLabelMap[number] = { zodiac: '', wuxing: '' };
    }
  });
}

function splitDrawLabels(raw: string): Array<{ zodiac: string; wuxing: string }> {
  return String(raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
    .map((item) => {
      const parts = item.split('/');
      return {
        zodiac: (parts[0] || '').trim(),
        wuxing: (parts[1] || '').trim()
      };
    });
}

function loadNumberLabelMapFromRecord(record: DrawRecordItem) {
  syncNumberLabelMap();
  const selected = selectedNumbersInOrder();
  const pairs = splitDrawLabels(record.draw_labels || '');
  selected.forEach((number, index) => {
    const pair = pairs[index];
    if (!pair) {
      return;
    }
    numberLabelMap[number] = {
      zodiac: pair.zodiac,
      wuxing: pair.wuxing
    };
  });
}

function buildDrawLabelsText(requireComplete: boolean): string {
  const labels: string[] = [];
  for (const number of selectedNumbersInOrder()) {
    const pair = numberLabelMap[number];
    const zodiac = (pair?.zodiac || '').trim();
    const wuxing = (pair?.wuxing || '').trim();
    if (!zodiac || !wuxing) {
      if (requireComplete) {
        return '';
      }
      labels.push(`${zodiac || '--'}/${wuxing || '--'}`);
      continue;
    }
    labels.push(`${zodiac}/${wuxing}`);
  }
  return labels.join(',');
}

function formatDrawResult(normalRaw: string, specialRaw: string, mergedRaw: string): string {
  const normal = parseCSVNumbers(normalRaw);
  const special = parseCSVNumbers(specialRaw);
  if (normal.length === 6 && special.length === 1) {
    return `${normal.map((n) => pad2(n)).join(' ')} + ${pad2(special[0])}`;
  }
  const merged = parseCSVNumbers(mergedRaw);
  if (merged.length >= 7) {
    return `${merged.slice(0, 6).map((n) => pad2(n)).join(' ')} + ${pad2(merged[6])}`;
  }
  return '-';
}

function syncDrawFieldsFromSelection() {
  drawForm.normal_draw_result = selectedNormalNumbers.value.join(',');
  drawForm.special_draw_result = selectedSpecialNumber.value === null ? '' : String(selectedSpecialNumber.value);
  drawForm.draw_result =
    selectedSpecialNumber.value === null
      ? drawForm.normal_draw_result
      : `${drawForm.normal_draw_result},${selectedSpecialNumber.value}`;
}

function isNormalSelected(num: number): boolean {
  return selectedNormalNumbers.value.includes(num);
}

function isSpecialSelected(num: number): boolean {
  return selectedSpecialNumber.value === num;
}

function toggleNormalNumber(num: number) {
  const idx = selectedNormalNumbers.value.indexOf(num);
  if (idx >= 0) {
    selectedNormalNumbers.value.splice(idx, 1);
    syncDrawFieldsFromSelection();
    syncNumberLabelMap();
    return;
  }
  if (selectedSpecialNumber.value === num) {
    ElMessage.warning('普通号码不能与特别号码重复');
    return;
  }
  if (selectedNormalNumbers.value.length >= 6) {
    ElMessage.warning('普通号码必须且只能选择 6 个');
    return;
  }
  selectedNormalNumbers.value.push(num);
  syncDrawFieldsFromSelection();
  syncNumberLabelMap();
}

function selectSpecialNumber(num: number) {
  if (selectedNormalNumbers.value.includes(num)) {
    ElMessage.warning('特别号码不能与普通号码重复');
    return;
  }
  selectedSpecialNumber.value = num;
  syncDrawFieldsFromSelection();
  syncNumberLabelMap();
}

function resetDrawNumbers() {
  selectedNormalNumbers.value = [];
  selectedSpecialNumber.value = null;
  drawForm.normal_draw_result = '';
  drawForm.special_draw_result = '';
  drawForm.draw_result = '';
  Object.keys(numberLabelMap).forEach((key) => {
    delete numberLabelMap[Number.parseInt(key, 10)];
  });
}

function loadDrawNumbers(record: DrawRecordItem) {
  const normal = parseCSVNumbers(record.normal_draw_result).slice(0, 6);
  const special = parseCSVNumbers(record.special_draw_result);
  if (normal.length === 6 && special.length === 1) {
    selectedNormalNumbers.value = [...normal];
    selectedSpecialNumber.value = special[0];
    syncDrawFieldsFromSelection();
    loadNumberLabelMapFromRecord(record);
    return;
  }
  const merged = parseCSVNumbers(record.draw_result);
  selectedNormalNumbers.value = merged.slice(0, 6);
  selectedSpecialNumber.value = merged.length >= 7 ? merged[6] : null;
  syncDrawFieldsFromSelection();
  loadNumberLabelMapFromRecord(record);
}

async function reload() {
  const [specialResp, drawResp] = await Promise.all([bizConfigAPI.getSpecialLotteries(), bizConfigAPI.getDrawRecords()]);
  specials.value = specialResp.items || [];
  drawRecords.value = drawResp.items || [];
}

async function reloadDrawRecords() {
  const resp = await bizConfigAPI.getDrawRecords({
    special_lottery_id: drawSpecialFilter.value,
    keyword: drawKeyword.value.trim() || undefined
  });
  drawRecords.value = resp.items || [];
}

function openCreateSpecial() {
  editingSpecial.value = false;
  Object.assign(specialForm, {
    id: 0,
    name: '',
    code: '',
    current_issue: '',
    next_draw_at: '',
    live_enabled: false,
    live_status: 'pending',
    live_stream_url: '',
    status: true,
    sort: 0
  });
  specialDialogVisible.value = true;
}

function openEditSpecial(row: SpecialLotteryItem) {
  editingSpecial.value = true;
  Object.assign(specialForm, {
    id: row.id,
    name: row.name || '',
    code: row.code || '',
    current_issue: row.current_issue || '',
    next_draw_at: normalizeDailyTimeText(row.next_draw_at || ''),
    live_enabled: Number(row.live_enabled) === 1,
    live_status: row.live_status || 'pending',
    live_stream_url: row.live_stream_url || '',
    status: Number(row.status) === 1,
    sort: row.sort || 0
  });
  specialDialogVisible.value = true;
}

async function saveSpecial() {
  if (!specialForm.name.trim() || !specialForm.code.trim()) {
    ElMessage.warning('名称和编码不能为空');
    return;
  }
  const normalizedNextDrawAt = normalizeDailyTimeText(specialForm.next_draw_at);
  if (!normalizedNextDrawAt) {
    ElMessage.warning('下期开奖时间格式错误，请重新选择（HH:mm:ss）');
    return;
  }
  savingSpecial.value = true;
  try {
    const payload = {
      name: specialForm.name.trim(),
      code: specialForm.code.trim(),
      current_issue: specialForm.current_issue.trim(),
      next_draw_at: normalizedNextDrawAt,
      live_enabled: specialForm.live_enabled ? 1 : 0,
      live_status: specialForm.live_status,
      live_stream_url: specialForm.live_stream_url.trim(),
      status: specialForm.status ? 1 : 0,
      sort: specialForm.sort
    };
    if (!editingSpecial.value) {
      await bizConfigAPI.createSpecialLottery(payload);
      ElMessage.success('彩种创建成功');
    } else {
      await bizConfigAPI.updateSpecialLottery(specialForm.id, payload);
      ElMessage.success('彩种更新成功');
    }
    specialDialogVisible.value = false;
    await reload();
  } finally {
    savingSpecial.value = false;
  }
}

async function removeSpecial(row: SpecialLotteryItem) {
  await ElMessageBox.confirm(`确认删除彩种【${row.name}】吗？`, '删除确认', { type: 'warning' });
  await bizConfigAPI.deleteSpecialLottery(row.id);
  ElMessage.success('删除成功');
  await reload();
}

function openCreateDraw() {
  editingDraw.value = false;
  Object.assign(drawForm, {
    id: 0,
    special_lottery_id: specials.value[0]?.id || 0,
    issue: '',
    year: new Date().getFullYear(),
    draw_at: '',
    normal_draw_result: '',
    special_draw_result: '',
    draw_result: '',
    draw_labels: '',
    playback_url: '',
    special_single_double: '',
    special_big_small: '',
    sum_single_double: '',
    sum_big_small: '',
    recommend_six: '',
    recommend_four: '',
    recommend_one: '',
    recommend_ten: '',
    special_code: '',
    normal_code: '',
    zheng1: '',
    zheng2: '',
    zheng3: '',
    zheng4: '',
    zheng5: '',
    zheng6: '',
    is_current: false,
    status: true,
    sort: 0
  });
  resetDrawNumbers();
  drawDialogVisible.value = true;
}

function openEditDraw(row: DrawRecordItem) {
  editingDraw.value = true;
  Object.assign(drawForm, {
    id: row.id,
    special_lottery_id: row.special_lottery_id,
    issue: row.issue || '',
    year: row.year || new Date().getFullYear(),
    draw_at: row.draw_at || '',
    normal_draw_result: row.normal_draw_result || '',
    special_draw_result: row.special_draw_result || '',
    draw_result: row.draw_result || '',
    draw_labels: row.draw_labels || '',
    playback_url: row.playback_url || '',
    special_single_double: row.special_single_double || '',
    special_big_small: row.special_big_small || '',
    sum_single_double: row.sum_single_double || '',
    sum_big_small: row.sum_big_small || '',
    recommend_six: row.recommend_six || '',
    recommend_four: row.recommend_four || '',
    recommend_one: row.recommend_one || '',
    recommend_ten: row.recommend_ten || '',
    special_code: row.special_code || '',
    normal_code: row.normal_code || '',
    zheng1: row.zheng1 || '',
    zheng2: row.zheng2 || '',
    zheng3: row.zheng3 || '',
    zheng4: row.zheng4 || '',
    zheng5: row.zheng5 || '',
    zheng6: row.zheng6 || '',
    is_current: Number(row.is_current) === 1,
    status: Number(row.status) === 1,
    sort: row.sort || 0
  });
  loadDrawNumbers(row);
  drawDialogVisible.value = true;
}

async function saveDraw() {
  if (drawForm.special_lottery_id <= 0 || !drawForm.issue.trim()) {
    ElMessage.warning('彩种和期号不能为空');
    return;
  }
  if (selectedNormalNumbers.value.length !== 6 || selectedSpecialNumber.value === null) {
    ElMessage.warning('请完整选择 6 个普通号码和 1 个特别号码');
    return;
  }
  const drawLabels = buildDrawLabelsText(true);
  if (!drawLabels) {
    ElMessage.warning('请为每个开奖号码选择对应的属相和五行');
    return;
  }
  syncDrawFieldsFromSelection();
  drawForm.draw_labels = drawLabels;
  const normalText = selectedNormalNumbers.value.map((n) => pad2(n)).join(' ');
  const specialText = pad2(selectedSpecialNumber.value);
  await ElMessageBox.confirm(
    `请确认本期中奖号码：\n普通号码：${normalText}\n特别号码：${specialText}\n确认无误后将写入开奖记录。`,
    '开奖数据确认',
    {
      type: 'warning',
      confirmButtonText: '确认提交',
      cancelButtonText: '返回检查'
    }
  );
  savingDraw.value = true;
  try {
    const payload = {
      special_lottery_id: drawForm.special_lottery_id,
      issue: drawForm.issue.trim(),
      year: drawForm.year,
      draw_at: drawForm.draw_at,
      normal_draw_result: drawForm.normal_draw_result,
      special_draw_result: drawForm.special_draw_result,
      draw_result: drawForm.draw_result,
      draw_labels: drawForm.draw_labels.trim(),
      playback_url: drawForm.playback_url.trim(),
      special_single_double: drawForm.special_single_double.trim(),
      special_big_small: drawForm.special_big_small.trim(),
      sum_single_double: drawForm.sum_single_double.trim(),
      sum_big_small: drawForm.sum_big_small.trim(),
      recommend_six: drawForm.recommend_six.trim(),
      recommend_four: drawForm.recommend_four.trim(),
      recommend_one: drawForm.recommend_one.trim(),
      recommend_ten: drawForm.recommend_ten.trim(),
      special_code: drawForm.special_code.trim(),
      normal_code: drawForm.normal_code.trim(),
      zheng1: drawForm.zheng1.trim(),
      zheng2: drawForm.zheng2.trim(),
      zheng3: drawForm.zheng3.trim(),
      zheng4: drawForm.zheng4.trim(),
      zheng5: drawForm.zheng5.trim(),
      zheng6: drawForm.zheng6.trim(),
      is_current: drawForm.is_current ? 1 : 0,
      status: drawForm.status ? 1 : 0,
      sort: drawForm.sort
    };
    if (!editingDraw.value) {
      await bizConfigAPI.createDrawRecord(payload);
      ElMessage.success('开奖记录创建成功');
    } else {
      await bizConfigAPI.updateDrawRecord(drawForm.id, payload);
      ElMessage.success('开奖记录更新成功');
    }
    drawDialogVisible.value = false;
    await reloadDrawRecords();
  } finally {
    savingDraw.value = false;
  }
}

async function removeDraw(row: DrawRecordItem) {
  await ElMessageBox.confirm(`确认删除开奖记录【${row.issue}】吗？`, '删除确认', { type: 'warning' });
  await bizConfigAPI.deleteDrawRecord(row.id);
  ElMessage.success('删除成功');
  await reloadDrawRecords();
}

onMounted(() => {
  void reload();
});
</script>

<style scoped lang="scss">
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

.inner-toolbar h2 {
  margin: 0;
  font-size: 18px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.number-picker {
  display: grid;
  gap: 10px;
  width: 100%;
  max-width: 760px;
}

.picked-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.picked-tip {
  color: #667085;
  font-size: 12px;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.num-btn {
  border: 1px solid #d0d5dd;
  background: #fff;
  border-radius: 8px;
  min-height: 36px;
  cursor: pointer;
  color: #344054;
  font-weight: 600;
  min-width: 0;
  width: 100%;
}

.label-editor {
  display: grid;
  gap: 10px;
  width: 100%;
  max-width: 760px;
}

.label-row {
  display: grid;
  grid-template-columns: 72px 1fr 1fr;
  gap: 8px;
  align-items: center;
}

.label-select {
  width: 100%;
}

.num-btn.selected {
  border-color: #e11d48;
  background: #fff1f2;
  color: #be123c;
}

.num-btn.special.selected {
  border-color: #059669;
  background: #ecfdf3;
  color: #047857;
}

@media (max-width: 1200px) {
  .toolbar-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 980px) {
  .number-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
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

  .number-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .label-row {
    grid-template-columns: 1fr;
  }
}
</style>
