/** Difficulty levels for problems. */
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** A single test case: the code snippet to run and the expected stdout. */
export interface TestCase {
  /** Python snippet appended after the student's code (e.g. a print call). */
  input: string;
  /** The exact stdout string the code must produce. */
  expected_output: string;
}

/**
 * A practice problem from the UNSW Practice problem bank.
 * course_id is a foreign key — supports multi-course expansion in Phase 2+.
 */
export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  /** Foreign key to the courses table. Currently always "comp9021". */
  course_id: string;
  /** Markdown-formatted problem description. */
  description: string;
  /** Python starter code shown in the editor. */
  starter_code: string;
  test_cases: TestCase[];
  tags: string[];
}

/** Result of running student code against one test case via Piston API. */
export interface RunResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  passed: boolean;
}

/** Aggregate result of submitting against all test cases. */
export interface SubmitResult {
  passed: number;
  total: number;
  results: RunResult[];
}

/**
 * Authenticated user.
 * Phase 1: unused (no login). Phase 2+: populated via Supabase Auth.
 */
export interface User {
  id: string;
  email: string;
}

/** Generic versioned API response envelope (/api/v1/). */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ── Typed message bus between extension host ↔ WebView ──────────────────────

/** Messages sent FROM the extension TO the webview. */
export type ExtensionMessage =
  | { type: 'load-problem'; problem: Problem }
  | { type: 'run-result'; result: RunResult }
  | { type: 'submit-result'; result: SubmitResult }
  | { type: 'loading'; isLoading: boolean };

/** Messages sent FROM the webview TO the extension. */
export type WebviewMessage =
  | { type: 'run-code'; code: string; testCase: TestCase }
  | { type: 'submit-code'; code: string }
  | { type: 'ready' };
