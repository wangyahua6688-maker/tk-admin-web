/**
 * 后端菜单节点结构。
 * 字段与后端 /api/menus/frontend/tree 保持一致。
 */
export interface BackendMenuNode {
  id: number;
  title: string;
  path: string;
  icon?: string;
  parent_id: number;
  component?: string;
  order_num: number;
  children?: BackendMenuNode[];
}

/**
 * 前端菜单节点结构（供侧边栏渲染）。
 */
export interface NavMenuNode {
  id: number;
  title: string;
  path: string;
  icon: string;
  order: number;
  children: NavMenuNode[];
}
