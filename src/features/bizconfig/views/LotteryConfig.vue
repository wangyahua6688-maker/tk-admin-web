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
              <el-tag v-for="n in selectedNormalNumbers" :key="`normal-picked-${n}`" type="danger" effect="dark" round>
                {{ pad2(n) }}
              </el-tag>
              <span class="picked-tip">已选 {{ selectedNormalNumbers.length }}/6，顺序即正1到正6</span>
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

        <el-form-item label="号码标签（自动关联）">
          <div class="auto-label-editor">
            <div v-if="selectedNumberMetaRows.length === 0" class="picked-tip">请先选择普通号码与特别号码，系统会自动关联波色 / 属相 / 五行。</div>
            <div
              v-for="row in selectedNumberMetaRows"
              :key="`auto-label-${row.type}-${row.number}`"
              class="auto-label-card"
              :class="{ special: row.type === 'special' }"
            >
              <div class="label-row-head">
                <el-tag :type="row.type === 'special' ? 'success' : 'danger'" effect="dark" round>
                  {{ row.positionLabel }}
                </el-tag>
                <span class="ball-chip" :class="waveClass(row.colorWave)">{{ pad2(row.number) }}</span>
              </div>
              <div class="label-row-meta">
                <span>{{ row.colorWave }}</span>
                <span>{{ row.zodiac }}</span>
                <span>{{ row.wuxing }}</span>
                <span>{{ row.beast }}</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="开奖结果预览">
          <el-alert :title="drawPreviewText" type="success" :closable="false" show-icon />
        </el-form-item>

        <el-form-item label="标签串预览">
          <el-alert :title="autoLabelPreviewText" type="info" :closable="false" show-icon />
        </el-form-item>

        <el-form-item label="开奖回放地址（直播结束后录入）">
          <el-input v-model="drawForm.playback_url" maxlength="255" placeholder="https://..." />
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

      <section class="auto-preview-panel">
        <div class="preview-panel-head">
          <h3>自动玩法结果预览</h3>
          <p>以下结果随选号实时更新，保存时将按同一套规则自动写入数据库，不再需要手工填写。</p>
        </div>

        <div v-if="!autoDrawPreview" class="picked-tip">请先选择完整的 6 个普通号码和 1 个特别号码，下面会展示自动计算出的两面、正码说明和入库标签。</div>

        <template v-else>
          <div class="preview-section">
            <h4>特码玩法</h4>
            <div class="preview-grid preview-grid--dense">
              <div class="preview-item"><span>特码号码</span><strong>{{ autoDrawPreview.special.code }}</strong></div>
              <div class="preview-item"><span>特码波色</span><strong>{{ autoDrawPreview.special.colorWave }}</strong></div>
              <div class="preview-item"><span>特码生肖</span><strong>{{ autoDrawPreview.special.zodiac }}</strong></div>
              <div class="preview-item"><span>特码五行</span><strong>{{ autoDrawPreview.special.wuxing }}</strong></div>
              <div class="preview-item"><span>特码大小</span><strong>{{ autoDrawPreview.special.bigSmall }}</strong></div>
              <div class="preview-item"><span>特码单双</span><strong>{{ autoDrawPreview.special.singleDouble }}</strong></div>
              <div class="preview-item"><span>合数单双</span><strong>{{ autoDrawPreview.special.sumSingleDouble }}</strong></div>
              <div class="preview-item"><span>尾数大小</span><strong>{{ autoDrawPreview.special.tailBigSmall }}</strong></div>
              <div class="preview-item"><span>家畜 / 野兽</span><strong>{{ autoDrawPreview.special.beast }}</strong></div>
              <div class="preview-item"><span>半波（波色+大小）</span><strong>{{ autoDrawPreview.special.halfWaveColorSize }}</strong></div>
              <div class="preview-item"><span>半波（波色+单双）</span><strong>{{ autoDrawPreview.special.halfWaveColorParity }}</strong></div>
            </div>
          </div>

          <div class="preview-section">
            <h4>总分与统计</h4>
            <div class="preview-grid preview-grid--dense">
              <div class="preview-item"><span>总和值</span><strong>{{ autoDrawPreview.total.totalSum }}</strong></div>
              <div class="preview-item"><span>总和大小</span><strong>{{ autoDrawPreview.total.bigSmall }}</strong></div>
              <div class="preview-item"><span>总和单双</span><strong>{{ autoDrawPreview.total.singleDouble }}</strong></div>
              <div class="preview-item"><span>正码串</span><strong>{{ autoDrawPreview.total.normalCode }}</strong></div>
              <div class="preview-item"><span>七码单 / 双</span><strong>{{ autoDrawPreview.total.oddCount }} / {{ autoDrawPreview.total.evenCount }}</strong></div>
              <div class="preview-item"><span>七码大 / 小</span><strong>{{ autoDrawPreview.total.bigCount }} / {{ autoDrawPreview.total.smallCount }}</strong></div>
              <div class="preview-item"><span>不同生肖数</span><strong>{{ autoDrawPreview.total.distinctZodiacCount }}</strong></div>
              <div class="preview-item"><span>不同尾数数</span><strong>{{ autoDrawPreview.total.distinctTailCount }}</strong></div>
              <div class="preview-item"><span>不同五行数</span><strong>{{ autoDrawPreview.total.distinctWuxingCount }}</strong></div>
              <div class="preview-item preview-item--wide"><span>已出生肖</span><strong>{{ autoDrawPreview.total.appearedZodiacs }}</strong></div>
              <div class="preview-item preview-item--wide"><span>已出尾数</span><strong>{{ autoDrawPreview.total.appearedTails }}</strong></div>
              <div class="preview-item preview-item--wide"><span>已出五行</span><strong>{{ autoDrawPreview.total.appearedWuxings }}</strong></div>
            </div>
          </div>

          <div class="preview-section">
            <h4>正码 1-6 自动说明</h4>
            <div class="position-list">
              <div v-for="item in autoDrawPreview.positions" :key="item.positionLabel" class="position-item">
                <span class="position-item__label">{{ item.positionLabel }}</span>
                <strong>{{ item.description }}</strong>
              </div>
            </div>
          </div>

          <div class="preview-section">
            <h4>入库标签预览</h4>
            <div class="storage-list">
              <div class="storage-item">
                <span>color_labels</span>
                <code>{{ autoDrawPreview.storage.colorLabels }}</code>
              </div>
              <div class="storage-item">
                <span>zodiac_labels</span>
                <code>{{ autoDrawPreview.storage.zodiacLabels }}</code>
              </div>
              <div class="storage-item">
                <span>wuxing_labels</span>
                <code>{{ autoDrawPreview.storage.wuxingLabels }}</code>
              </div>
              <div class="storage-item">
                <span>draw_labels</span>
                <code>{{ autoDrawPreview.storage.drawLabels }}</code>
              </div>
            </div>
          </div>
        </template>
      </section>

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

