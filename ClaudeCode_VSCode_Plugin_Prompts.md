# UNSW Practice — VSCode 插件搭建 Prompt 套件
# 专为 Claude Code CLI 工作流设计，按顺序执行

---

## 工作流说明

```bash
# 终端操作顺序：
mkdir unsw-practice-vscode
cd unsw-practice-vscode
git init
claude   # 启动 Claude Code
```

**Claude Code 关键命令备忘：**

| 命令 | 作用 |
|------|------|
| `/init` | 扫描项目，生成 CLAUDE.md（每个阶段结束都运行一次）|
| `/clear` | 切换新任务前清除上下文 |
| `/compact` | 上下文快满时压缩 |
| `@src/extension.ts` | 引用具体文件，比复制粘贴更高效 |
| `Escape` | 停止当前任务（不是 Ctrl+C）|
| `#` | 快速把重要信息存进项目记忆 |

---
## 当前任务：Week 1 — 项目脚手架

目标：把项目骨架搭起来，F5 能弹出 Extension Development Host，
侧边栏出现 UNSW Practice 图标。这是整个项目的地基，
后续所有模块都建在这个结构上。

完成标准：
1. npm run build 零报错
2. npx tsc --noEmit 零报错  
3. F5 弹出新窗口
4. 新窗口左侧出现插件图标

---

## PROMPT 1 — 项目脚手架

```
Scaffold a production-ready VSCode extension project called "UNSW Practice".

Purpose: UNSW students practice COMP9021 Python problems XEEEEEEinside VSCode —
like LeetCode but in their editor. Fetches problems from a web API, displays
them in a WebView panel, runs code via Piston API.

Create this exact structure with all files fully implemented:

unsw-practice-vscode/
├── src/
│   ├── extension.ts
│   ├── providers/
│   │   ├── ProblemTreeProvider.ts
│   │   └── ProblemWebviewProvider.ts
│   ├── commands/
│   │   ├── submitCode.ts
│   │   ├── openProblem.ts
│   │   └── login.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── auth.ts
│   └── types/index.ts
├── media/
│   ├── main.css
│   └── main.js
├── .vscode/
│   ├── launch.json
│   └── tasks.json
├── package.json
├── tsconfig.json
├── esbuild.js
├── .eslintrc.json
├── .prettierrc
└── .vscodeignore

Requirements:
- TypeScript strict mode
- esbuild bundler (NOT webpack)
- ESLint + Prettier configured and working
- engines.vscode: "^1.95.0"
- publisher: "unsw-practice" (placeholder)

In package.json contributes section:
- viewsContainers: activitybar icon "unsw-practice"
- views: tree view "Problems" under that container
- commands: unsw-practice.openProblem, unsw-practice.submitCode,
  unsw-practice.login, unsw-practice.logout, unsw-practice.refresh
- keybinding: Ctrl+Shift+U opens the problem panel

In esbuild.js:
- Two build targets: extension (Node CJS) + webview (browser ESM)
- Source maps in dev, minify in production
- External: ['vscode']
- Watch mode via --watch flag

In launch.json:
- "Run Extension" config for F5 debugging
- outFiles points to correct bundle path

Make every config file complete — zero TODOs, zero placeholders.
```

---

## PROMPT 2 — TypeScript 类型定义

`/clear` 后执行：

```
Implement @src/types/index.ts with comprehensive TypeScript types for the
entire extension. Include JSDoc on every interface.

Types required:

interface Problem {
  id: string
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string[]
  description: string        // Markdown string
  starterCode: string        // Python starter code
  hints: string[]
  acceptanceRate: number
  orderIndex: number
  isPublished: boolean
}

interface UserProgress {
  problemId: string
  status: 'unsolved' | 'attempted' | 'solved'
  solveCount: number
  lastSubmittedAt?: string
}

interface TestResult {
  passed: boolean
  input: string
  expectedOutput: string
  actualOutput: string
  error?: string
}

interface SubmissionResult {
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded'
  testResults: TestResult[]
  runtimeMs: number
  message?: string
}

interface ApiResponse<T> {
  data: T
  error?: string
}

interface AuthState {
  isAuthenticated: boolean
  token?: string
  user?: {
    id: string
    displayName: string
    email: string
  }
}

interface ExtensionConfig {
  apiBaseUrl: string
  autoSave: boolean
}

Also export:
- const EXTENSION_ID = 'unsw-practice'
- const SECRET_KEY = 'unsw-practice.authToken'
- enum Difficulty { Easy = 'easy', Medium = 'medium', Hard = 'hard' }
- enum SubmissionStatus with all 4 values
```

---

## PROMPT 3 — API 服务层

