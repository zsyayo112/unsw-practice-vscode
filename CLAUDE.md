# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 项目背景

面向 UNSW COMP9021（Python编程原理）学生的 VSCode 插件练题平台，目标用户以中国留学生为主，为私人补课机构引流（插件本身免费）。

**当前阶段（MVP）：** 题目列表 + 做题面板 + 代码运行 + Mock数据。不做登录/云同步/排行榜。

---

## 构建与开发命令

```bash
npm run build          # 生产构建（两个 esbuild target）
npm run watch          # 开发模式，文件变化自动重建
npx tsc --noEmit       # 类型检查（零报错是硬性要求）
npm run lint           # ESLint 检查
```

**调试：** F5 → 启动 Extension Development Host，左侧出现 UNSW Practice 图标。

---

## 架构概览

```
src/extension.ts          ← 入口：只做组装，零业务逻辑
src/types/index.ts        ← 唯一数据契约（所有接口定义在此）
src/services/             ← 纯业务逻辑，零 VSCode UI 依赖
  api.ts                  ← fetchProblems / runCode / submitCode
  auth.ts                 ← token/user 存储（VSCode API 作为参数注入）
src/providers/
  ProblemTreeProvider.ts  ← 侧边栏题目列表（TreeDataProvider）
  ProblemWebviewProvider.ts ← 做题面板（WebviewPanel + 消息总线）
src/commands/             ← 每个命令一个文件，返回 Disposable
src/webview/main.ts       ← WebView 前端（浏览器上下文，esbuild 编译）
media/main.css            ← WebView 静态样式
out/extension.js          ← 编译产物：Node CJS bundle
out/webview/main.js       ← 编译产物：IIFE browser bundle
```

### esbuild 双 target

`esbuild.js` 并行构建两个 target：
- **Extension**：`src/extension.ts` → `out/extension.js`（Node CJS，`external: ['vscode']`）
- **Webview**：`src/webview/main.ts` → `out/webview/main.js`（IIFE browser，无 external）

TypeScript 配置（`tsconfig.json`）使用 `"module": "Preserve", "moduleResolution": "Bundler"`，专为 esbuild 设计，无需在 import 路径加 `.js` 后缀。

### Extension ↔ WebView 消息总线

类型定义在 `src/types/index.ts`：
- `ExtensionMessage`：extension → webview（`load-problem` / `run-result` / `submit-result` / `loading`）
- `WebviewMessage`：webview → extension（`ready` / `run-code` / `submit-code`）

`ProblemWebviewProvider.handleWebviewMessage()` 处理所有入站消息，调用 `api.ts` 中的函数，再 `postMessage` 回 webview。

### MOCK_MODE

`src/services/api.ts` 顶部有 `const MOCK_MODE = true`。阶段一全程使用本地 mock 数据（5道 COMP9021 题），不连接后端。切换至 `false` 后会调用 `https://api.unsw-practice.com/api/v1`。

### Monaco Editor

从 CDN 加载（不打包）。在 `src/webview/main.ts` 中，AMD `require` 通过以下方式访问（避免与 `@types/node` 冲突）：
```typescript
const monacoRequire = (globalThis as Record<string, unknown>)['require'] as MonacoLoader;
```

---

## 代码规范（强制）

- **零 `any`**：用 `Record<string, unknown>` + 接口替代，`@typescript-eslint/no-explicit-any: error`
- **所有 disposable** 必须 push 到 `context.subscriptions`
- **WebView** 必须有 `nonce` + `CSP header`（见 `ProblemWebviewProvider.buildHtml()`）
- **错误** 用 `vscode.window.showErrorMessage()` 展示，不 throw 到顶层
- **`src/services/`** 的函数不得 `import * as vscode from 'vscode'`（可 `import type`），VSCode API 通过参数注入

---

## 产品演进约束（技术决策参考）

| 约束 | 原因 |
|------|------|
| API 路由用 `/api/v1/` 版本化 | 阶段二网页版和插件共用同一套后端 |
| `problems` 表用 `course_id` 外键 | 阶段三多课程支持无需迁移 Schema |
| 进度数据预留 `user_id` 字段（可空） | 阶段二加用户体系时数据无缝迁移 |
| 业务逻辑全部在后端，插件是纯客户端 | 阶段二网页版可直接复用后端 |

不需要提前实现阶段二三功能，但数据结构和接口设计不能挡路。遇到方案选择时：选扩展性好的简单方案。
