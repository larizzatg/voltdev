import * as vscode from 'vscode';
import { TodoRepository } from './repositories/TodoRepository';
import { CommandType } from './commands/CommandType';
import { Todo } from './entities/Todo';
import { WorkSessionRepository } from './repositories/WorkSessionRepository';
import { TodoManager } from './managers/TodoManager';
import { WorkSessionManager } from './managers/WorkSessionManager';
import { ExtensionState } from './repositories/ExtensionState';
import { StatusBar } from './ui';
import { StackOverflowManager } from './managers/StackOverflowManager';

export function activate(context: vscode.ExtensionContext): void {
  const statusBar = new StatusBar();
  const state: ExtensionState = {
    todos: new TodoRepository(context),
    workSession: new WorkSessionRepository(context)
  };

  const todoManager = new TodoManager(state);
  const workSessionManager = new WorkSessionManager(state);
  const stackOverflowManager = new StackOverflowManager();

  context.subscriptions.push(statusBar);
  statusBar.update(workSessionManager.getActiveTask());

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.CLEAR_STATE, async () => {
      await state.todos.clearState();
      await state.workSession.clearState();
      await state.workSession.clearAnalytics();
      await vscode.window.showInformationMessage('Cleared state');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_NEW, () =>
      todoManager.createTodo()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_EDIT, () =>
      todoManager.editTodo()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_COMPLETE, async () => {
      todoManager.completeTodo();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_DELETE, async () => {
      await todoManager.deleteTodo();
      statusBar.update(workSessionManager.getActiveTask());
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.WORK_SESSION_START, () => {
      workSessionManager.startWorkSession();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.WORK_SESSION_ADD_TASKS, () => {
      return workSessionManager.addTasks();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.WORK_SESSION_SET_MIT, () => {
      return workSessionManager.setMostImportantTask();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandType.WORK_SESSION_SET_ACTIVE_TASK,
      async (): Promise<Todo | undefined> => {
        const todo = await workSessionManager.setActiveTask();
        statusBar.update(workSessionManager.getActiveTask());
        return todo;
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.WORK_SESSION_END, async () => {
      const analytics = await workSessionManager.finishWorkSession();
      console.log(analytics);
      statusBar.update(workSessionManager.getActiveTask());
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.STACK_OVERFLOW_SEARCH, () => {
      stackOverflowManager.searchInBrowser();
    })
  );
}

// this method is called when your extension is deactivated
// export function deactivate() {}
