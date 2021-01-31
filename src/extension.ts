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
import { stat } from 'fs';

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const statusBar = new StatusBar();
  const state: ExtensionState = {
    todos: new TodoRepository(context),
    workSession: new WorkSessionRepository(context)
  };

  const todoManager = new TodoManager(state);
  const workSessionManager = new WorkSessionManager(state);
  const stackOverflowManager = new StackOverflowManager();

  await workSessionManager.updateContextActiveSession();

  context.subscriptions.push(statusBar);
  statusBar.updateBarActiveTask(
    workSessionManager.getActiveTask(),
    state.workSession.session
  );
  statusBar.updateBarSession(state.workSession.session);

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.CLEAR_STATE, async () => {
      await state.todos.clearState();
      await state.workSession.clearState();
      await state.workSession.clearAnalytics();
      statusBar.updateBarActiveTask(undefined, state.workSession.session);
      statusBar.updateBarSession(state.workSession.session);
      await vscode.window.showInformationMessage('Cleared state');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_NEW, async () => {
      const todo = await todoManager.createTodo();
      if (state.workSession.session && todo) {
        await vscode.commands.executeCommand<Todo[]>(
          CommandType.WORK_SESSION_ADD_TASKS
        );
      }
      const activeTask = workSessionManager.getActiveTask();
      statusBar.updateBarActiveTask(activeTask, state.workSession.session);
      statusBar.updateBarSession(state.workSession.session);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_EDIT, () =>
      todoManager.editTodo()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_COMPLETE, async () => {
      const completed = await todoManager.completeTodo();
      const activeTask = workSessionManager.getActiveTask();
      statusBar.updateBarActiveTask(activeTask, state.workSession.session);
      await workSessionManager.whenTaskDone(completed);
      statusBar.updateBarSession(state.workSession.session);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandType.WORK_SESSION_COMPLETE_ACTIVE_TASK,
      async () => {
        const activeTask = workSessionManager.getActiveTask();
        if (!activeTask) {
          return;
        }

        const completed = await state.todos.complete(activeTask.id);
        statusBar.updateBarActiveTask(completed, state.workSession.session);
        await workSessionManager.whenTaskDone([completed]);
        statusBar.updateBarSession(state.workSession.session);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_DELETE, async () => {
      await todoManager.deleteTodo();
      statusBar.updateBarActiveTask(
        workSessionManager.getActiveTask(),
        state.workSession.session
      );
      statusBar.updateBarSession(state.workSession.session);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandType.WORK_SESSION_START,
      async () => {
        await workSessionManager.startWorkSession();

        statusBar.updateBarActiveTask(
          workSessionManager.getActiveTask(),
          state.workSession.session
        );
        statusBar.updateBarSession(state.workSession.session);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandType.WORK_SESSION_ADD_TASKS,
      async () => {
        const tasks = await workSessionManager.addTasks();
        statusBar.updateBarActiveTask(
          workSessionManager.getActiveTask(),
          state.workSession.session
        );
        statusBar.updateBarSession(state.workSession.session);
        return tasks;
      }
    )
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
        statusBar.updateBarActiveTask(
          workSessionManager.getActiveTask(),
          state.workSession.session
        );
        statusBar.updateBarSession(state.workSession.session);
        return todo;
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.WORK_SESSION_END, async () => {
      const analytics = await workSessionManager.finishWorkSession();
      statusBar.updateBarActiveTask(
        workSessionManager.getActiveTask(),
        state.workSession.session
      );
      statusBar.updateBarSession(state.workSession.session);
      vscode.window.showInformationMessage(
        `Work Session Finished: ${analytics.completedTodos}/${analytics.todos.length} tasks done`
      );
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
