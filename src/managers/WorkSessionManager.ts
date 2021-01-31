import * as vscode from 'vscode';
import { CommandType } from '../commands/CommandType';
import { selectTodos } from '../commands/todos';
import { Todo } from '../entities/Todo';
import { WorkSessionAnalytic } from '../entities/WorkSessionAnalytic';
import { ExtensionState } from '../repositories/ExtensionState';

export class WorkSessionManager {
  state: ExtensionState;

  constructor(state: ExtensionState) {
    this.state = state;
  }

  async startWorkSession(): Promise<void> {
    if (
      this.state.workSession.session &&
      this.state.workSession.session.todos.size > 0
    ) {
      const finishSessionOptions = ['End the session', 'Cancel'];
      const option = await vscode.window.showInformationMessage(
        `There is a work session with ${this.state.workSession.session.todos.size} todos. Do you want to end it?`,
        ...finishSessionOptions
      );

      if (option === finishSessionOptions[0]) {
        return await vscode.commands.executeCommand(
          CommandType.WORK_SESSION_END
        );
      } else {
        return Promise.resolve();
      }
    }

    await this.state.workSession.startWorkSession();
    await this.updateContextActiveSession();

    if (this.state.todos.todos.size === 0) {
      await vscode.commands.executeCommand(CommandType.TODO_NEW);
      if (this.state.todos.todos.size === 0) {
        return;
      }
    } else {
      await vscode.commands.executeCommand<Todo[]>(
        CommandType.WORK_SESSION_ADD_TASKS
      );
    }

    const todos = this.getWorkSessionTodos();
    if (!todos || !todos.length) {
      return;
    }

    await vscode.commands.executeCommand<Todo | undefined>(
      CommandType.WORK_SESSION_SET_MIT
    );

    await this.askForActiveTask();
  }

  async askForActiveTask(
    question = 'Do you want to start working on a task?'
  ): Promise<void> {
    const options = ['Choose a task 👨‍💻', 'Nah, later 🦥'];
    const selectedOption = await vscode.window.showInformationMessage(
      question,
      ...options
    );
    if (selectedOption === options[0]) {
      await vscode.commands.executeCommand(
        CommandType.WORK_SESSION_SET_ACTIVE_TASK
      );
    }
  }

  async whenTaskDone(todos: Todo[]): Promise<void> {
    const activeTaskID = this.state.workSession.session?.activeTodoId;
    const activeTaskDone = activeTaskID
      ? todos.find((todo) => todo.id === activeTaskID)
      : undefined;

    if (this.state.workSession.session) {
      if (
        this.state.workSession.session.todos.size === 0 &&
        todos.length === 0
      ) {
        return;
      }

      // Update completed tasks no.
      this.state.workSession.session.doneTasks += todos.length;

      if (
        this.state.workSession.session.doneTasks ===
        this.state.workSession.session.todos.size
      ) {
        const allDoneOptions = ['Add another task', 'Finish work session'];
        const selectedOption = await vscode.window.showInformationMessage(
          `🎊 All your tasks are done.`,
          ...allDoneOptions
        );

        // Add other task
        if (selectedOption === allDoneOptions[0]) {
          await vscode.commands.executeCommand(CommandType.TODO_NEW);
          await vscode.commands.executeCommand<Todo[]>(
            CommandType.WORK_SESSION_ADD_TASKS
          );
          return;
        }

        if (selectedOption === allDoneOptions[1]) {
          await vscode.commands.executeCommand(CommandType.WORK_SESSION_END);
          return;
        }
      }
    }

    if (todos.length === 1 && !activeTaskDone) {
      // Only one task done and is not active
      await vscode.window.showInformationMessage(
        `🎉 Completed Task: ${todos[0].title}`
      );
      return;
    }

    // Only one task done and it was active
    if (todos.length === 1 && activeTaskDone) {
      await this.askForActiveTask(
        `🎉 Active task completed ${activeTaskDone.title}. Do you want to work on another task?`
      );
      return;
    }

    // More than one task done and is not active
    if (todos.length > 1 && !activeTaskDone) {
      await vscode.window.showInformationMessage(
        `🎉 Completed ${todos.length} tasks.`
      );
      return;
    }

    // More than one task done and is has active
    if (todos.length > 1 && activeTaskDone) {
      await this.askForActiveTask(
        `🎉 Active task completed with other ${
          todos.length - 1
        } tasks. Do yo want to work on another task?`
      );
      return;
    }
  }

  async finishWorkSession(): Promise<WorkSessionAnalytic> {
    const analytics = await this.state.workSession.finisWorkSession(
      this.getWorkSessionTodos()
    );
    await this.updateContextActiveSession();
    return analytics;
  }

  async addTasks(): Promise<Todo[]> {
    if (!this.state.workSession.session) {
      return [];
    }

    const allTodos = [...this.state.todos.todos.values()];
    const todosOutOfSession = allTodos.filter(
      (todo) => !this.state.workSession.session?.todos.has(todo.id)
    );
    const todos = await selectTodos(todosOutOfSession, {
      canSelectMany: true,
      title: 'Add tasks for your work session',
      placeholder: 'Hit (Enter/Esc) to start a work session without tasks'
    });

    if (todos.length > 0) {
      const ids = todos.map((todo) => todo.id);
      await this.state.workSession.addTodos(ids);
    }

    return Promise.resolve(todos);
  }

  async setMostImportantTask(): Promise<Todo | undefined> {
    if (
      !this.state.workSession.session ||
      this.state.workSession.session.todos.size === 0
    ) {
      return Promise.reject(
        'You need to have a session to set the  most important task'
      );
    }
    const workSessionTodos: Todo[] = this.getWorkSessionTodos();
    const [todo] = await selectTodos(workSessionTodos, {
      title: 'Select your most important task of this session',
      placeholder: 'Hit (Enter/Esc) to cancel'
    });

    if (todo) {
      await this.state.workSession.setMostImportantTodo(todo.id);
      return Promise.resolve(todo);
    }

    return Promise.resolve(undefined);
  }

  async setActiveTask(): Promise<Todo | undefined> {
    const [todo] = await selectTodos(this.getWorkSessionTodos(), {
      title: 'Which task do you want to work first?',
      placeholder: 'Hit (Enter/Esc) to cancel'
    });

    if (todo) {
      await this.state.workSession.setActiveTodo(todo.id);
    }
    return Promise.resolve(todo);
  }

  getActiveTask(): Todo | undefined {
    const activeTaskID = this.state.workSession.session?.activeTodoId || '';
    return this.state.todos.todos.get(activeTaskID);
  }

  private getWorkSessionTodos(): Todo[] {
    const todos: Todo[] = [];
    if (
      this.state.workSession.session &&
      this.state.workSession.session.todos.size > 0 &&
      this.state.todos.todos.size > 0
    )
      this.state.workSession.session.todos.forEach((id) => {
        const todo = this.state.todos.todos.get(id);
        if (todo) {
          todos.push(todo);
        }
      });

    return todos;
  }

  async updateContextActiveSession(): Promise<void> {
    await vscode.commands.executeCommand(
      'setContext',
      'voltdev:hasActiveWorkSession',
      Boolean(this.state.workSession.session)
    );
  }
}
