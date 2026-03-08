import * as vscode from 'vscode';
import type { Problem } from '../types/index';
import { Difficulty } from '../types/index';
import { fetchProblems } from '../services/api';

/** A single row in the Problems tree view. */
export class ProblemItem extends vscode.TreeItem {
  constructor(public readonly problem: Problem) {
    super(problem.title, vscode.TreeItemCollapsibleState.None);

    this.description = problem.difficulty;
    this.tooltip = `${problem.title} — ${problem.difficulty}`;
    this.contextValue = 'problem';
    this.command = {
      command: 'unsw-practice.openProblem',
      title: 'Open Problem',
      arguments: [problem.id],
    };

    const iconMap: Record<Difficulty, vscode.ThemeIcon> = {
      [Difficulty.Easy]: new vscode.ThemeIcon(
        'circle-filled',
        new vscode.ThemeColor('charts.green'),
      ),
      [Difficulty.Medium]: new vscode.ThemeIcon(
        'circle-filled',
        new vscode.ThemeColor('charts.yellow'),
      ),
      [Difficulty.Hard]: new vscode.ThemeIcon(
        'circle-filled',
        new vscode.ThemeColor('charts.red'),
      ),
    };
    this.iconPath = iconMap[problem.difficulty];
  }
}

/**
 * Provides the "Problems" tree view in the UNSW Practice activity bar panel.
 * Fetches problems from the API and re-renders on refresh.
 */
export class ProblemTreeProvider implements vscode.TreeDataProvider<ProblemItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<
    ProblemItem | undefined | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private problems: Problem[] = [];
  private loaded = false;

  /**
   * Reload the problem list from the API and redraw the tree.
   */
  async refresh(): Promise<void> {
    try {
      this.problems = await fetchProblems();
      this.loaded = true;
      this._onDidChangeTreeData.fire();
    } catch (error) {
      vscode.window.showErrorMessage(
        `UNSW Practice: Failed to load problems — ${String(error)}`,
      );
    }
  }

  /** Required by TreeDataProvider — returns the item itself. */
  getTreeItem(element: ProblemItem): vscode.TreeItem {
    return element;
  }

  /** Returns root-level children (problems). Lazy-loads on first call. */
  async getChildren(): Promise<ProblemItem[]> {
    if (!this.loaded) {
      await this.refresh();
    }
    return this.problems.map((p) => new ProblemItem(p));
  }
}