```
Implement @src/services/api.ts and @src/services/auth.ts using types
from @src/types/index.ts.

--- api.ts ---

Base URL from vscode config key 'unsw-practice.apiBaseUrl'
Default: 'https://api.unsw-practice.com'

Implement:

fetchProblems(token?: string): Promise<Problem[]>
  GET /api/problems
  If token provided, merge UserProgress data per problem

fetchProblem(slug: string, token?: string): Promise<Problem>
  GET /api/problems/:slug

submitSolution(params: {
  problemId: string
  code: string
  token: string
}): Promise<SubmissionResult>
  POST /api/submit

fetchUserProgress(token: string): Promise<UserProgress[]>
  GET /api/progress

Requirements:
- Native fetch only (Node 18+, no axios)
- 10s timeout via AbortController
- Retry: 2 retries on network error, NO retry on 4xx/5xx
- Custom ApiError class: { message, statusCode, originalError? }
- All functions must propagate ApiError
- MOCK_MODE: export const MOCK_MODE = process.env.MOCK_MODE === 'true'
  When true, return hardcoded sample problems (3 problems minimum)
  so UI can be tested before the real API is built

--- auth.ts ---

Inject vscode.SecretStorage (passed from extension.ts activate())

getToken(): Promise<string | undefined>
setToken(token: string): Promise<void>
clearToken(): Promise<void>
isAuthenticated(): Promise<boolean>

Use SECRET_KEY from @src/types/index.ts.
NEVER use vscode.workspace.getConfiguration for secrets.
```

---

## PROMPT 4 — 侧边栏题目树

```
Implement @src/providers/ProblemTreeProvider.ts.

class ProblemTreeProvider implements vscode.TreeDataProvider<ProblemTreeItem>

TreeItem display per problem:
- label: "#${orderIndex}  ${title}"
- description: topics joined by " · "
- tooltip: first 120 chars of description
- iconPath: ThemeIcon based on progress status:
    solved   → "pass-filled"  with ThemeColor('testing.iconPassed')
    attempted → "circle-large-outline" with ThemeColor('charts.yellow')
    unsolved  → "circle-outline"
- contextValue: 'problem' (enables right-click menu)
- command: triggers unsw-practice.openProblem on click
- difficulty shown as prefix: [E] / [M] / [H] in label

Group problems into collapsible parent nodes:
- "🟢 Easy (X solved / Y total)"
- "🟡 Medium (X solved / Y total)"
- "🔴 Hard (X solved / Y total)"

Methods:
- refresh(): fires _onDidChangeTreeData
- setProblems(problems: Problem[], progress: UserProgress[]): updates internal state
- filterByTopic(topic: string | null): filters displayed problems
- filterByDifficulty(d: Difficulty | null)
- search(query: string): filters by title substring (case-insensitive)

Tree view title should show overall progress: "X / Y Solved"

On first load: show a single item "Loading problems..." with spinner icon.
On error: show "⚠ Failed to load — click Refresh" item.

Wire up EventEmitter<ProblemTreeItem | undefined | null | void> properly.
```

---

## PROMPT 5 — WebView 做题面板

```
Implement @src/providers/ProblemWebviewProvider.ts plus media/main.css
and media/main.js.

The WebView panel opens when a problem is clicked.

--- Panel HTML Layout ---

LEFT COLUMN (38%, scrollable):
  - Header: title, [Easy/Medium/Hard] badge, topic pills
  - Tab bar: "Description" | "Hints" | "Solution 🔒"
  - Tab content rendered as Markdown (use marked.js from CDN)
  - Examples section styled as code blocks

RIGHT COLUMN (62%):
  - Toolbar: language badge "Python 3", [▶ Run] button, [↑ Submit] button, [↺ Reset] button
  - Monaco Editor:
      Load from: https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs
      Language: python, Theme: vs-dark
      fontSize: 14, minimap: disabled
      Auto-save code to localStorage key: 'unsw-code-${slug}'
      Restore saved code on load (fallback to starterCode)
  - Results panel (hidden initially, slides up on run/submit):
      Each test case row: status icon, input preview, expected, actual
      Summary bar: "X / Y Tests Passed" + runtime
      "🎉 Accepted!" banner if all pass
      Error message block if runtime_error

--- Message Protocol ---

WebView → Extension (postMessage):
  { type: 'submit', code: string, problemId: string }
  { type: 'run', code: string, problemId: string }
  { type: 'ready' }

Extension → WebView (panel.webview.postMessage):
  { type: 'problem', data: Problem }
  { type: 'result', data: SubmissionResult }
  { type: 'loading', value: boolean }

--- ProblemWebviewProvider class ---

- Creates panel with retainContextWhenHidden: true
- generateNonce(): string helper
- getWebviewContent(webview, extensionUri, problem): string
- Proper CSP header with nonce
- getUri() for local media file references
- Message handler for submit/run → calls api service → posts result back
- Reveal existing panel if already open for same problem

Implement media/main.css with:
- Dark theme matching VSCode (use var(--vscode-*) CSS variables)
- Smooth tab switching animation
- Results panel slide-up transition
- Responsive split (stack vertically under 700px width)

Implement media/main.js with:
- Monaco initialization
- Tab switching logic
- Message send/receive handlers
- localStorage save/restore
- Results rendering
```