type NumberMetaRow = {
  type: 'normal' | 'special';
  positionLabel: string;
  number: number;
  colorWave: string;
  zodiac: string;
  wuxing: string;
  beast: string;
  bigSmall: string;
  singleDouble: string;
  sumSingleDouble: string;
  tailBigSmall: string;
  tailLabel: string;
  halfWaveColorSize: string;
  halfWaveColorParity: string;
};

type AutoDrawPreview = {
  special: {
    code: string;
    colorWave: string;
    zodiac: string;
    wuxing: string;
    beast: string;
    bigSmall: string;
    singleDouble: string;
    sumSingleDouble: string;
    tailBigSmall: string;
    halfWaveColorSize: string;
    halfWaveColorParity: string;
  };
  total: {
    totalSum: number;
    bigSmall: string;
    singleDouble: string;
    normalCode: string;
    oddCount: number;
    evenCount: number;
    bigCount: number;
    smallCount: number;
    distinctZodiacCount: number;
    distinctTailCount: number;
    distinctWuxingCount: number;
    appearedZodiacs: string;
    appearedTails: string;
    appearedWuxings: string;
  };
  positions: Array<{
    positionLabel: string;
    description: string;
  }>;
  storage: {
    colorLabels: string;
    zodiacLabels: string;
    wuxingLabels: string;
    drawLabels: string;
  };
};

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

