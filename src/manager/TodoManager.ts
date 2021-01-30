import * as vscode from 'vscode';
import { createTodo, editTodo, selectTodos } from '../commands/todos';
import { TodoInput } from '../entities/Todo';
import { ExtensionState } from '../repositories/ExtensionState';

export class TodoManager {
  state: ExtensionState;

  constructor(state: ExtensionState) {
    this.state = state;
  }

  async createTodo(): Promise<void> {
    const inputs = await createTodo();
    if (inputs) {
      const todo = await this.state.todos.add(inputs);
      vscode.window.showInformationMessage(
        `🎉 New todo created: ${todo.title}`
      );
    }
  }

  async editTodo(): Promise<void> {
    const [selectedTodo] = await selectTodos([
      ...this.state.todos.todos.values()
    ]);
    if (!selectedTodo) {
      return;
    }
    const editedInputs = await editTodo(selectedTodo as TodoInput);
    if (editedInputs) {
      await this.state.todos.edit(editedInputs, selectedTodo.id);
    }
  }

  async deleteTodo(): Promise<void> {
    const [selectedTodo] = await selectTodos([
      ...this.state.todos.todos.values()
    ]);
    if (!selectedTodo) {
      return;
    }

    const warningOptions = ['Delete it', 'Cancel'];
    const selectedOption = await vscode.window.showWarningMessage(
      `This will delete: ${selectedTodo.title} todo`,
      ...warningOptions
    );

    if (selectedOption === warningOptions[0]) {
      await this.state.todos.delete(selectedTodo.id);
      await this.state.workSession.deleteTodo(selectedTodo.id);
      vscode.window.showInformationMessage(
        `Deleted todo: ${selectedTodo.title}`
      );
    }
  }

  async completeTodo(): Promise<void> {
    const selectedTodos = await selectTodos(
      [...this.state.todos.todos.values()],
      { canSelectMany: true, title: "Let's slash some todos" }
    );

    if (selectTodos.length === 0) {
      return;
    }

    await Promise.all(
      selectedTodos.map((todo) => this.state.todos.complete(todo.id))
    );
    vscode.window.showInformationMessage(
      `${selectedTodos.length} todos completed`
    );
  }
}
