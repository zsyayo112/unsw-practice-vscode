import * as vscode from 'vscode';
import type { Problem, UserProgress } from '../types/index';
import { Difficulty } from '../types/index';

type ProgressStatus = 'unsolved' | 'attempted' | 'solved';

const DIFFICULTY_PREFIX: Record<Difficulty, string> = {
  [Difficulty.Easy]: '[E]',
  [Difficulty.Medium]: '[M]',
  [Difficulty.Hard]: '[H]',
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  [Difficulty.Easy]: '🟢 Easy',
  [Difficulty.Medium]: '🟡 Medium',
  [Difficulty.Hard]: '🔴 Hard',
};

/** A single problem row in the tree. */
export class ProblemTreeItem extends vscode.TreeItem {
  readonly status: ProgressStatus;

  constructor(
    public readonly problem: Problem,
    status: ProgressStatus,
  ) {
    super(
      `${DIFFICULTY_PREFIX[problem.difficulty]} #${problem.orderIndex}  ${problem.title}`,
      vscode.TreeItemCollapsibleState.None,
    );
    this.status = status;
    this.description = problem.topics.join(' · ');
    this.tooltip = problem.description.slice(0, 120);
    this.contextValue = 'problem';
    this.command = {
      command: 'unsw-practice.openProblem',
      title: 'Open Problem',
      arguments: [problem.slug],
    };

    const iconMap: Record<ProgressStatus, vscode.ThemeIcon> = {
      solved: new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed')),
      attempted: new vscode.ThemeIcon(
        'circle-large-outline',
        new vscode.ThemeColor('charts.yellow'),
      ),
      unsolved: new vscode.ThemeIcon('circle-outline'),
    };
    this.iconPath = iconMap[status];
  }
}

/** A collapsible difficulty group (Easy / Medium / Hard). */
export class GroupItem extends vscode.TreeItem {
  readonly children: ProblemTreeItem[];

  constructor(difficulty: Difficulty, children: ProblemTreeItem[]) {
    const solvedCount = children.filter((c) => c.status === 'solved').length;
    super(
      `${DIFFICULTY_LABEL[difficulty]} (${solvedCount} solved / ${children.length} total)`,
      vscode.TreeItemCollapsibleState.Expanded,
    );
    this.children = children;
    this.contextValue = 'group';
  }
}

/** Placeholder shown while loading or on error. */
class StatusItem extends vscode.TreeItem {
  constructor(kind: 'loading' | 'error') {
    if (kind === 'loading') {
      super('Loading problems...', vscode.TreeItemCollapsibleState.None);
      this.iconPath = new vscode.ThemeIcon('loading~spin');
    } else {
      super('⚠ Failed to load — click Refresh', vscode.TreeItemCollapsibleState.None);
    }
  }
}

type TreeNode = GroupItem | ProblemTreeItem | StatusItem;

/**
 * Provides the "Problems" tree view in the UNSW Practice activity bar panel.
 * Data is pushed in via setProblems(); does not fetch on its own.
 */
export class ProblemTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<TreeNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private problems: Problem[] = [];
  private progressMap = new Map<string, ProgressStatus>();
  private state: 'loading' | 'error' | 'loaded' = 'loading';
  private topicFilter: string | null = null;
  private difficultyFilter: Difficulty | null = null;
  private searchQuery = '';

  /** Fire a tree refresh without changing data (e.g. triggered by the Refresh button). */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /** Push new problem + progress data and redraw the tree. */
  setProblems(problems: Problem[], progress: UserProgress[]): void {
    this.problems = problems;
    this.progressMap = new Map(progress.map((p) => [p.problemId, p.status]));
    this.state = 'loaded';
    this._onDidChangeTreeData.fire();
  }

  /** Switch to error state and redraw. */
  setError(): void {
    this.state = 'error';
    this._onDidChangeTreeData.fire();
  }

  filterByTopic(topic: string | null): void {
    this.topicFilter = topic;
    this._onDidChangeTreeData.fire();
  }

  filterByDifficulty(d: Difficulty | null): void {
    this.difficultyFilter = d;
    this._onDidChangeTreeData.fire();
  }

  search(query: string): void {
    this.searchQuery = query;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (element instanceof GroupItem) {
      return element.children;
    }
    if (element instanceof ProblemTreeItem || element instanceof StatusItem) {
      return [];
    }

    // Root level
    if (this.state === 'loading') {
      return [new StatusItem('loading')];
    }
    if (this.state === 'error') {
      return [new StatusItem('error')];
    }

    let filtered = this.problems.filter((p) => p.isPublished);

    const topic = this.topicFilter;
    if (topic !== null) {
      filtered = filtered.filter((p) => p.topics.includes(topic));
    }

    const q = this.searchQuery.toLowerCase();
    if (q) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
    }

    const difficulties =
      this.difficultyFilter !== null
        ? [this.difficultyFilter]
        : [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];

    return difficulties.map((diff) => {
      const items = filtered
        .filter((p) => p.difficulty === diff)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((p) => new ProblemTreeItem(p, this.progressMap.get(p.id) ?? 'unsolved'));
      return new GroupItem(diff, items);
    });
  }
}
