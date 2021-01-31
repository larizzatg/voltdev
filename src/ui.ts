import * as vscode from 'vscode';
import { CommandType } from './commands/CommandType';
import { Todo } from './entities/Todo';
import { WorkSession } from './entities/WorkSession';

export class StatusBar {
  statusBarActiveTask: vscode.StatusBarItem;
  statusBarSession: vscode.StatusBarItem;

  constructor() {
    this.statusBarActiveTask = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      10
    );
    this.statusBarActiveTask.color = new vscode.ThemeColor(
      'terminal.ansiBrightYellow'
    );

    this.statusBarSession = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      11
    );
  }

  updateBarActiveTask(todo: Todo | undefined): void {
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
    this.statusBarActiveTask.command =
      CommandType.WORK_SESSION_COMPLETE_ACTIVE_TASK;
    this.statusBarActiveTask.show();
  }

  updateBarSession(session: WorkSession | undefined): void {
    if (session) {
      this.statusBarSession.text = `⚡ ${session.doneTasks} / ${session.todos.size} tasks.`;
      this.statusBarSession.command = CommandType.TODO_COMPLETE;
    } else {
      this.statusBarSession.text = '⚡ Start a new work session';
      this.statusBarSession.command = CommandType.WORK_SESSION_START;
    }
    this.statusBarSession.show();
  }

  dispose(): void {
    this.statusBarActiveTask.dispose();
    this.statusBarSession.dispose();
  }
}
