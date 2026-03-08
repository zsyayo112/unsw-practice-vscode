# UNSW学习社区平台 — 完整 Vibe Coding Prompt 文档

> 适用模型：Claude / Cursor / v0.dev / ChatGPT-4o  
> 项目类型：Next.js 14 全栈应用  
> 作者定位：专业全栈工程师视角

---

## 🧠 MASTER SYSTEM PROMPT（每次对话开头都带上）

```
You are an expert senior full-stack engineer with 10+ years of experience building production-grade web applications. You specialize in Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, and developer tooling.

You are helping build a learning community platform called [平台名] targeting UNSW (University of New South Wales) students in Sydney, Australia. The platform serves as:
1. A free learning hub (course notes, wikis, course reviews)
2. An interactive coding practice module (LeetCode-style, focused on COMP9021 Python exercises)
3. A lead generation funnel for a private tutoring business offering 1-on-1, small group classes, and recorded content

Tech Stack:
- Frontend + Backend: Next.js 14 App Router (TypeScript)
- Styling: Tailwind CSS + shadcn/ui
- Database + Auth: Supabase (PostgreSQL + Row Level Security)
- Code Execution: Piston API (free, sandboxed Python runner)
- Deployment: Vercel
- Content/Wiki: MDX files or Supabase-stored Markdown

Core principles you follow:
- Write clean, production-ready TypeScript — no shortcuts
- Use server components by default, client components only when necessary
- Always consider mobile responsiveness
- Prioritize performance (lazy loading, proper caching)
- Keep the UI clean, modern, and student-friendly
- Every feature should subtly guide users toward booking a tutoring session
```

---

## 📁 PROMPT 1 — 项目初始化与目录结构

```
Based on the master system prompt above, scaffold a complete Next.js 14 project structure for the UNSW learning platform.

Requirements:
- Use App Router with TypeScript
- Set up folder structure for: landing page, course wiki section, COMP9021 practice module, course reviews page, and a contact/booking page
- Configure: Tailwind CSS, shadcn/ui, Supabase client (server + client side), environment variables template
- Create a reusable layout with: top navigation bar (logo, nav links, CTA button "Book a Free Trial"), footer with contact info and social links
- The nav should include: Home | Courses | Practice (COMP9021) | Reviews | Contact

Output:
1. Full folder/file tree
2. Key config files (next.config.ts, tailwind.config.ts, tsconfig.json)
3. Supabase client setup (lib/supabase/server.ts and lib/supabase/client.ts)
4. Root layout.tsx with nav + footer
5. .env.local.example

Make it production-ready. Use TypeScript strictly. No placeholder logic — all imports must resolve.
```

---

## 📁 PROMPT 2 — 数据库 Schema 设计

```
Design a complete Supabase PostgreSQL schema for the UNSW learning platform.

Tables needed:

1. profiles — extends Supabase auth.users
   - id (uuid, FK to auth.users)
   - display_name, avatar_url, university, year_of_study
   - created_at

2. courses — course catalog
   - id, code (e.g. "COMP9021"), name, faculty, description
   - difficulty (1-5), workload (1-5), avg_rating
   - is_featured (boolean)

3. course_reviews — student reviews
   - id, course_id (FK), user_id (FK), rating (1-5)
   - title, body (text), term (e.g. "2024 T1")
   - upvotes, created_at

4. wiki_pages — course notes/wiki
   - id, course_id (FK), slug, title, content (markdown text)
   - author_id (FK), last_edited_at, is_published

5. problems — COMP9021 practice questions
   - id, title, slug, difficulty ('easy'|'medium'|'hard')
   - topic (e.g. 'recursion', 'sorting', 'OOP')
   - description (markdown), starter_code (python), solution_code (python)
   - hints (jsonb array of strings)
   - order_index, is_published

6. test_cases — for each problem
   - id, problem_id (FK), input (text), expected_output (text)
   - is_hidden (boolean), description

7. submissions — user code submissions
   - id, user_id (FK), problem_id (FK)
   - code (text), language ('python')
   - status ('accepted'|'wrong_answer'|'runtime_error'|'time_limit')
   - runtime_ms, test_results (jsonb)
   - created_at

8. user_problem_progress
   - user_id (FK), problem_id (FK), status ('attempted'|'solved')
   - last_submitted_at, solve_count

Output:
1. Full SQL migration file (create tables, indexes, foreign keys)
2. Row Level Security (RLS) policies for each table
3. Supabase TypeScript type definitions (Database type)
4. Seed data: 5 sample COMP9021 problems across different topics
```

