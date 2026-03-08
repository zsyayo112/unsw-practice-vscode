# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 项目背景

面向 UNSW COMP9021（Python编程原理）学生的 VSCode 插件练题平台，目标用户以中国留学生为主，为私人补课机构引流（插件本身免费）。

**当前阶段（MVP）：** 题目列表 + 做题面板 + 代码运行 + Mock数据。不做登录/云同步/排行榜。

---

## 构建与开发命令

```bash
npm run build              # 生产构建（两个 esbuild target）
npm run watch              # 开发模式，文件变化自动重建
npm run type-check         # 类型检查（零报错是硬性要求）
npm run lint               # ESLint 检查
npm run vscode:prepublish  # 打包前构建（production 模式）
```

**调试：** F5 → 启动 Extension Development Host，左侧出现 UNSW Practice 图标。

---

## 架构概览

```
src/extension.ts          ← 入口：只做组装，零业务逻辑；含 loadProblems() 负责数据加载
src/types/index.ts        ← 唯一数据契约（所有接口/枚举/常量定义在此）
src/services/             ← 纯业务逻辑，零 VSCode UI 依赖
  api.ts                  ← fetchProblems / fetchProblem(slug) / submitSolution / fetchUserProgress / runCode / submitCode / ApiError
  auth.ts                 ← createAuthService(secrets) 工厂 + storeUser/getUser/clearUser
src/providers/
  ProblemTreeProvider.ts  ← 侧边栏题目列表（TreeDataProvider）；数据通过 setProblems() 推入，不自行 fetch
  ProblemWebviewProvider.ts ← 做题面板（WebviewPanel + 消息总线）；单实例复用，openProblem() 切换题目
src/commands/             ← 每个文件导出一个 register*() → vscode.Disposable
  openProblem.ts          ← unsw-practice.openProblem
  submitCode.ts           ← unsw-practice.submitCode
  login.ts                ← unsw-practice.login / logout
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

### ProblemTreeProvider 数据流

数据加载与 UI 解耦：`extension.ts` 的 `loadProblems()` 调用 `fetchProblems()` + `fetchUserProgress()`，完成后调用 `treeProvider.setProblems(problems, progress)`。Provider 内部维护三种状态（`loading` / `error` / `loaded`），分别渲染 spinner、错误提示或按难度分组的题目树（`GroupItem` → `ProblemTreeItem[]`）。`refresh` 命令触发 `loadProblems()` 重新拉取，而非仅 `fire()` 事件。

### ProblemWebviewProvider 面板模式

单 `WebviewPanel` 实例在多题目间复用：已存在时调 `reveal()`，不存在时创建。切换题目时直接覆写 `panel.webview.html` 并 postMessage `load-problem`。Monaco 版本固定：`monaco-editor@0.52.0`（通过 CDN，不打包）。

**CSP（`buildHtml()` 中设置）：**
```
default-src 'none';
style-src   ${webview.cspSource} 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
script-src  'nonce-${nonce}' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
font-src    ${webview.cspSource} https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
connect-src ${webview.cspSource} https://emkc.org https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
```
注意：Monaco 在运行时动态注入 `<link>` 加载自身 CSS（`editor.main.css`），因此 `style-src` 必须包含 `cdn.jsdelivr.net`。`connect-src` 需要 `${webview.cspSource}` 才能加载本地 source map（`main.js.map`）。

### Extension ↔ WebView 消息总线

类型定义在 `src/types/index.ts`：
- `ExtensionMessage`：extension → webview（`load-problem` / `run-result` / `submit-result` / `loading`）
- `WebviewMessage`：webview → extension（`ready` / `run-code` / `submit-code`）

`run-code` 消息携带 `{ code, input, expectedOutput }`；extension 调用 `runCode()` 后 postMessage 回 `TestResult`。`submit-code` 触发 `submitCode(code, problem.testCases)` 返回 `SubmissionResult`（WebView 内部流程，不走 `submitSolution`）。

`ProblemWebviewProvider.handleWebviewMessage()` 处理所有入站消息，调用 `api.ts` 中的函数，再 `postMessage` 回 webview。

### 核心类型（src/types/index.ts）

- **`Difficulty`**：enum，值为小写字符串（`'easy' / 'medium' / 'hard'`）
- **`SubmissionStatus`**：enum（`Accepted / WrongAnswer / RuntimeError / TimeLimitExceeded`）
- **`Problem`**：字段全部 camelCase（`starterCode`, `testCases`, `topics`, `slug`, `hints`, `acceptanceRate`, `orderIndex`, `isPublished`）
- **`TestCase`**：`{ input: string; expectedOutput: string }`，嵌入 `Problem.testCases`
- **`TestResult`**：单测结果 `{ passed, input, expectedOutput, actualOutput, error? }`
- **`SubmissionResult`**：`{ status: SubmissionStatus, testResults: TestResult[], runtimeMs: number }`
- **`AuthState`**：`{ isAuthenticated, token?, user? }`，`user` 为内联对象（无独立 `User` 类型）

### MOCK_MODE

`src/services/api.ts` 顶部有 `export const MOCK_MODE = true`。阶段一全程使用本地 mock 数据（3道 COMP9021 题：`fibonacci` / `stack-implementation` / `bank-account`），每道题的 `testCases` 直接嵌入 `Problem` 对象，按 `slug` 查询。切换至 `false` 后会调用 `https://api.unsw-practice.com/api/v1`。

