Create a CLAUDE.md file in the project root with the following content.
This file will be auto-loaded every session.

# UNSW Practice — VSCode Extension

## 项目背景
这是一个面向 UNSW（新南威尔士大学）CS 学生的 VSCode 插件。
目标用户：COMP9021（Python编程原理）课程的学生，以中国留学生为主。
商业目标：为一个私人补课机构引流，插件本身完全免费。

## 产品定位
让 COMP9021 练题体验比任何地方都好。
题目 100% 对应 UNSW 课程内容，不是通用算法题。
学生在 VSCode 里写代码，零切换成本直接刷题。

## 当前阶段：MVP（阶段一）
只做核心功能，范围严格控制：
✅ 做：题目列表、做题面板、代码运行、Mock数据
❌ 不做：用户登录、云端同步、排行榜、多语言

## 技术约束
- 打包：esbuild（不用 webpack）
- 编辑器：Monaco Editor via CDN（不打包进插件）
- 代码执行：Piston API（免费沙箱，3秒超时保护）
- 密钥存储：VSCode SecretStorage（不用 workspace config）
- 后端：Next.js + Supabase（阶段一用 MOCK_MODE 绕过）
- TypeScript strict 模式，零 any，零 TODO

## 关键目录
- src/extension.ts     → 入口，只做组装，不写业务逻辑
- src/types/index.ts   → 所有接口定义，唯一数据契约
- src/services/        → api.ts 和 auth.ts，无 VSCode 依赖
- src/providers/       → TreeView 和 WebView
- media/               → WebView 前端（CSS + JS）

## 构建命令
- npm run build        → 生产构建
- npm run watch        → 开发模式（文件变化自动重建）
- npx tsc --noEmit     → 类型检查
- F5                   → 启动 Extension Development Host 调试

## 代码规范
- 所有函数必须有 JSDoc 注释
- 错误必须用 vscode.window.showErrorMessage 展示给用户
- 所有 disposable 必须 push 到 context.subscriptions
- WebView 必须有 nonce 和 CSP header



## 产品演进路径（技术决策必须考虑）

### 三个阶段

阶段一（当前）：VSCode 插件 MVP
  - 核心功能：COMP9021 练题
  - 用户身份：无（本地存储）
  - 数据范围：COMP9021 题库

阶段二（3-6个月后）：网页版 + 账号体系
  - 新增：用户注册/登录（Supabase Auth）
  - 新增：进度云端同步
  - 新增：网页版练题界面（复用同一套 API）
  - 插件和网页共享同一个后端

阶段三（6-12个月后）：UNSW 学习社区
  - 新增：多课程支持（不只 COMP9021）
  - 新增：课程 Wiki / 笔记
  - 新增：课程评价系统
  - 新增：用户贡献内容（UGC）

### 对当前开发的约束

基于以上演进路径，现在写的每一行代码需要满足：

1. API 设计用 REST 规范 + 版本化（/api/v1/）
   原因：阶段二网页版和插件共用同一套 API

2. 数据库 Schema 预留扩展字段
   - problems 表用 course_id 外键，不写死课程名
   - 进度相关数据预留 user_id 字段（现在可为空）
   原因：阶段二加用户体系时数据无缝迁移

3. 业务逻辑全部在后端 API，插件只是客户端
   原因：阶段二网页版复用后端，零重写

4. 组件和样式不要 VSCode 强依赖
   WebView 的 UI 逻辑尽量和 VSCode API 解耦
   原因：阶段二部分 UI 组件可以迁移到网页版

5. 但不要过度设计
   现在不需要实现阶段二三的功能
   只需要数据结构和接口设计不挡路
   遇到选择时：选扩展性好的简单方案，不选复杂方案
```

---

## 加了这个之后的效果

Claude Code 在做每个决策时会自动权衡：
```
场景：设计题目存储方式

没有演进路径：
  直接用 JSON 文件存题目，简单快速
  → 阶段二要迁移数据库，大改

有演进路径：
  用 Supabase 存题目，但 problems 表加 course_id 字段
  MOCK_MODE 时返回假数据绕过数据库
  → 阶段二直接用，不需要迁移
```
```
场景：API 路由命名

没有演进路径：
  /problems（随意）

有演进路径：
  /api/v1/problems（版本化）
  → 以后改接口可以出 v2，不破坏老版本