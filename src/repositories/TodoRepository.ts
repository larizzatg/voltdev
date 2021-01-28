import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { Todo, TodoInput } from '../entities/Todo';

const STORAGE_KEY_TODOS = 'store.todos';

export class TodoRepository {
  todos: Map<string, Todo> = new Map();
  static state: vscode.Memento;

  constructor(context: vscode.ExtensionContext) {
    TodoRepository.state = context.globalState;
    const currentState = TodoRepository.state.get<[string, Todo][]>(
      STORAGE_KEY_TODOS,
      []
    );
    this.todos = new Map(currentState);
  }

  async add(input: TodoInput): Promise<Todo> {
    const todo: Todo = {
      id: uuidv4(),
      ...input,
      done: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: undefined
    };

    this.todos.set(todo.id, todo);
    await this.updateState();
    return todo;
  }

  async edit(inputs: TodoInput, id: string): Promise<Todo> {
    if (!this.todos.has(id)) {
      return Promise.reject(`The todo: ${id} doesn't exist`);
    }

    const todo = {
      ...this.todos.get(id),
      ...inputs,
      updatedAt: new Date()
    } as Todo;

    this.todos.set(id, todo);
    await this.updateState();
    return todo;
  }

  async complete(id: string): Promise<Todo> {
    if (!this.todos.has(id)) {
      return Promise.reject(`The todo: ${id} doesn't exist`);
    }

    const todo = {
      ...this.todos.get(id),
      done: true,
      completedAt: new Date()
    } as Todo;

    this.todos.set(id, todo);
    await this.updateState();
    return todo;
  }

  async delete(id: string): Promise<void> {
    if (!this.todos.has(id)) {
      return Promise.reject(`The todo: ${id} doesn't exist`);
    }

    this.todos.delete(id);
    await this.updateState();
  }

  async updateState(): Promise<void> {
    await TodoRepository.state.update(STORAGE_KEY_TODOS, [...this.todos]);
  }

  async clearState(): Promise<void> {
    this.todos = new Map();
    await TodoRepository.state.update(STORAGE_KEY_TODOS, []);
  }
}