---

## 📁 PROMPT 3 — 首页设计

```
Build the homepage (app/page.tsx) for the UNSW learning platform.

Design direction: Clean, modern, academic-meets-tech aesthetic. Dark navy + white + yellow accent (inspired by UNSW colors but original). Use a distinctive serif display font paired with a clean sans-serif.

Sections to include:

1. HERO SECTION
   - Headline: Something like "Ace Your UNSW CS Courses" (make it punchy)
   - Subheadline: Brief value prop (free notes + practice + expert tutoring)
   - Two CTAs: "Start Practicing Free" (→ /practice) and "Book a Free Trial" (→ /contact)
   - Animated code snippet or floating course cards as visual

2. STATS BAR
   - Numbers like: "500+ Students Helped", "10+ UNSW Courses Covered", "200+ Practice Problems"

3. FEATURES SECTION (3 cards)
   - 📚 Course Notes & Wiki
   - 💻 Interactive Practice (COMP9021)
   - 🎯 Expert Tutoring

4. COMP9021 PRACTICE PREVIEW
   - Show 3 sample problems with difficulty badges
   - CTA to go to full practice module

5. COURSE REVIEWS PREVIEW
   - 2-3 testimonial cards from students
   - Link to full reviews page

6. TUTORING CTA SECTION
   - "Struggling with your assignments?" 
   - Services: 1-on-1, small group, recorded resources
   - Prominent booking button

7. FOOTER
   - Links, WeChat QR code placeholder, email contact

Technical requirements:
- Next.js server component
- Framer Motion for scroll animations (staggered reveals)
- Fully responsive (mobile-first)
- Use shadcn/ui Card, Button components
- No Lorem Ipsum — write realistic UNSW-relevant copy
```

---

## 📁 PROMPT 4 — 练题模块：题库列表页

```
Build the practice problems list page at app/practice/page.tsx for COMP9021 Python exercises.

UI Requirements (LeetCode-inspired but original design):

Layout:
- Left sidebar: filter panel
- Main area: problem list table

Filter Panel (sticky):
- Search bar (filter by title)
- Difficulty filter: All | Easy | Medium | Hard (colored badges: green/yellow/red)
- Topic filter: All | Recursion | Sorting | OOP | File I/O | Regex | Data Structures | Dynamic Programming
- Status filter (if logged in): All | Solved | Attempted | Todo

Problem List Table columns:
- Status icon (✓ solved, ~ attempted, empty)
- # (order index)
- Title (clickable link)
- Topic tags (pill badges)
- Difficulty badge
- Acceptance rate (%)

Additional features:
- Progress bar at top: "X / 50 Solved" (if logged in)
- Pagination or infinite scroll
- "Coming Soon" lock icon on unpublished problems
- A subtle banner: "Need help? Our tutors specialize in COMP9021 → Book Now"

Data fetching:
- Server component fetching from Supabase problems table
- If user is logged in, join with user_problem_progress for status
- Implement search/filter via URL search params (searchParams)

Technical:
- TypeScript, fully typed
- Loading skeleton (Suspense + loading.tsx)
- Mobile responsive (table collapses to cards on mobile)
```

---

## 📁 PROMPT 5 — 练题模块：做题界面

