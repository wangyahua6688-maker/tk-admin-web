// src/env.d.ts - 环境声明文件
// 为 TypeScript 提供 Vue 单文件组件的类型声明
/// <reference types="vite/client" />

// 声明 Vue 单文件组件模块
declare module '*.vue' {
  // 导入 DefineComponent 类型
  import type { DefineComponent } from 'vue'
  // 定义组件类型
  const component: DefineComponent<{}, {}, any>
  // 导出组件
  export default component
}