const waveNumberMap = buildNumberMap({
  红波: [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
  蓝波: [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
  绿波: [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
});
const zodiacNumberMap = buildNumberMap({
  鼠: [7, 19, 31, 43],
  牛: [6, 18, 30, 42],
  虎: [5, 17, 29, 41],
  兔: [4, 16, 28, 40],
  龙: [3, 15, 27, 39],
  蛇: [2, 14, 26, 38],
  马: [1, 13, 25, 37, 49],
  羊: [12, 24, 36, 48],
  猴: [11, 23, 35, 47],
  鸡: [10, 22, 34, 46],
  狗: [9, 21, 33, 45],
  猪: [8, 20, 32, 44]
});
const wuxingNumberMap = buildNumberMap({
  金: [3, 4, 11, 12, 25, 26, 33, 34, 41, 42],
  木: [7, 8, 15, 16, 23, 24, 37, 38, 45, 46],
  水: [13, 14, 21, 22, 29, 30, 43, 44],
  火: [1, 2, 9, 10, 17, 18, 31, 32, 39, 40, 47, 48],
  土: [5, 6, 19, 20, 27, 28, 35, 36, 49]
});
const beastByZodiac: Record<string, string> = {
  猪: '家畜',
  狗: '家畜',
  牛: '家畜',
  马: '家畜',
  羊: '家畜',
  鸡: '家畜',
  鼠: '野兽',
  虎: '野兽',
  兔: '野兽',
  龙: '野兽',
  蛇: '野兽',
  猴: '野兽'
};
const zodiacOrder = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const wuxingOrder = ['金', '木', '水', '火', '土'];
const tailOrder = ['0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾'];

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
  playback_url: '',
  recommend_six: '',
  recommend_four: '',
  recommend_one: '',
  recommend_ten: '',
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

const selectedNumberMetaRows = computed<NumberMetaRow[]>(() => {
  const rows = selectedNormalNumbers.value.map((num, index) => buildNumberMetaRow(num, `正${index + 1}`, 'normal'));
  if (selectedSpecialNumber.value !== null) {
    rows.push(buildNumberMetaRow(selectedSpecialNumber.value, '特码', 'special'));
  }
  return rows;
});

const autoLabelPreviewText = computed(() => {
  if (selectedNumberMetaRows.value.length === 0) {
    return '请先选择开奖号码，系统会自动生成颜色 / 属相 / 五行标签。';
  }
  return selectedNumberMetaRows.value.map((row) => `${row.positionLabel} ${row.colorWave}/${row.zodiac}/${row.wuxing}`).join('，');
});

const autoDrawPreview = computed<AutoDrawPreview | null>(() => {
  const rows = selectedNumberMetaRows.value;
  if (rows.length !== 7) {
    return null;
  }

  const numbers = rows.map((row) => row.number);
  const totalSum = numbers.reduce((sum, num) => sum + num, 0);
  const oddCount = numbers.filter((num) => countAsOdd(num)).length;
  const evenCount = numbers.length - oddCount;
  const bigCount = numbers.filter((num) => countAsBig(num)).length;
  const smallCount = numbers.length - bigCount;
  const zodiacSet = new Set(rows.map((row) => row.zodiac).filter(Boolean));
  const tailSet = new Set(rows.map((row) => row.tailLabel));
  const wuxingSet = new Set(rows.map((row) => row.wuxing).filter(Boolean));

  const storage = buildStoragePreview(rows);
  const special = rows[6];

  return {
    special: {
      code: String(special.number),
      colorWave: special.colorWave,
      zodiac: special.zodiac,
      wuxing: special.wuxing,
      beast: special.beast,
      bigSmall: special.bigSmall,
      singleDouble: special.singleDouble,
      sumSingleDouble: special.sumSingleDouble,
      tailBigSmall: special.tailBigSmall,
      halfWaveColorSize: special.halfWaveColorSize,
      halfWaveColorParity: special.halfWaveColorParity
    },
    total: {
      totalSum,
      bigSmall: totalBigSmall(totalSum),
      singleDouble: totalSingleDouble(totalSum),
      normalCode: numbers.slice(0, 6).join(','),
      oddCount,
      evenCount,
      bigCount,
      smallCount,
      distinctZodiacCount: zodiacSet.size,
      distinctTailCount: tailSet.size,
      distinctWuxingCount: wuxingSet.size,
      appearedZodiacs: zodiacOrder.filter((label) => zodiacSet.has(label)).join('、') || '-',
      appearedTails: tailOrder.filter((label) => tailSet.has(label)).join('、') || '-',
      appearedWuxings: wuxingOrder.filter((label) => wuxingSet.has(label)).join('、') || '-'
    },
    positions: rows.slice(0, 6).map((row) => ({
      positionLabel: row.positionLabel,
      description: [row.bigSmall, row.singleDouble, row.colorWave, row.sumSingleDouble, row.tailBigSmall, row.zodiac, row.wuxing]
        .filter(Boolean)
        .join(' / ')
    })),
    storage
  };
});

function buildNumberMap(source: Record<string, number[]>): Record<number, string> {
  const out: Record<number, string> = {};
  Object.entries(source).forEach(([label, numbers]) => {
    numbers.forEach((num) => {
      out[num] = label;
    });
  });
  return out;
}

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

function resolveColorWave(num: number): string {
  return waveNumberMap[num] || '--';
}

function resolveZodiac(num: number): string {
  return zodiacNumberMap[num] || '--';
}

function resolveWuxing(num: number): string {
  return wuxingNumberMap[num] || '--';
}

function resolveBeast(zodiac: string): string {
  return beastByZodiac[zodiac] || '--';
}

function specialBigSmall(num: number): string {
  if (num === 49) return '和';
  return num >= 25 ? '大' : '小';
}

function specialSingleDouble(num: number): string {
  if (num === 49) return '和';
  return num % 2 === 0 ? '双' : '单';
}

function specialSumSingleDouble(num: number): string {
  if (num === 49) return '和';
  const sum = Math.floor(num / 10) + (num % 10);
  return sum % 2 === 0 ? '合双' : '合单';
}

function specialTailBigSmall(num: number): string {
  if (num === 49) return '和';
  return num % 10 <= 4 ? '尾小' : '尾大';
}

function totalBigSmall(total: number): string {
  return total >= 175 ? '大' : '小';
}

function totalSingleDouble(total: number): string {
  return total % 2 === 0 ? '双' : '单';
}

function countAsOdd(num: number): boolean {
  return num === 49 || num % 2 === 1;
}

function countAsBig(num: number): boolean {
  return num === 49 || num >= 25;
}

function buildHalfWaveColorSize(num: number, colorWave: string, bigSmall: string): string {
  if (num === 49) return '和局';
  return `${colorWave.replace(/波$/, '')}${bigSmall}`;
}

function buildHalfWaveColorParity(num: number, colorWave: string, singleDouble: string): string {
  if (num === 49) return '和局';
  return `${colorWave.replace(/波$/, '')}${singleDouble}`;
}

function buildNumberMetaRow(number: number, positionLabel: string, type: 'normal' | 'special'): NumberMetaRow {
  const colorWave = resolveColorWave(number);
  const zodiac = resolveZodiac(number);
  const wuxing = resolveWuxing(number);
  const bigSmall = specialBigSmall(number);
  const singleDouble = specialSingleDouble(number);
  return {
    type,
    positionLabel,
    number,
    colorWave,
    zodiac,
    wuxing,
    beast: resolveBeast(zodiac),
    bigSmall,
    singleDouble,
    sumSingleDouble: specialSumSingleDouble(number),
    tailBigSmall: specialTailBigSmall(number),
    tailLabel: `${number % 10}尾`,
    halfWaveColorSize: buildHalfWaveColorSize(number, colorWave, bigSmall),
    halfWaveColorParity: buildHalfWaveColorParity(number, colorWave, singleDouble)
  };
}

function buildStoragePreview(rows: NumberMetaRow[]) {
  return {
    colorLabels: rows.map((row) => row.colorWave).join(','),
    zodiacLabels: rows.map((row) => row.zodiac).join(','),
    wuxingLabels: rows.map((row) => row.wuxing).join(','),
    drawLabels: rows.map((row) => `${row.zodiac}/${row.wuxing}`).join(',')
  };
}

function waveClass(colorWave: string): string {
  if (colorWave === '红波') return 'wave-red';
  if (colorWave === '蓝波') return 'wave-blue';
  return 'wave-green';
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
}

function selectSpecialNumber(num: number) {
  if (selectedNormalNumbers.value.includes(num)) {
    ElMessage.warning('特别号码不能与普通号码重复');
    return;
  }
  selectedSpecialNumber.value = num;
  syncDrawFieldsFromSelection();
}

function resetDrawNumbers() {
  selectedNormalNumbers.value = [];
  selectedSpecialNumber.value = null;
  drawForm.normal_draw_result = '';
  drawForm.special_draw_result = '';
  drawForm.draw_result = '';
}

function loadDrawNumbers(record: DrawRecordItem) {
  const normal = parseCSVNumbers(record.normal_draw_result).slice(0, 6);
  const special = parseCSVNumbers(record.special_draw_result);
  if (normal.length === 6 && special.length === 1) {
    selectedNormalNumbers.value = [...normal];
    selectedSpecialNumber.value = special[0];
    syncDrawFieldsFromSelection();
    return;
  }
  const merged = parseCSVNumbers(record.draw_result);
  selectedNormalNumbers.value = merged.slice(0, 6);
  selectedSpecialNumber.value = merged.length >= 7 ? merged[6] : null;
  syncDrawFieldsFromSelection();
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
    playback_url: '',
    recommend_six: '',
    recommend_four: '',
    recommend_one: '',
    recommend_ten: '',
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
    playback_url: row.playback_url || '',
    recommend_six: row.recommend_six || '',
    recommend_four: row.recommend_four || '',
    recommend_one: row.recommend_one || '',
    recommend_ten: row.recommend_ten || '',
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
  syncDrawFieldsFromSelection();
  const normalText = selectedNormalNumbers.value.map((n) => pad2(n)).join(' ');
  const specialText = pad2(selectedSpecialNumber.value);
  await ElMessageBox.confirm(
    `请确认本期中奖号码：
普通号码：${normalText}
特别号码：${specialText}
确认无误后将写入开奖记录。`,
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
      playback_url: drawForm.playback_url.trim(),
      recommend_six: drawForm.recommend_six.trim(),
      recommend_four: drawForm.recommend_four.trim(),
      recommend_one: drawForm.recommend_one.trim(),
      recommend_ten: drawForm.recommend_ten.trim(),
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

.auto-label-editor {
  display: grid;
  gap: 10px;
  width: 100%;
}

.auto-label-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e4e7ec;
  background: #f8fafc;
}

.auto-label-card.special {
  border-color: #a7f3d0;
  background: #ecfdf3;
}

.label-row-head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
}

.ball-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.wave-red {
  background: linear-gradient(180deg, #ff7a7a, #d92d20);
}

.wave-blue {
  background: linear-gradient(180deg, #7cc7ff, #175cd3);
}

.wave-green {
  background: linear-gradient(180deg, #6ce9a6, #039855);
}

.label-row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.label-row-meta span {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #e4e7ec;
  background: #fff;
  color: #344054;
  font-size: 12px;
}

.auto-preview-panel {
  margin-top: 18px;
  border: 1px solid #dbe4f0;
  border-radius: 18px;
  padding: 18px;
  background: linear-gradient(180deg, #fcfdff, #f6f9ff);
}

.preview-panel-head {
  display: grid;
  gap: 6px;
  margin-bottom: 8px;
}

.preview-panel-head h3 {
  margin: 0;
  font-size: 18px;
  color: #101828;
}

.preview-panel-head p {
  margin: 0;
  color: #667085;
  font-size: 13px;
}

.preview-section {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.preview-section h4 {
  margin: 0;
  font-size: 15px;
  color: #1d2939;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.preview-grid--dense {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.preview-item {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  background: #fff;
}

.preview-item span {
  font-size: 12px;
  color: #667085;
}

.preview-item strong {
  font-size: 15px;
  color: #101828;
  line-height: 1.4;
  word-break: break-word;
}

.preview-item--wide {
  grid-column: span 2;
}

.position-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.position-item {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e4e7ec;
  background: #fff;
}

.position-item__label {
  font-size: 12px;
  color: #667085;
}

.position-item strong {
  color: #101828;
  font-size: 14px;
  line-height: 1.5;
}

.storage-list {
  display: grid;
  gap: 12px;
}

.storage-item {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e4e7ec;
  background: #fff;
}

.storage-item span {
  font-size: 12px;
  color: #667085;
}

.storage-item code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: normal;
  word-break: break-all;
  color: #0f172a;
}

@media (max-width: 1200px) {
  .toolbar-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .preview-grid--dense {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .number-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .preview-grid,
  .preview-grid--dense,
  .position-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .auto-label-card {
    flex-direction: column;
    align-items: stretch;
  }

  .label-row-meta {
    justify-content: flex-start;
  }

  .preview-grid,
  .preview-grid--dense,
  .position-list {
    grid-template-columns: 1fr;
  }

  .preview-item--wide {
    grid-column: span 1;
  }
}
</style>