```
Build the individual problem solving page at app/practice/[slug]/page.tsx.

This is the core feature — make it excellent.

Layout (split panel, resizable):
LEFT PANEL — Problem Description:
- Problem title + difficulty badge + topic tags
- Tab switcher: Description | Hints | Solution (solution locked until solved or after 3 attempts)
- Problem description (rendered Markdown)
- Examples section with input/output formatting
- Constraints list
- "Discuss" link (future feature, placeholder for now)

RIGHT PANEL — Code Editor + Results:
- Top bar: language selector (Python 3.x, locked), Run button, Submit button
- Code editor: use Monaco Editor (@monaco-editor/react)
  - Default to starter_code from DB
  - Python syntax highlighting
  - Dark theme (vs-dark)
  - Auto-save to localStorage per problem
- Bottom panel (tabs): 
  - "Test Cases" tab: shows sample input/output, user can edit test inputs
  - "Results" tab: appears after running
    - Each test case: pass ✓ / fail ✗
    - Show actual vs expected output
    - Runtime in ms
    - Error message if runtime error

Submission flow:
1. User clicks "Submit"
2. POST to /api/submit with { problemId, code, language }
3. API calls Piston API to execute code against all test_cases
4. Save result to submissions table
5. Update user_problem_progress
6. Return results to client
7. Show celebration animation if all tests pass (confetti or similar)

API Route (app/api/submit/route.ts):
- Validate input
- Call Piston API: POST https://emkc.org/api/v2/piston/execute
  - language: "python", version: "3.10"
  - Run code with each test case as stdin
  - Compare stdout with expected_output (trimmed)
- Save to Supabase
- Return structured results

Technical requirements:
- Monaco Editor for code editing
- Resizable panels (use react-resizable-panels)
- Optimistic UI updates
- Full TypeScript typing
- Error handling for API failures
- Mobile: stack panels vertically
```

---

## 📁 PROMPT 6 — Piston API 代码执行服务

```
Build a robust code execution service for the platform.

Create: lib/piston.ts

Requirements:
- Function: executeCode(code: string, testCases: TestCase[]): Promise<ExecutionResult[]>
- Call Piston API (https://emkc.org/api/v2/piston/execute) for each test case
- Handle: timeout (5s per test), runtime errors, output comparison
- Normalize output: trim whitespace, handle trailing newlines
- Return structured results per test case

Types needed:
interface TestCase {
  id: string
  input: string
  expected_output: string
  is_hidden: boolean
}

interface ExecutionResult {
  test_case_id: string
  passed: boolean
  actual_output: string
  expected_output: string
  runtime_ms: number
  error?: string
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded'
}

Also handle:
- Rate limiting (add delay between calls if needed)
- Sanitize code input (reject obvious malicious patterns)
- Parallel execution with Promise.allSettled (max 5 concurrent)
- Timeout wrapper using AbortController

Write this as production-ready utility code with full error handling and JSDoc comments.
```

---

## 📁 PROMPT 7 — 课程Wiki页面

```
Build the course wiki/notes section.

Pages needed:
- app/courses/page.tsx — Course catalog grid
- app/courses/[code]/page.tsx — Course detail + wiki index
- app/courses/[code]/wiki/[slug]/page.tsx — Individual wiki page

Course Catalog page:
- Grid of course cards (code, name, difficulty stars, avg_rating, short description)
- Filter by: All | Core | Elective | Difficulty
- Each card links to course detail page
- Featured courses highlighted

Course Detail page (e.g. /courses/COMP9021):
- Course header: code, name, faculty, difficulty/workload ratings
- Tab navigation: Overview | Wiki | Reviews | Practice Problems
- Overview tab: course description, topics covered, prerequisites
- Wiki tab: list of wiki pages (grouped by topic), with last edited date
- Reviews tab: aggregate rating + individual reviews
- Practice tab: list of related problems (links to /practice)

Wiki Page:
- Clean reading experience (like Notion or GitBook)
- Render MDX/Markdown content
- Table of contents (auto-generated from headings, sticky sidebar)
- "Last edited" timestamp + author
- "Suggest an edit" button (future: GitHub-style contributions)
- Related pages section at bottom
- "Need a tutor for this course? →" CTA at bottom

Technical:
- Markdown rendering with react-markdown + syntax highlighting (rehype-highlight)
- Static generation where possible (generateStaticParams)
- Incremental Static Regeneration (revalidate: 3600)
```

---

## 📁 PROMPT 8 — 课程评价系统

