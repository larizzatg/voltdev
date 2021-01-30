import * as vscode from 'vscode';
import { TodoRepository } from './repositories/TodoRepository';
import { selectTodos } from './commands/todos';
import { CommandType } from './commands/CommandType';
import { Todo } from './entities/Todo';
import { WorkSessionRepository } from './repositories/WorkSessionRepository';
import { TodoManager } from './manager/TodoManager';
import { WorkSessionManager } from './manager/WorkSessionManager';

let statusBarActiveTask: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  const todoRepository = new TodoRepository(context);
  const workSessionRepository = new WorkSessionRepository(context);

  const todoManager = new TodoManager({
    todos: todoRepository,
    workSession: workSessionRepository
  });

  const workSessionManager = new WorkSessionManager({
    todos: todoRepository,
    workSession: workSessionRepository
  });

  statusBarActiveTask = createActiveTaskStatusBar();
  context.subscriptions.push(statusBarActiveTask);

  updateActiveTaskStatusBar(todoRepository, workSessionRepository);

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.CLEAR_STATE, async () => {
      await todoRepository.clearState();
      await workSessionRepository.clearState();
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
      updateActiveTaskStatusBar(todoRepository, workSessionRepository);
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
        updateActiveTaskStatusBar(todoRepository, workSessionRepository);
        return todo;
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.WORK_SESSION_END, async () => {
      await workSessionManager.finishWorkSession();
      updateActiveTaskStatusBar(todoRepository, workSessionRepository);
    })
  );
}

function createActiveTaskStatusBar(): vscode.StatusBarItem {
  const bar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    10
  );
  bar.color = new vscode.ThemeColor('terminal.ansiBrightYellow');
  return bar;
}

function updateActiveTaskStatusBar(
  todoRepository: TodoRepository,
  workSessionRepository: WorkSessionRepository
): void {
  if (
    !workSessionRepository.session ||
    !workSessionRepository.session.activeTodoId
  ) {
    statusBarActiveTask.hide();
    return;
  }

  const activeTask = todoRepository.todos.get(
    workSessionRepository.session.activeTodoId
  );
  if (!activeTask) {
    statusBarActiveTask.hide();
    return;
  }

  const MAX_LENGTH = 20;
  let title = activeTask.title;
  let description = activeTask.description;

  if (activeTask.title.length > MAX_LENGTH) {
    title = `${activeTask.title.slice(0, MAX_LENGTH)}...`;
    description = activeTask.title;
  }

  statusBarActiveTask.text = `⚡ Active Task: ${title}`;
  statusBarActiveTask.tooltip = `${description}`;
  statusBarActiveTask.show();
}

// this method is called when your extension is deactivated
// export function deactivate() {}
