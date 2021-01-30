import * as vscode from 'vscode';
import { TodoRepository } from './repositories/TodoRepository';
import { CommandType } from './commands/CommandType';
import { Todo } from './entities/Todo';
import { WorkSessionRepository } from './repositories/WorkSessionRepository';
import { TodoManager } from './manager/TodoManager';
import { WorkSessionManager } from './manager/WorkSessionManager';
import { ExtensionState } from './repositories/ExtensionState';
import { StatusBar } from './ui';

export function activate(context: vscode.ExtensionContext): void {
  const statusBar = new StatusBar();
  const state: ExtensionState = {
    todos: new TodoRepository(context),
    workSession: new WorkSessionRepository(context)
  };

  const todoManager = new TodoManager(state);
  const workSessionManager = new WorkSessionManager(state);

  context.subscriptions.push(statusBar);
  statusBar.update(workSessionManager.getActiveTask());

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.CLEAR_STATE, async () => {
      await state.todos.clearState();
      await state.workSession.clearState();
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
      await workSessionManager.finishWorkSession();
      statusBar.update(workSessionManager.getActiveTask());
    })
  );
}

// this method is called when your extension is deactivated
// export function deactivate() {}