```
Build the course review system.

Components needed:
- CourseRatingForm — submit a review (requires auth)
- CourseReviewCard — display a single review
- RatingBreakdown — visual rating distribution (like Amazon)

Review Form:
- Select term (2024 T1, T2, T3, 2023 T1...)
- Overall rating (1-5 stars, interactive)
- Sub-ratings: Teaching Quality, Course Difficulty, Workload, Usefulness
- Title (required, 10-100 chars)
- Body (required, 50-1000 chars, Markdown supported)
- Anonymous toggle
- Submit button with loading state

Review Display:
- Reviewer name/avatar (or "Anonymous")
- Star rating (visual)
- Term badge
- Title + body (expandable if long)
- Upvote button (one per user)
- "Helpful?" feedback

Aggregate display:
- Average rating (large, prominent)
- Star distribution bar chart
- Total review count
- Sort options: Most Recent | Most Helpful | Highest | Lowest

Data fetching:
- Server-side initial load
- Client-side for upvotes and new submissions
- Optimistic updates for upvotes

Moderation:
- Basic profanity filter on submission
- Reports system (flag button on each review)
- Admin can mark reviews as hidden (is_published = false)
```

---

## 📁 PROMPT 9 — 用户认证与个人主页

```
Implement authentication and user profile using Supabase Auth.

Auth setup:
- Email + password signup/login
- Google OAuth (optional, add if easy)
- Protected routes middleware (middleware.ts)
- Redirect unauthenticated users trying to submit code

Pages:
- app/auth/login/page.tsx — Clean login form
- app/auth/signup/page.tsx — Signup with: email, password, display name, UNSW student year
- app/profile/page.tsx — User dashboard

Profile Dashboard:
- Header: avatar, display name, "UNSW Computer Science | Year X"
- Stats cards: Problems Solved, Acceptance Rate, Reviews Written, Days Active
- Progress section: 
  - Problems by topic (radar chart or progress bars)
  - Recent submissions list (problem title, status, time)
  - Solved problems grid (GitHub contribution graph style)
- Settings tab: update display name, avatar, notification preferences

Middleware (middleware.ts):
- Protect: /profile, /practice/[slug] submit action
- Public: homepage, course catalog, wiki pages (read-only)
- Refresh session tokens properly

Use Supabase SSR package (@supabase/ssr) for server-side auth.
All auth state managed via Supabase — no custom JWT logic needed.
```

---

## 📁 PROMPT 10 — 管理后台（题目管理）

```
Build a simple admin panel for managing practice problems.

Route: /admin (protected, admin role only — check profiles.role = 'admin')

Pages:
- /admin — Dashboard with stats (total problems, submissions today, active users)
- /admin/problems — Problems management table
- /admin/problems/new — Create new problem
- /admin/problems/[id]/edit — Edit existing problem

Problem Editor (most important):
- Form fields:
  - Title, Slug (auto-generated from title, editable)
  - Difficulty selector (Easy/Medium/Hard)
  - Topic multi-select
  - Description editor (full Markdown editor with preview — use @uiw/react-md-editor)
  - Starter Code editor (Monaco, Python)
  - Solution Code editor (Monaco, Python, hidden from students)
  - Hints (dynamic list, add/remove)
  - Order Index (drag to reorder in list)
  - Published toggle

Test Cases manager:
  - Table of test cases (input | expected output | hidden | actions)
  - Add new test case button
  - "Run Solution Against All Tests" button to verify
  - Import test cases from JSON file

Bulk import feature:
  - Upload a Python file following a specific format (see format below)
  - Parser extracts: docstring → description, function signature → starter code, test cases from assert statements
  - Preview parsed result before saving

Python file format for import:
"""
TITLE: Two Sum
DIFFICULTY: easy  
TOPIC: data-structures
DESCRIPTION:
Given a list of numbers and a target...
"""
def two_sum(nums, target):
    pass  # starter code

# TEST CASES
assert two_sum([2,7,11,15], 9) == [0,1]
assert two_sum([3,2,4], 6) == [1,2]
```

---

## 📁 PROMPT 11 — 联系/预约页面

