import { defineStore } from 'pinia';

export type AppearanceScheme =
  | 'sky'
  | 'graphite'
  | 'forest'
  | 'amber'
  | 'ocean'
  | 'rose'
  | 'starlight'
  | 'titanium'
  | 'midnight'
  | 'aurora'
  | 'coral'
  | 'glacier'
  | 'emerald'
  | 'nebula';

export type AppearanceFontWeight = 400 | 500 | 600 | 700;

interface SchemeOption {
  key: AppearanceScheme;
  label: string;
  desc: string;
}

interface AppearanceState {
  scheme: AppearanceScheme;
  fontFamily: string;
  fontSize: number;
  fontWeight: AppearanceFontWeight;
  availableFonts: string[];
  bootstrapped: boolean;
}

interface PersistedAppearance {
  scheme?: AppearanceScheme;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: AppearanceFontWeight;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const STORAGE_KEY = 'ui_appearance_settings';
const DEFAULT_SCHEME: AppearanceScheme = 'sky';
const DEFAULT_FONT = 'PingFang SC';
export const MIN_FONT_SIZE = 13;
export const MAX_FONT_SIZE = 17;
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_FONT_WEIGHT: AppearanceFontWeight = 400;

const ALL_SCHEME_KEYS: AppearanceScheme[] = [
  'sky',
  'graphite',
  'forest',
  'amber',
  'ocean',
  'rose',
  'starlight',
  'titanium',
  'midnight',
  'aurora',
  'coral',
  'glacier',
  'emerald',
  'nebula'
];

const FONT_CANDIDATES: Array<{ label: string; value: string }> = [
  { label: 'PingFang SC', value: 'PingFang SC' },
  { label: 'Hiragino Sans GB', value: 'Hiragino Sans GB' },
  { label: 'Microsoft YaHei', value: 'Microsoft YaHei' },
  { label: 'Noto Sans SC', value: 'Noto Sans SC' },
  { label: 'Source Han Sans SC', value: 'Source Han Sans SC' },
  { label: 'SF Pro Text', value: 'SF Pro Text' },
  { label: 'Helvetica Neue', value: 'Helvetica Neue' },
  { label: 'Arial', value: 'Arial' }
];

export const APPEARANCE_SCHEME_OPTIONS: SchemeOption[] = [
  { key: 'sky', label: '晴空蓝', desc: '经典系统蓝，清爽耐看' },
  { key: 'graphite', label: '石墨灰', desc: '商务中性风，稳重专业' },
  { key: 'forest', label: '森林绿', desc: '护眼柔和，适合长时办公' },
  { key: 'amber', label: '琥珀金', desc: '暖色强调，突出关键操作' },
  { key: 'ocean', label: '深海蓝', desc: '深邃蓝调，信息层级清晰' },
  { key: 'rose', label: '珊瑚粉', desc: '轻盈活力，运营场景友好' },
  { key: 'starlight', label: '星光银', desc: '参考手机星光配色，明亮简洁' },
  { key: 'titanium', label: '钛金灰', desc: '参考钛金属机身，克制硬朗' },
  { key: 'midnight', label: '极夜黑', desc: '参考旗舰深色机身，低调沉稳' },
  { key: 'aurora', label: '极光青', desc: '参考渐变机身色，清新醒目' },
  { key: 'coral', label: '日出橙', desc: '参考活力机身色，强调互动反馈' },
  { key: 'glacier', label: '冰川蓝', desc: '参考冰感机身色，冷静通透' },
  { key: 'emerald', label: '翡翠绿', desc: '参考翡翠机身色，辨识度高' },
  { key: 'nebula', label: '星云紫', desc: '参考星云机身色，层次感更强' }
];

export const APPEARANCE_FONT_WEIGHT_OPTIONS: Array<{ label: string; value: AppearanceFontWeight }> = [
  { label: '标准', value: 400 },
  { label: '稍粗', value: 500 },
  { label: '中粗', value: 600 },
  { label: '加粗', value: 700 }
];

const SCHEME_TOKENS: Record<AppearanceScheme, Record<string, string>> = {
  sky: {
    '--brand-primary': '#2563eb',
    '--brand-primary-rgb': '37, 99, 235',
    '--brand-primary-soft': 'rgba(37, 99, 235, 0.12)',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--surface-page': '#f5f7fb',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(148, 163, 184, 0.24)',
    '--border-strong': 'rgba(148, 163, 184, 0.42)',
    '--shell-bg-1': '#dfe9ff',
    '--shell-bg-2': '#eef3ff',
    '--shell-bg-3': '#f6f8fb',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(248, 250, 255, 0.9)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.95)'
  },
  graphite: {
    '--brand-primary': '#334155',
    '--brand-primary-rgb': '51, 65, 85',
    '--brand-primary-soft': 'rgba(51, 65, 85, 0.13)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--surface-page': '#f1f5f9',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(100, 116, 139, 0.24)',
    '--border-strong': 'rgba(100, 116, 139, 0.42)',
    '--shell-bg-1': '#e2e8f0',
    '--shell-bg-2': '#edf2f7',
    '--shell-bg-3': '#f4f7fb',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(244, 247, 251, 0.92)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.96)'
  },
  forest: {
    '--brand-primary': '#0f766e',
    '--brand-primary-rgb': '15, 118, 110',
    '--brand-primary-soft': 'rgba(15, 118, 110, 0.13)',
    '--text-primary': '#0b1324',
    '--text-secondary': '#334155',
    '--surface-page': '#f2f8f6',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(94, 139, 126, 0.24)',
    '--border-strong': 'rgba(94, 139, 126, 0.42)',
    '--shell-bg-1': '#d7efe9',
    '--shell-bg-2': '#e8f6f1',
    '--shell-bg-3': '#f3faf7',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(241, 250, 247, 0.92)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.96)'
  },
  amber: {
    '--brand-primary': '#b45309',
    '--brand-primary-rgb': '180, 83, 9',
    '--brand-primary-soft': 'rgba(180, 83, 9, 0.14)',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--surface-page': '#fbf7ef',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(180, 83, 9, 0.2)',
    '--border-strong': 'rgba(180, 83, 9, 0.38)',
    '--shell-bg-1': '#fde9c9',
    '--shell-bg-2': '#fef3dc',
    '--shell-bg-3': '#fcf8f1',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(254, 248, 236, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  ocean: {
    '--brand-primary': '#0369a1',
    '--brand-primary-rgb': '3, 105, 161',
    '--brand-primary-soft': 'rgba(3, 105, 161, 0.14)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--surface-page': '#eef7fb',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(3, 105, 161, 0.2)',
    '--border-strong': 'rgba(3, 105, 161, 0.38)',
    '--shell-bg-1': '#d8edf9',
    '--shell-bg-2': '#e9f5fc',
    '--shell-bg-3': '#f3f9fd',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(238, 248, 254, 0.93)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  rose: {
    '--brand-primary': '#c2416c',
    '--brand-primary-rgb': '194, 65, 108',
    '--brand-primary-soft': 'rgba(194, 65, 108, 0.14)',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--surface-page': '#fff5f7',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(194, 65, 108, 0.2)',
    '--border-strong': 'rgba(194, 65, 108, 0.38)',
    '--shell-bg-1': '#ffdbe6',
    '--shell-bg-2': '#ffe9ef',
    '--shell-bg-3': '#fff3f6',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(255, 241, 246, 0.93)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  starlight: {
    '--brand-primary': '#4f46e5',
    '--brand-primary-rgb': '79, 70, 229',
    '--brand-primary-soft': 'rgba(79, 70, 229, 0.14)',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--surface-page': '#f6f7ff',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(148, 163, 184, 0.24)',
    '--border-strong': 'rgba(148, 163, 184, 0.42)',
    '--shell-bg-1': '#e8e9ff',
    '--shell-bg-2': '#f1f2ff',
    '--shell-bg-3': '#f7f8ff',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(246, 247, 255, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  titanium: {
    '--brand-primary': '#5b6475',
    '--brand-primary-rgb': '91, 100, 117',
    '--brand-primary-soft': 'rgba(91, 100, 117, 0.14)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--surface-page': '#f3f5f8',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(91, 100, 117, 0.2)',
    '--border-strong': 'rgba(91, 100, 117, 0.38)',
    '--shell-bg-1': '#e2e6ec',
    '--shell-bg-2': '#edf0f4',
    '--shell-bg-3': '#f5f7fa',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(241, 244, 248, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  midnight: {
    '--brand-primary': '#1e293b',
    '--brand-primary-rgb': '30, 41, 59',
    '--brand-primary-soft': 'rgba(30, 41, 59, 0.14)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--surface-page': '#f1f4f8',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(30, 41, 59, 0.2)',
    '--border-strong': 'rgba(30, 41, 59, 0.38)',
    '--shell-bg-1': '#dde5ef',
    '--shell-bg-2': '#eaf0f6',
    '--shell-bg-3': '#f3f7fb',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(236, 242, 249, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  aurora: {
    '--brand-primary': '#0ea5a4',
    '--brand-primary-rgb': '14, 165, 164',
    '--brand-primary-soft': 'rgba(14, 165, 164, 0.14)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--surface-page': '#eefcfb',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(14, 165, 164, 0.2)',
    '--border-strong': 'rgba(14, 165, 164, 0.38)',
    '--shell-bg-1': '#d5f6f3',
    '--shell-bg-2': '#e5fbf9',
    '--shell-bg-3': '#f1fdfc',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(237, 253, 251, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  coral: {
    '--brand-primary': '#ea580c',
    '--brand-primary-rgb': '234, 88, 12',
    '--brand-primary-soft': 'rgba(234, 88, 12, 0.14)',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--surface-page': '#fff6f0',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(234, 88, 12, 0.2)',
    '--border-strong': 'rgba(234, 88, 12, 0.38)',
    '--shell-bg-1': '#ffe4d4',
    '--shell-bg-2': '#fff0e4',
    '--shell-bg-3': '#fff6ef',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(255, 245, 238, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  glacier: {
    '--brand-primary': '#0284c7',
    '--brand-primary-rgb': '2, 132, 199',
    '--brand-primary-soft': 'rgba(2, 132, 199, 0.14)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--surface-page': '#eef8ff',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(2, 132, 199, 0.2)',
    '--border-strong': 'rgba(2, 132, 199, 0.38)',
    '--shell-bg-1': '#d6efff',
    '--shell-bg-2': '#e8f6ff',
    '--shell-bg-3': '#f2faff',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(237, 248, 255, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  emerald: {
    '--brand-primary': '#059669',
    '--brand-primary-rgb': '5, 150, 105',
    '--brand-primary-soft': 'rgba(5, 150, 105, 0.14)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--surface-page': '#f0fbf6',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(5, 150, 105, 0.2)',
    '--border-strong': 'rgba(5, 150, 105, 0.38)',
    '--shell-bg-1': '#d8f6e8',
    '--shell-bg-2': '#e8fbf2',
    '--shell-bg-3': '#f2fdf8',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(238, 252, 246, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  },
  nebula: {
    '--brand-primary': '#7c3aed',
    '--brand-primary-rgb': '124, 58, 237',
    '--brand-primary-soft': 'rgba(124, 58, 237, 0.14)',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--surface-page': '#f7f4ff',
    '--surface-card': '#ffffff',
    '--border-soft': 'rgba(124, 58, 237, 0.2)',
    '--border-strong': 'rgba(124, 58, 237, 0.38)',
    '--shell-bg-1': '#e8ddff',
    '--shell-bg-2': '#f1eaff',
    '--shell-bg-3': '#f8f4ff',
    '--shell-bg-4': '#f8fafc',
    '--sidebar-bg-from': 'rgba(246, 240, 255, 0.94)',
    '--sidebar-bg-to': 'rgba(255, 255, 255, 0.97)'
  }
};

function clampFontSize(size: number): number {
  const n = Number(size);
  if (!Number.isFinite(n)) return DEFAULT_FONT_SIZE;
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(n)));
}

function clampFontWeight(weight: number): AppearanceFontWeight {
  if (weight >= 700) return 700;
  if (weight >= 600) return 600;
  if (weight >= 500) return 500;
  return 400;
}

function safeParsePersisted(raw: string | null): PersistedAppearance {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function isValidScheme(value: unknown): value is AppearanceScheme {
  return ALL_SCHEME_KEYS.includes(String(value) as AppearanceScheme);
}

function isValidFontWeight(value: unknown): value is AppearanceFontWeight {
  return value === 400 || value === 500 || value === 600 || value === 700;
}

function normalizeHexColor(input: string): string | null {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const matched = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!matched) return null;

  if (raw.length === 4) {
    const r = raw[1];
    const g = raw[2];
    const b = raw[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return raw.toLowerCase();
}

function hexToRgb(input: string): RGB | null {
  const hex = normalizeHexColor(input);
  if (!hex) return null;
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16)
  };
}

function toHex(value: number): string {
  const n = Math.max(0, Math.min(255, Math.round(value)));
  return n.toString(16).padStart(2, '0');
}

function mixHex(fromColor: string, toColor: string, ratio: number): string {
  const from = hexToRgb(fromColor);
  const to = hexToRgb(toColor);
  if (!from || !to) return fromColor;

  const p = Math.max(0, Math.min(1, ratio));
  const r = from.r + (to.r - from.r) * p;
  const g = from.g + (to.g - from.g) * p;
  const b = from.b + (to.b - from.b) * p;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 过滤“当前系统可用”的字体。
 * 说明：
 * 1. 优先使用 FontFaceSet.check 做运行时检测；
 * 2. 若浏览器不支持检测能力，则回退为候选列表全量可选。
 */
function detectAvailableFonts(): string[] {
  if (typeof document === 'undefined' || !document.fonts?.check) {
    return FONT_CANDIDATES.map((item) => item.value);
  }

  const available = FONT_CANDIDATES
    .filter((item) => document.fonts.check(`16px "${item.value}"`))
    .map((item) => item.value);

  return available.length > 0 ? available : [DEFAULT_FONT];
}

function applyCssVariables(vars: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function buildFontStack(primary: string): string {
  return `"${primary}","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Helvetica Neue",Arial,sans-serif`;
}

/**
 * 为 Element Plus 注入当前主题色的衍生色。
 * 说明：解决 primary 按钮 hover 仍显示默认蓝色的问题。
 */
function applyElementPrimaryPalette(primary: string) {
  const root = document.documentElement;
  root.style.setProperty('--el-color-primary', primary);
  root.style.setProperty('--el-color-primary-dark-2', mixHex(primary, '#000000', 0.2));
  root.style.setProperty('--el-color-primary-light-1', mixHex(primary, '#ffffff', 0.1));
  root.style.setProperty('--el-color-primary-light-2', mixHex(primary, '#ffffff', 0.2));
  root.style.setProperty('--el-color-primary-light-3', mixHex(primary, '#ffffff', 0.3));
  root.style.setProperty('--el-color-primary-light-4', mixHex(primary, '#ffffff', 0.4));
  root.style.setProperty('--el-color-primary-light-5', mixHex(primary, '#ffffff', 0.5));
  root.style.setProperty('--el-color-primary-light-6', mixHex(primary, '#ffffff', 0.6));
  root.style.setProperty('--el-color-primary-light-7', mixHex(primary, '#ffffff', 0.7));
  root.style.setProperty('--el-color-primary-light-8', mixHex(primary, '#ffffff', 0.8));
  root.style.setProperty('--el-color-primary-light-9', mixHex(primary, '#ffffff', 0.9));
}

/**
 * 界面偏好设置（配色/字体/字号）。
 * 职责：
 * 1. 管理用户在前端的视觉设置；
 * 2. 将设置同步到 CSS 变量；
 * 3. 持久化到 localStorage，重启后自动恢复。
 */
export const useAppearanceStore = defineStore('appearance', {
  state: (): AppearanceState => ({
    scheme: DEFAULT_SCHEME,
    fontFamily: DEFAULT_FONT,
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: DEFAULT_FONT_WEIGHT,
    availableFonts: [],
    bootstrapped: false
  }),

  getters: {
    fontOptions: (state): Array<{ label: string; value: string }> => {
      const labelMap = new Map(FONT_CANDIDATES.map((item) => [item.value, item.label]));
      return state.availableFonts.map((font) => ({
        value: font,
        label: labelMap.get(font) || font
      }));
    },
    schemeOptions: (): SchemeOption[] => APPEARANCE_SCHEME_OPTIONS,
    fontWeightOptions: () => APPEARANCE_FONT_WEIGHT_OPTIONS
  },

  actions: {
    /**
     * 初始化偏好设置（仅执行一次）。
     */
    bootstrap() {
      if (this.bootstrapped || typeof document === 'undefined') return;

      const availableFonts = detectAvailableFonts();
      this.availableFonts = availableFonts;

      const saved = safeParsePersisted(localStorage.getItem(STORAGE_KEY));
      const nextScheme = isValidScheme(saved.scheme) ? saved.scheme : DEFAULT_SCHEME;
      const nextFont = availableFonts.includes(saved.fontFamily || '')
        ? String(saved.fontFamily)
        : (availableFonts[0] || DEFAULT_FONT);
      const nextFontSize = clampFontSize(
        typeof saved.fontSize === 'number' ? saved.fontSize : DEFAULT_FONT_SIZE
      );
      const nextFontWeight = isValidFontWeight(saved.fontWeight)
        ? saved.fontWeight
        : DEFAULT_FONT_WEIGHT;

      this.scheme = nextScheme;
      this.fontFamily = nextFont;
      this.fontSize = nextFontSize;
      this.fontWeight = nextFontWeight;
      this.applyToDocument();
      this.bootstrapped = true;
    },

    setScheme(scheme: AppearanceScheme) {
      if (!isValidScheme(scheme)) return;
      this.scheme = scheme;
      this.applyToDocument();
    },

    setFontFamily(fontFamily: string) {
      if (!this.availableFonts.includes(fontFamily)) return;
      this.fontFamily = fontFamily;
      this.applyToDocument();
    },

    setFontSize(fontSize: number) {
      this.fontSize = clampFontSize(fontSize);
      this.applyToDocument();
    },

    setFontWeight(fontWeight: number) {
      this.fontWeight = clampFontWeight(fontWeight);
      this.applyToDocument();
    },

    /**
     * 应用当前配置到页面并持久化。
     */
    applyToDocument() {
      if (typeof document === 'undefined') return;

      const themeTokens = SCHEME_TOKENS[this.scheme];
      applyCssVariables(themeTokens);

      const root = document.documentElement;
      const baseSize = clampFontSize(this.fontSize);
      const baseWeight = clampFontWeight(this.fontWeight);
      const semiboldWeight = clampFontWeight(baseWeight + 100);
      const primary = themeTokens['--brand-primary'];

      root.style.setProperty('--app-font-family', buildFontStack(this.fontFamily));
      root.style.setProperty('--app-font-size', `${baseSize}px`);
      root.style.setProperty('--app-font-weight', `${baseWeight}`);
      root.style.setProperty('--app-font-weight-semibold', `${semiboldWeight}`);

      // 同步 Element Plus 的字号变量，保证“放大/缩小字号”时组件与业务文本一起变化。
      root.style.setProperty('--el-font-size-extra-large', `${baseSize + 4}px`);
      root.style.setProperty('--el-font-size-large', `${baseSize + 2}px`);
      root.style.setProperty('--el-font-size-medium', `${baseSize + 1}px`);
      root.style.setProperty('--el-font-size-base', `${baseSize}px`);
      root.style.setProperty('--el-font-size-small', `${Math.max(12, baseSize - 1)}px`);
      root.style.setProperty('--el-font-size-extra-small', `${Math.max(11, baseSize - 2)}px`);

      // 修复主题切换后按钮 hover 色不跟随的问题。
      applyElementPrimaryPalette(primary);

      // 若主题中没有配置 rgb，则用主色自动生成，供 rgba 场景使用。
      if (!themeTokens['--brand-primary-rgb']) {
        const rgb = hexToRgb(primary);
        if (rgb) {
          root.style.setProperty('--brand-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
      }

      const payload: PersistedAppearance = {
        scheme: this.scheme,
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        fontWeight: this.fontWeight
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  }
});