---

## PROMPT 6 — 主入口 & 命令注册

```
Implement @src/extension.ts — the main entry point.

activate(context: vscode.ExtensionContext):

1. Read config:
   const config = vscode.workspace.getConfiguration('unsw-practice')

2. Init services:
   - authService = new AuthService(context.secrets)
   - apiService = new ApiService(config)

3. Init providers:
   - treeProvider = new ProblemTreeProvider(apiService, authService)
   - register as: vscode.window.registerTreeDataProvider('unsw-practice-problems', treeProvider)

4. Load problems on startup:
   - Call apiService.fetchProblems() + authService.getToken()
   - Pass results to treeProvider.setProblems()
   - Wrap in try/catch, show error notification if fails

5. Register commands:

   unsw-practice.refresh
   → Re-fetch problems, update tree

   unsw-practice.openProblem (receives ProblemTreeItem)
   → new ProblemWebviewProvider(context, apiService, authService)
   → panel.reveal() or create new

   unsw-practice.submitCode
   → Check isAuthenticated() — if not, prompt to login
   → Get active editor text
   → Show progress notification while submitting
   → Update tree item status on success

   unsw-practice.login
   → Open browser: vscode.env.openExternal(loginUrl)
   → Start http server on port 54321 for OAuth callback
   → Extract token from ?token= query param
   → authService.setToken(token)
   → vscode.window.showInformationMessage('Logged in!')
   → treeProvider.refresh()

   unsw-practice.logout
   → authService.clearToken()
   → treeProvider.refresh()

6. Status bar:
   const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
   statusBar.command = 'unsw-practice.refresh'
   Update text to "UNSW: X/Y solved" after each refresh
   Push to context.subscriptions

7. Push ALL disposables to context.subscriptions

deactivate():
- Close HTTP server if open
- Log "UNSW Practice deactivated"
```

---

## PROMPT 7 — 调试验证（最后执行）

```
Review and fix the entire project so it's ready to run.

Do the following in order:

1. Run: npm install
   Fix any peer dependency warnings

2. Run: npx tsc --noEmit
   Fix EVERY TypeScript error. Zero errors required.

3. Run: npm run build
   Fix any esbuild errors. Confirm output files exist.

4. Verify package.json:
   - "main" matches the esbuild output path exactly
   - Every command in "contributes.commands" has a matching
     vscode.commands.registerCommand in extension.ts
   - activationEvents includes "onView:unsw-practice-problems"

5. Verify launch.json:
   - "outFiles" glob matches the compiled bundle path
   - "extensionDevelopmentPath" is "${workspaceFolder}"

6. Verify MOCK_MODE works:
   In api.ts, confirm MOCK_MODE=true returns at least 3 sample problems
   with realistic COMP9021 content (recursion, sorting, OOP topics)

7. Check WebView Content-Security-Policy:
   Confirm nonce is used in both the CSP header and all <script> tags

After all fixes, tell me:
- The exact command to start dev mode
- What to expect when pressing F5
- How to verify the sidebar loads mock problems
- How to open a problem and see the WebView panel
```

---

## 执行顺序一览

| 步骤 | Prompt | Claude Code 操作 |
|------|--------|-----------------|
| 1 | 项目脚手架 | 直接发，等所有文件创建完 |
| 2 | 类型定义 | `/clear` 后发 |
| 3 | API 服务层 | `/clear` 后发 |
| 4 | 侧边栏树 | `/clear` 后发 |
| 5 | WebView 面板 | `/clear` 后发（最长，遇到上下文满就 `/compact`）|
| 6 | 主入口 | `/clear` 后发 |
| 7 | 调试验证 | 最后发，修复所有问题 |
| — | `/init` | 每个阶段结束后运行，保持 CLAUDE.md 更新 |

---

## Claude Code 实用技巧

**每次 /clear 前，用 # 把重要决定存进记忆：**
```
# API base URL: https://api.unsw-practice.com
# 用 esbuild 不用 webpack，output 在 dist/ 目录
# MOCK_MODE=true 时返回假数据，不需要真实 API
# WebView 用 Monaco CDN，不本地安装
```

**遇到报错，直接贴进去：**
```
Fix this TypeScript error in @src/providers/ProblemWebviewProvider.ts:
[粘贴完整错误信息]
```

**引用文件比复制粘贴更高效：**
```
Looking at @src/types/index.ts and @src/services/api.ts, 
add error handling for 429 rate limit responses
```