```
Build the contact/booking page at app/contact/page.tsx.

This is the key conversion page — make it high-trust and professional.

Sections:

1. HERO
   - "Get Expert Help With Your UNSW CS Courses"
   - Subtext about success rate / students helped

2. SERVICE CARDS (3 options, each with CTA)
   - 1-on-1 Tutoring: "Personalized sessions tailored to your exact needs"
     → Book via Calendly embed or a simple booking form
   - Small Group Class: "Learn with peers, scheduled weekly online"
     → Show next available session dates
   - Recorded Resources: "Self-paced video lessons and notes"
     → "View Packages" button

3. CONTACT FORM
   Fields: Name, Email, Student ID (optional), Course(s) of interest (multi-select), 
   Message, How did you hear about us?
   - On submit: POST to /api/contact → sends email via Resend API
   - Success state: confirmation message with WeChat QR code

4. SOCIAL PROOF
   - "Join 500+ UNSW students" 
   - 4-5 short testimonials with star ratings

5. FAQ SECTION
   - Common questions about tutoring, pricing approach, scheduling

6. CONTACT DETAILS
   - Email, WeChat ID, response time promise ("We reply within 2 hours")
   - WeChat QR code image placeholder

Technical:
- React Hook Form + Zod validation
- API route for form submission using Resend (email service)
- Calendly widget embed option
```

---

## 📁 PROMPT 12 — VSCode 插件

```
Build a VSCode extension that integrates with the UNSW learning platform.

Extension name: "UNSW Practice" (publisher: your-handle)

Core features:

1. PROBLEM BROWSER (TreeView in sidebar)
   - Fetch problems from platform API (GET /api/problems)
   - Display as tree: grouped by topic → problems list
   - Color-coded by status: ✓ green (solved), ~ yellow (attempted), white (unsolved)
   - Click problem → opens problem in WebView panel

2. PROBLEM WEBVIEW PANEL
   - Left: problem description (rendered HTML from Markdown)
   - Instructions to solve in the editor
   - "Open Starter Code" button → creates temp .py file in workspace

3. CODE SUBMISSION
   - Command: "UNSW Practice: Submit Current File"
   - Reads active editor content
   - POST to platform API /api/submit with user's JWT token
   - Show results in output panel or notification
   - Update problem status in TreeView

4. AUTHENTICATION
   - Command: "UNSW Practice: Login"
   - Opens browser to platform login page with OAuth callback
   - Stores JWT in VSCode SecretStorage (never in settings)

5. STATUS BAR
   - Shows: "UNSW Practice: X/50 solved" in bottom status bar
   - Click → opens problem browser

Extension structure:
src/
├── extension.ts (activate/deactivate)
├── providers/
│   ├── ProblemTreeProvider.ts (TreeDataProvider)
│   └── ProblemWebviewProvider.ts
├── commands/
│   ├── submitCode.ts
│   └── openProblem.ts
├── services/
│   ├── api.ts (fetch wrapper for platform API)
│   └── auth.ts (token management)
└── types.ts

Use:
- vscode API (built-in, no import needed)
- node-fetch for API calls
- package.json with correct contributes (commands, views, keybindings)

Output the complete extension code, package.json, and tsconfig.json.
```

---

## 📁 PROMPT 13 — Python题目批量导入脚本

```
Write a Node.js/Python script to bulk import COMP9021 practice problems from .py files into the Supabase database.

The .py files follow this general pattern (based on UNSW COMP9021 assignments):
- Module docstring contains the problem description
- Functions are defined with docstrings explaining expected behavior
- Test cases are in if __name__ == '__main__': block using assert statements or print comparisons

Script requirements (Python preferred):

1. PARSER FUNCTION
   Input: .py file content
   Extract:
   - Problem title (from filename or first line of docstring)
   - Description (module/function docstring)
   - Starter code (function signatures with pass body, remove implementation)
   - Solution code (original function implementations)
   - Test cases (parse assert statements → input/expected_output pairs)
   - Topics (infer from keywords: 'sort', 'recur', 'class', 'regex', 'file', etc.)
   - Difficulty (heuristic: lines of solution code, nested loops, recursion depth)

2. BATCH PROCESSOR
   - Read all .py files from a given directory
   - Parse each file
   - Show preview of parsed result
   - Confirm before inserting
   - Insert into Supabase problems + test_cases tables via Supabase Python client

3. STARTER CODE GENERATOR
   - Remove function bodies (replace with 'pass')
   - Keep: function signatures, docstrings, imports
   - Remove: implementation logic, solution-revealing variable names

4. DIFFICULTY HEURISTIC
   easy: < 15 lines solution, no recursion, single function
   medium: 15-40 lines, or uses recursion, or 2+ functions  
   hard: 40+ lines, or complex algorithms, or multiple classes

Output:
- Complete Python script (import_problems.py)
- Requirements: supabase-py, ast (stdlib)
- Usage instructions
- Example of expected .py file format
```

