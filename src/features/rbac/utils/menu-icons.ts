import type { Component } from 'vue';
import * as ElementPlusIcons from '@element-plus/icons-vue';
import * as LucideIcons from 'lucide-vue-next';

export type MenuIconLibrary = 'ep' | 'lucide';

export interface MenuIconOption {
  value: string;
  label: string;
  library: MenuIconLibrary;
}

const DEFAULT_MENU_ICON = 'ep:Menu';

/**
 * 历史菜单图标兼容映射（数据库中旧值 -> Element Plus 新值）。
 */
const LEGACY_ICON_ALIAS_MAP: Record<string, string> = {
  setting: 'Setting',
  user: 'User',
  team: 'UserFilled',
  lock: 'Lock',
  menu: 'Menu',
  history: 'Clock',
  audit: 'DataAnalysis'
};

/**
 * Lucide 图标白名单。
 * 说明：
 * 1. Lucide 图标总量很大，这里按后台场景挑选常用图标；
 * 2. 保证弹窗可读性，避免一次性渲染过多图标导致卡顿。
 */
const LUCIDE_ICON_NAMES = [
  'LayoutDashboard',
  'PanelsTopLeft',
  'Table',
  'List',
  'Folder',
  'FolderOpen',
  'Files',
  'FileText',
  'ClipboardList',
  'History',
  'Database',
  'Server',
  'Cloud',
  'HardDrive',
  'Users',
  'User',
  'UserCog',
  'UserRound',
  'Shield',
  'ShieldCheck',
  'ShieldAlert',
  'Lock',
  'KeyRound',
  'Fingerprint',
  'Settings',
  'Settings2',
  'SlidersHorizontal',
  'Wrench',
  'Cog',
  'Command',
  'BadgeCheck',
  'CheckCircle2',
  'AlertCircle',
  'Ban',
  'CircleHelp',
  'Bell',
  'Mail',
  'MessageSquare',
  'Search',
  'Filter',
  'SortAsc',
  'ArrowUpDown',
  'RefreshCcw',
  'RotateCw',
  'LoaderCircle',
  'Calendar',
  'Clock3',
  'Timer',
  'Activity',
  'BarChart3',
  'PieChart',
  'LineChart',
  'TrendingUp',
  'Wallet',
  'CreditCard',
  'Package',
  'ShoppingCart',
  'MapPinned',
  'Navigation',
  'Home',
  'Building2',
  'Briefcase',
  'BookOpen',
  'Bookmark',
  'NotebookTabs',
  'Code2',
  'Terminal',
  'Braces',
  'Workflow',
  'Network',
  'GitBranch',
  'Share2',
  'Image',
  'Palette',
  'Monitor',
  'Smartphone',
  'Tablet',
  'Globe',
  'Rocket',
  'Gem',
  'Sparkles'
];

const elementPlusIconMap = ElementPlusIcons as unknown as Record<string, Component>;
const lucideIconMap = LucideIcons as unknown as Record<string, Component>;

const elementPlusIconOptions: MenuIconOption[] = Object.keys(elementPlusIconMap)
  .filter((name) => name !== 'default' && /^[A-Z]/.test(name))
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({
    value: `ep:${name}`,
    label: name,
    library: 'ep'
  }));

const lucideIconOptions: MenuIconOption[] = LUCIDE_ICON_NAMES.filter((name) => Boolean(lucideIconMap[name]))
  .map((name) => ({
    value: `lucide:${name}`,
    label: name,
    library: 'lucide'
  }));

/**
 * 图标库配置（供菜单管理页面图标选择器使用）。
 */
export const menuIconLibraries: Array<{ key: MenuIconLibrary; title: string; options: MenuIconOption[] }> = [
  {
    key: 'ep',
    title: 'Element Plus',
    options: elementPlusIconOptions
  },
  {
    key: 'lucide',
    title: 'Lucide',
    options: lucideIconOptions
  }
];

function toPascalCase(value: string): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return `${raw.slice(0, 1).toUpperCase()}${raw.slice(1)}`;
}

function pickLibraryIcon(library: MenuIconLibrary, name: string): string | null {
  const raw = String(name || '').trim();
  if (!raw) return null;

  const map = library === 'ep' ? elementPlusIconMap : lucideIconMap;
  if (map[raw]) return raw;

  const pascal = toPascalCase(raw);
  if (map[pascal]) return pascal;

  return null;
}

/**
 * 统一规范菜单图标值，保证可渲染。
 * 输出格式：
 * - Element Plus: ep:Menu
 * - Lucide: lucide:LayoutDashboard
 */
export function normalizeMenuIconValue(icon: string): string {
  const raw = String(icon || '').trim();
  if (!raw) return DEFAULT_MENU_ICON;

  // 新格式：库前缀 + 图标名。
  if (raw.includes(':')) {
    const [library, ...rest] = raw.split(':');
    const iconName = rest.join(':');
    if (library === 'ep') {
      const matched = pickLibraryIcon('ep', iconName);
      return matched ? `ep:${matched}` : DEFAULT_MENU_ICON;
    }
    if (library === 'lucide') {
      const matched = pickLibraryIcon('lucide', iconName);
      return matched ? `lucide:${matched}` : DEFAULT_MENU_ICON;
    }
  }

  // 旧格式兼容：setting/user/team 等历史值。
  const legacy = LEGACY_ICON_ALIAS_MAP[raw.toLowerCase()];
  if (legacy) {
    return `ep:${legacy}`;
  }

  // 无前缀时优先尝试 Element Plus，再尝试 Lucide。
  const epMatched = pickLibraryIcon('ep', raw);
  if (epMatched) return `ep:${epMatched}`;

  const lucideMatched = pickLibraryIcon('lucide', raw);
  if (lucideMatched) return `lucide:${lucideMatched}`;

  return DEFAULT_MENU_ICON;
}

/**
 * 获取图标所属库。
 */
export function getMenuIconLibrary(icon: string): MenuIconLibrary {
  const normalized = normalizeMenuIconValue(icon);
  return normalized.startsWith('lucide:') ? 'lucide' : 'ep';
}

/**
 * 获取可显示的图标名（不包含库前缀）。
 */
export function getMenuIconDisplayName(icon: string): string {
  const normalized = normalizeMenuIconValue(icon);
  const [, name] = normalized.split(':');
  return name || 'Menu';
}

/**
 * 解析对应的 Vue 组件，供页面渲染。
 */
export function resolveMenuIconComponent(icon: string): Component {
  const normalized = normalizeMenuIconValue(icon);
  const [library, name] = normalized.split(':');
  if (library === 'lucide' && lucideIconMap[name]) {
    return lucideIconMap[name];
  }
  return elementPlusIconMap[name] || elementPlusIconMap.Menu;
}
