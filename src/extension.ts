import * as vscode from 'vscode';
import { TodoRepository } from './repositories/TodoRepository';
import { selectTodos } from './commands/todos';
import { CommandType } from './commands/CommandType';
import { Todo } from './entities/Todo';
import { WorkSessionRepository } from './repositories/WorkSessionRepository';
import { TodoManager } from './manager/TodoManager';

let statusBarActiveTask: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  const todoRepository = new TodoRepository(context);
  const workSessionRepository = new WorkSessionRepository(context);
  manageWorkSessionCommands(context, workSessionRepository, todoRepository);

  const todoManager = new TodoManager({
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

function manageWorkSessionCommands(
  context: vscode.ExtensionContext,
  workSessionRepository: WorkSessionRepository,
  todoRepository: TodoRepository
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandType.WORK_SESSION_START,
      async () => {
        await workSessionRepository.startWorkSession();
        const todos = await vscode.commands.executeCommand<Todo[]>(
          CommandType.WORK_SESSION_ADD_TASKS
        );
        if (!todos || !todos.length) {
          return;
        }
        await vscode.commands.executeCommand<Todo | undefined>(
          CommandType.WORK_SESSION_SET_MIT
        );
        const options = ['Choose a task 👨‍💻', 'Nah, later 🦥'];
        const selectedOption = await vscode.window.showInformationMessage(
          'Do you want to start working on a task?',
          ...options
        );
        if (selectedOption === options[0]) {
          await vscode.commands.executeCommand(
            CommandType.WORK_SESSION_SET_ACTIVE_TASK
          );
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandType.WORK_SESSION_ADD_TASKS,
      async (): Promise<Todo[]> => {
        const todos = await selectTodos([...todoRepository.todos.values()], {
          canSelectMany: true,
          title: 'Choose the tasks for your work session',
          placeholder: 'Hit (Enter/Esc) to start a work session without tasks'
        });

        if (todos.length > 0) {
          const ids = todos.map((todo) => todo.id);
          await workSessionRepository.addTodos(ids);
        }

        return Promise.resolve(todos);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandType.WORK_SESSION_SET_MIT,
      async (): Promise<Todo | undefined> => {
        if (
          !workSessionRepository.session ||
          workSessionRepository.session.todos.size === 0
        ) {
          return Promise.reject(
            'You need to have a session to set the most important task'
          );
        }
        const workSessionTodos: Todo[] = await getWorkSessionTodos(
          workSessionRepository,
          todoRepository
        );
        const [todo] = await selectTodos(workSessionTodos, {
          title: 'Select your most important task of this session',
          placeholder: 'Hit (Enter/Esc) to cancel'
        });

        if (todo) {
          await workSessionRepository.setMostImportantTodo(todo.id);
          return Promise.resolve(todo);
        }

        return Promise.resolve(undefined);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandType.WORK_SESSION_SET_ACTIVE_TASK,
      async (): Promise<Todo | undefined> => {
        const workSessionTodos: Todo[] = await getWorkSessionTodos(
          workSessionRepository,
          todoRepository
        );
        const [todo] = await selectTodos(workSessionTodos, {
          title: 'Which task do you want to work first?',
          placeholder: 'Hit (Enter/Esc) to cancel'
        });

        if (todo) {
          await workSessionRepository.setActiveTodo(todo.id);
          updateActiveTaskStatusBar(todoRepository, workSessionRepository);
          return Promise.resolve(todo);
        }
        return Promise.resolve(undefined);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.WORK_SESSION_END, async () => {
      // todo generate work session analytics and save it
      await workSessionRepository.finisWorkSession();
      updateActiveTaskStatusBar(todoRepository, workSessionRepository);
    })
  );
}

function getWorkSessionTodos(
  workSessionRepository: WorkSessionRepository,
  todoRepository: TodoRepository
): Promise<Todo[]> {
  const todos: Todo[] = [];
  if (
    !workSessionRepository.session ||
    workSessionRepository.session.todos.size == 0
  ) {
    return Promise.resolve(todos);
  }

  if (todoRepository.todos.size == 0) {
    return Promise.resolve(todos);
  }

  workSessionRepository.session.todos.forEach((id) => {
    const todo = todoRepository.todos.get(id);

    if (todo) {
      todos.push(todo);
    }
  });

  return Promise.resolve(todos);
}

// this method is called when your extension is deactivated
// export function deactivate() {}