---

## 📁 PROMPT 14 — SEO与性能优化

```
Optimize the UNSW learning platform for SEO and performance.

1. METADATA (app/layout.tsx + individual pages)
   - Default metadata: title template, description, OpenGraph, Twitter cards
   - Dynamic metadata for: course pages, wiki pages, problem pages
   - Structured data (JSON-LD): WebSite, Course, FAQPage schemas
   - Sitemap generation (app/sitemap.ts)
   - robots.txt (app/robots.ts)

2. PERFORMANCE
   - Image optimization: use next/image everywhere, proper sizes
   - Font optimization: next/font with preload
   - Bundle analysis: @next/bundle-analyzer config
   - Code splitting: dynamic imports for Monaco Editor, heavy components
   - API response caching: proper Cache-Control headers on API routes
   - Supabase query optimization: proper indexes (already in schema), select only needed columns

3. ANALYTICS
   - Vercel Analytics (add @vercel/analytics)
   - Custom events: problem_solved, page_view, contact_form_submit, booking_click
   - Track conversion funnel: practice → contact page → form submit

4. SOCIAL SHARING
   - Dynamic OG images using @vercel/og
   - Route: /api/og?title=...&type=problem|course|wiki
   - Generates branded image with: platform logo, title, difficulty/type badge

Provide:
- Complete metadata configuration
- Dynamic OG image route
- Sitemap implementation
- Performance checklist with specific Next.js optimizations applied
```

---

## 🚀 DEPLOYMENT PROMPT

```
Provide complete deployment instructions for the UNSW learning platform.

Environment: Vercel (frontend + API) + Supabase (database + auth)

1. ENVIRONMENT VARIABLES
   List all required env vars with descriptions:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - RESEND_API_KEY (contact form emails)
   - NEXT_PUBLIC_SITE_URL
   - PISTON_API_URL (default: https://emkc.org/api/v2/piston)

2. SUPABASE SETUP CHECKLIST
   - Enable Email auth
   - Configure OAuth providers
   - Run migration SQL
   - Set up RLS policies
   - Configure Storage bucket for avatars

3. VERCEL DEPLOYMENT
   - vercel.json configuration
   - Build settings
   - Domain setup
   - Edge function regions (prefer Sydney: syd1)

4. POST-DEPLOYMENT
   - Smoke test checklist (10 key flows to verify)
   - Monitoring setup (Vercel logs + Supabase dashboard)
   - Error tracking (Sentry integration — optional)

5. CI/CD
   - GitHub Actions workflow for: lint, type-check, deploy preview on PR, deploy main to production
```

---

## 💡 使用建议

### 开始顺序（推荐）
1. 先用 **MASTER SYSTEM PROMPT** 作为所有对话的开头
2. 按顺序执行：**PROMPT 2（数据库）→ PROMPT 1（项目初始化）→ PROMPT 3（首页）→ PROMPT 5（做题界面）**
3. 有了核心功能后再做：课程Wiki、评价系统、管理后台
4. 最后：SEO优化、VSCode插件

### Vibe Coding 技巧
- 每次只让 AI 做一个文件/功能，不要一次性要太多
- 生成后立即运行，报错就贴回去让它修
- 用 Cursor 的话，开 `Composer` 模式效果最好
- 数据库改动先在 Supabase Dashboard 测试，再更新代码

### 工具推荐
- **v0.dev** — 快速原型 UI 组件
- **Cursor** — 主要 vibe coding 工具
- **Supabase Studio** — 可视化管理数据库
- **Vercel** — 一键部署，每个 PR 自动生成预览链接