所有后端调用走 `fetchWithRetry`（10 秒超时 + 2 次网络重试，4xx/5xx 不重试），网络/HTTP 错误统一抛 `ApiError`（含 `statusCode?`）。

### WebView 前端（src/webview/main.ts）

UI 由 `buildLayout()` 注入骨架，`load-problem` 消息到达后 `renderProblem()` 填充内容：

- **左栏**：题目标题 + 难度 badge + topic pills；三个 tab（Description / Hints / Solution 🔒）；Hints 用 `<details>` 渐进展示
- **右栏**：工具栏（Python 3 badge / Run / Submit / Reset）+ Monaco 编辑器 + 结果面板
- **localStorage**：编辑器内容自动保存到 `unsw-code-${slug}`，切换题目时恢复，Reset 按钮清除并还原 `starterCode`
- **`isRunning` flag**：`loading` 消息控制按钮 disabled 并阻止重复提交
- **结果面板**：Run 显示单条 `TestResult`；Submit 显示每条测试用例的 pass/fail + "🎉 Accepted!" banner

### CDN 全局变量访问模式

所有从 CDN 注入的全局变量（Monaco `require`、marked.js）统一通过 globalThis cast 访问，避免与 `@types/node` 冲突：
```typescript
const monacoRequire = (globalThis as Record<string, unknown>)['require'] as MonacoLoader;
const markedLib = (globalThis as Record<string, unknown>)['marked'] as { parse(md: string): string } | undefined;
```
`marked@4` 从 CDN 加载（`https://cdn.jsdelivr.net/npm/marked@4/marked.min.js`），`markedLib` 可能为 `undefined`，`renderMarkdown()` 内有 fallback。

---

## 代码规范（强制）

- **零 `any`**：用 `Record<string, unknown>` + 接口替代，`@typescript-eslint/no-explicit-any: error`
- **显式返回类型**：所有函数必须标注返回类型，`explicit-function-return-type: error`
- **Promise 不能悬空**：`no-floating-promises: error`，void 调用必须显式标记 `void fn()`
- **所有 disposable** 必须 push 到 `context.subscriptions`
- **WebView** 必须有 `nonce` + `CSP header`（见 `ProblemWebviewProvider.buildHtml()`）
- **错误** 用 `vscode.window.showErrorMessage()` 展示，不 throw 到顶层
- **`src/services/`** 的函数不得 `import * as vscode from 'vscode'`（可 `import type`），VSCode API 通过参数注入；`auth.ts` 用 `createAuthService(secrets)` 工厂注入一次，而非每次调用传参
- **`src/commands/`** 每个文件导出一个 `register*()` 函数，返回 `vscode.Disposable`，在 `extension.ts` 统一注册
- **`openProblem` 命令** 接收 `slug`（非 `id`）；`ProblemTreeItem` 的 `command.arguments` 传 `problem.slug`

---

## 产品演进约束（技术决策参考）

| 约束 | 原因 |
|------|------|
| API 路由用 `/api/v1/` 版本化 | 阶段二网页版和插件共用同一套后端 |
| `problems` 表用 `course_id` 外键（API 层面） | 阶段三多课程支持无需迁移 Schema |
| 进度数据预留 `user_id` 字段（可空） | 阶段二加用户体系时数据无缝迁移 |
| 业务逻辑全部在后端，插件是纯客户端 | 阶段二网页版可直接复用后端 |

不需要提前实现阶段二三功能，但数据结构和接口设计不能挡路。遇到方案选择时：选扩展性好的简单方案。


