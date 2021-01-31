import * as vscode from 'vscode';
import {
  createTodo,
  editTodo,
  emptyTodoConfirmation,
  selectTodos
} from '../commands/todos';
import { Todo, TodoInput } from '../entities/Todo';
import { ExtensionState } from '../repositories/ExtensionState';

export class TodoManager {
  state: ExtensionState;

  constructor(state: ExtensionState) {
    this.state = state;
  }

  async createTodo(): Promise<Todo | undefined> {
    const inputs = await createTodo();
    if (inputs) {
      const todo = await this.state.todos.add(inputs);
      vscode.window.showInformationMessage(
        `🎉 New task created: ${todo.title}`
      );
      return todo;
    }
    return;
  }

  async editTodo(): Promise<void> {
    const allTodos = [...this.state.todos.todos.values()];

    if (allTodos.length === 0) {
      await emptyTodoConfirmation('edit');
      return;
    }

    const [selectedTodo] = await selectTodos(allTodos);
    if (!selectedTodo) {
      return;
    }
    const editedInputs = await editTodo(selectedTodo as TodoInput);
    if (editedInputs) {
      await this.state.todos.edit(editedInputs, selectedTodo.id);

      vscode.window.showInformationMessage(`A task was edited`);
    }
  }

  async deleteTodo(): Promise<void> {
    const allTodos = [...this.state.todos.todos.values()];

    if (allTodos.length === 0) {
      await emptyTodoConfirmation('delete');
      return;
    }

    const [selectedTodo] = await selectTodos(allTodos);
    if (!selectedTodo) {
      return;
    }

    const warningOptions = ['Delete it', 'Cancel'];
    const selectedOption = await vscode.window.showWarningMessage(
      `This will delete the task: ${selectedTodo.title} `,
      ...warningOptions
    );

    if (selectedOption === warningOptions[0]) {
      await this.state.todos.delete(selectedTodo.id);
      await this.state.workSession.deleteTodo(selectedTodo.id);
      vscode.window.showInformationMessage(
        `Deleted task ${selectedTodo.title}`
      );
    }
  }

  async completeTodo(): Promise<Todo[]> {
    const allTodos = [...this.state.todos.todos.values()];

    if (allTodos.length === 0) {
      await emptyTodoConfirmation('complete');
      return [];
    }

    const selectedTodos = await selectTodos(allTodos, {
      canSelectMany: true,
      title: "Let's slash some tasks"
    });

    if (selectedTodos.length === 0) {
      return [];
    }

    const ids = selectedTodos.map((todo) => todo.id);
    await this.state.workSession.addTodos(ids);

    const completedTodos = await Promise.all(
      selectedTodos.map((todo) => this.state.todos.complete(todo.id))
    );
    return completedTodos;
  }
}
