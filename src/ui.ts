import * as vscode from 'vscode';
import { Todo } from './entities/Todo';

export class StatusBar {
  statusBarActiveTask: vscode.StatusBarItem;

  constructor() {
    this.statusBarActiveTask = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      10
    );
    this.statusBarActiveTask.color = new vscode.ThemeColor(
      'terminal.ansiBrightYellow'
    );
  }

  update(todo: Todo | undefined): void {
    if (!todo || todo.done) {
      this.statusBarActiveTask.hide();
      return;
    }

    const MAX_LENGTH = 20;
    let title = todo.title;
    let description = todo.description;

    if (todo.title.length > MAX_LENGTH) {
      title = `${todo.title.slice(0, MAX_LENGTH)}...`;
      description = todo.title;
    }

    this.statusBarActiveTask.text = `👨‍💻 Active Task: ${title}`;
    this.statusBarActiveTask.tooltip = `${description}`;
    this.statusBarActiveTask.show();
  }

  dispose(): void {
    this.statusBarActiveTask.dispose();
  }
}
