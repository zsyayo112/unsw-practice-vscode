# UNSW Practice — VSCode Extension

> A free in-editor coding practice platform for UNSW COMP9021 (Principles of Programming) students.
>
> 面向 UNSW COMP9021（Python编程原理）学生的免费 VSCode 插件练题平台。

---

## 简介 | Introduction

**中文：** UNSW Practice 是一款专为 UNSW COMP9021 学生设计的 VSCode 插件。无需离开编辑器即可浏览题目、编写 Python 代码、一键运行并提交，立即查看评测结果。

**English：** UNSW Practice is a VSCode extension designed for UNSW COMP9021 students. Browse problems, write Python code, run and submit — all without leaving your editor.

---

## 功能特性 | Features

- **题目列表** — 按难度（Easy / Medium / Hard）分组，侧边栏直接显示
- **Monaco 代码编辑器** — 与 VSCode 同款编辑器，支持语法高亮、自动缩进
- **一键运行** — 快速用第一个示例用例测试代码
- **一键提交** — 对所有测试用例批量评测，显示每条用例的通过状态
- **实时结果反馈** — 显示期望输出 vs 实际输出，错误信息一目了然
- **自动保存** — 编辑器内容本地自动保存，关闭面板后重开不丢失
- **完成进度** — 底部状态栏实时显示 `X/Y solved`

---

## 安装方法 | Installation

### 从 VSCode Marketplace 安装（推荐）

1. 打开 VSCode
2. 按 `Ctrl+Shift+X`（Mac：`Cmd+Shift+X`）打开扩展面板
3. 搜索 `UNSW Practice`
4. 点击 **Install**

### From VSCode Marketplace (Recommended)

1. Open VSCode
2. Press `Ctrl+Shift+X` (Mac: `Cmd+Shift+X`) to open the Extensions panel
3. Search for `UNSW Practice`
4. Click **Install**

---

## 使用方法 | Usage

**中文步骤：**

1. 安装插件后，左侧活动栏会出现 **UNSW Practice** 图标（书本图标）
2. 点击图标展开题目列表，题目按难度分组
3. 点击任意题目，右侧会打开做题面板
4. 在 Monaco 编辑器中编写你的 Python 代码
5. 点击 **▶ Run** 按钮，用第一个示例用例快速验证
6. 点击 **↑ Submit** 按钮，对所有测试用例评测
7. 查看结果面板，绿色 ✓ 代表通过，红色 ✗ 代表失败
8. 点击 **↺ Reset** 按钮恢复初始代码模板
9. 底部状态栏（`📖 UNSW: X/Y solved`）显示整体完成进度，点击可刷新题目列表

**English Steps:**

1. After installation, a **UNSW Practice** icon (book) appears in the left Activity Bar
2. Click it to expand the problem list, grouped by difficulty
3. Click any problem to open the solving panel on the right
4. Write your Python code in the Monaco editor
5. Click **▶ Run** to quickly test with the first example case
6. Click **↑ Submit** to run all test cases
7. Check the result panel — green ✓ means passed, red ✗ means failed
8. Click **↺ Reset** to restore the starter code template
9. The status bar (`📖 UNSW: X/Y solved`) shows overall progress; click to refresh

---

## 支持的题目类型 | Problem Types

- **函数题** — 实现一个函数，例如 `def fib(n: int) -> int`
- **类设计题** — 设计并实现一个类，例如 `class Stack` / `class BankAccount`

---

## 代码执行说明 | How Code Execution Works

代码运行和提交通过 **Judge0 CE**（`https://ce.judge0.com`）执行，语言为 Python 3.8。代码在插件后端运行，不在你的本地机器上执行。

Code is executed via **Judge0 CE** (`https://ce.judge0.com`) using Python 3.8. Execution happens in the extension host process, not on your local machine.

---

## 常见问题 | FAQ

**Q: Run 按钮没有反应？**
A: 检查网络连接。代码评测依赖 Judge0 CE 公共 API，需要能访问境外网络。如果持续无响应，尝试点击状态栏刷新图标重试。

**Q: Run button doesn't respond?**
A: Check your internet connection. Code execution relies on the Judge0 CE public API (overseas server). If it keeps failing, click the status bar to refresh and try again.

---

**Q: 题目加载失败？**
A: 侧边栏会显示 "⚠ Failed to load — click Refresh"。点击工具栏的刷新按钮，或点击底部状态栏重新加载。如问题持续，请检查网络连接。

**Q: Problems fail to load?**
A: The sidebar shows "⚠ Failed to load — click Refresh". Click the refresh button in the toolbar or click the status bar item. If the issue persists, check your internet connection.

---

**Q: 编辑器没有出现 / Monaco 编辑器加载失败？**
A: Monaco 编辑器从 CDN 加载，需要网络连接。刷新 WebView（关闭面板后重新点击题目）或检查网络后重试。

**Q: The editor doesn't appear / Monaco fails to load?**
A: Monaco Editor is loaded from CDN and requires internet access. Close the panel, reopen the problem, and check your connection.

---

**Q: 我的代码会保存吗？**
A: 每道题的代码自动保存在浏览器 localStorage 中，关闭 VSCode 后下次打开仍然保留。点击 Reset 会清除保存内容并还原初始模板。

**Q: Is my code saved?**
A: Each problem's code is auto-saved in localStorage. It persists across VSCode restarts. Clicking Reset clears the save and restores the starter template.

---

## 反馈与联系 | Feedback & Contact

如有 bug 反馈或题目建议，请联系：

For bug reports or problem suggestions, please contact:

> *(联系方式待补充 / Contact info TBD)*

---

## 开发者信息 | Developer Info

| 项目 | 详情 |
|------|------|
| 技术栈 | TypeScript, VSCode Extension API, Monaco Editor (`0.52.0`), Judge0 CE |
| 后端 | Next.js + Supabase，部署于 Vercel |
| 代码执行 | Judge0 CE（Python 3.8，`language_id: 71`） |
| 构建工具 | esbuild（双 target：Node CJS + IIFE browser bundle） |

**Build commands:**

```bash
npm run build        # Production build
npm run watch        # Dev mode with auto-rebuild
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
```
