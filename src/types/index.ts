// ── Constants ─────────────────────────────────────────────────────────────────

/** VSCode extension identifier, matches package.json "name". */
export const EXTENSION_ID = 'unsw-practice';

/** Key used to store the auth token in VSCode SecretStorage. */
export const SECRET_KEY = 'unsw-practice.authToken';

// ── Enums ─────────────────────────────────────────────────────────────────────

/** Difficulty levels for problems. */
export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

/** Possible outcomes of a code submission. */
export enum SubmissionStatus {
  Accepted = 'accepted',
  WrongAnswer = 'wrong_answer',
  RuntimeError = 'runtime_error',
  TimeLimitExceeded = 'time_limit_exceeded',
}

// ── Core domain interfaces ────────────────────────────────────────────────────

/**
 * A single test case: the code snippet to append after the student's code
 * and the exact stdout it must produce.
 */
export interface TestCase {
  /** Python snippet appended after student's code (e.g. a print call). */
  input: string;
  /** The exact stdout string the code must produce. */
  expectedOutput: string;
}

/**
 * A practice problem from the UNSW problem bank.
 * `course_id` is implicit via the API route; `orderIndex` controls list order.
 */
export interface Problem {
  /** UUID primary key. */
  id: string;
  /** URL-safe slug, e.g. "two-sum". */
  slug: string;
  /** Human-readable title shown in the sidebar. */
  title: string;
  /** Difficulty tier of the problem. */
  difficulty: Difficulty;
  /** Topic tags, e.g. ["recursion", "dict"]. */
  topics: string[];
  /** Markdown-formatted problem statement. */
  description: string;
  /** Python starter code shown in the Monaco editor. */
  starterCode: string;
  /** Optional hints shown progressively to the student. */
  hints: string[];
  /** Percentage of correct first submissions (0–100). */
  acceptanceRate: number;
  /** 1-based display order within the problem list. */
  orderIndex: number;
  /** False hides the problem from the student-facing list. */
  isPublished: boolean;
  /** Test cases used for run / submit. Populated in mock mode; fetched server-side in Phase 2+. */
  testCases: TestCase[];
}

/**
 * Per-user progress record for a single problem.
 * Stored client-side in Phase 1; synced to backend in Phase 2+.
 */
export interface UserProgress {
  /** Foreign key → Problem.id. */
  problemId: string;
  /** Coarse-grained solve state. */
  status: 'unsolved' | 'attempted' | 'solved';
  /** Number of times the student has reached "accepted". */
  solveCount: number;
  /** ISO-8601 timestamp of the most recent submission, if any. */
  lastSubmittedAt?: string;
}

/** Result of running student code against a single test case. */
export interface TestResult {
  /** Whether the test case passed. */
  passed: boolean;
  /** The input snippet appended after the student's code. */
  input: string;
  /** The exact stdout string the code must produce. */
  expectedOutput: string;
  /** The actual stdout produced by the student's code. */
  actualOutput: string;
  /** Stderr / exception message when a runtime error occurred. */
  error?: string;
}

/**
 * Aggregate result returned after submitting code against all test cases.
 * Maps 1-to-1 with the Piston API response envelope.
 */
export interface SubmissionResult {
  /** Overall submission verdict. */
  status: SubmissionStatus;
  /** Per-test-case breakdown. */
  testResults: TestResult[];
  /** Wall-clock execution time in milliseconds. */
  runtimeMs: number;
  /** Optional human-readable message (e.g. error details). */
  message?: string;
}

// ── API envelope ──────────────────────────────────────────────────────────────

/**
 * Generic versioned API response envelope (`/api/v1/`).
 * `error` is present only on failure; `data` is always typed.
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Authentication state held in memory by `auth.ts`.
 * Phase 1: always `isAuthenticated: false`.
 * Phase 2+: populated via Supabase Auth.
 */
export interface AuthState {
  /** Whether the user has a valid session. */
  isAuthenticated: boolean;
  /** JWT bearer token, present only when authenticated. */
  token?: string;
  /** Authenticated user profile. */
  user?: {
    /** UUID from Supabase Auth. */
    id: string;
    /** Display name shown in the UI. */
    displayName: string;
    /** Primary email address. */
    email: string;
  };
}

// ── Extension configuration ───────────────────────────────────────────────────

/**
 * User-configurable extension settings (contributed via `contributes.configuration`).
 * Mirrors the keys under `unsw-practice.*` in package.json.
 */
export interface ExtensionConfig {
  /** Base URL for the UNSW Practice API, e.g. "https://api.unsw-practice.com/api/v1". */
  apiBaseUrl: string;
  /** Whether to auto-save the editor content on every keystroke. */
  autoSave: boolean;
}

// ── Extension ↔ WebView message bus ──────────────────────────────────────────

/** Messages sent FROM the extension TO the webview. */
export type ExtensionMessage =
  | { type: 'load-problem'; problem: Problem }
  | { type: 'run-result'; result: TestResult }
  | { type: 'submit-result'; result: SubmissionResult }
  | { type: 'loading'; isLoading: boolean };

/** Messages sent FROM the webview TO the extension. */
export type WebviewMessage =
  | { type: 'run-code'; code: string; input: string; expectedOutput: string }
  | { type: 'submit-code'; code: string }
  | { type: 'ready' };
