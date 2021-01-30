import * as vscode from 'vscode';
import { CommandType } from '../commands/CommandType';
import { selectTodos } from '../commands/todos';
import { Todo } from '../entities/Todo';
import { ExtensionState } from '../repositories/ExtensionState';

export class WorkSessionManager {
  state: ExtensionState;

  constructor(state: ExtensionState) {
    this.state = state;
  }

  async startWorkSession(): Promise<void> {
    await this.state.workSession.startWorkSession();
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

  async finishWorkSession(): Promise<void> {
    await this.state.workSession.finisWorkSession();
  }

  async addTasks(): Promise<Todo[]> {
    const todos = await selectTodos([...this.state.todos.todos.values()], {
      canSelectMany: true,
      title: 'Choose the tasks for your work session',
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
}
