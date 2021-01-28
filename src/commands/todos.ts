import * as vscode from 'vscode';
import { TodoInput, Todo } from '../entities/Todo';

type TodoQuickPick = {
  todo: Todo;
  label: string;
  description: string;
  detail: string;
};

type TodoQuickPickOptions = {
  canSelectMany?: boolean;
  placeholder?: string;
  title?: string;
};

export async function createTodo(): Promise<TodoInput | undefined> {
  const title = await vscode.window.showInputBox({
    prompt: 'Write the title of your new todo',
    validateInput: (value: string) => {
      if (value.trim() === '') {
        return 'The title cannot be empty';
      }
      return null;
    }
  });

  if (!title) {
    return Promise.resolve(undefined);
  }

  const description =
    (await vscode.window.showInputBox({
      prompt: 'Write the description of your new todo',
      placeHolder: 'Press enter to create it without a description'
    })) || '';

  return {
    title,
    description
  };
}

export async function editTodo(
  input: TodoInput
): Promise<TodoInput | undefined> {
  const title = await vscode.window.showInputBox({
    prompt: 'Edit the title of your todo',
    value: input.title,
    validateInput: (value: string) => {
      if (value.trim() === '') {
        return 'The title cannot be empty';
      }
      return null;
    }
  });

  if (!title) {
    return Promise.resolve(undefined);
  }

  const description =
    (await vscode.window.showInputBox({
      prompt: 'Edit the description of your todo',
      value: input.description
    })) || '';

  return {
    title,
    description
  };
}

export function selectTodos(
  todos: Todo[],
  options?: TodoQuickPickOptions
): Promise<Todo[]> {
  return new Promise((resolve) => {
    let selectedTodos: Todo[] = [];
    const quickPick = vscode.window.createQuickPick<TodoQuickPick>();
    quickPick.items = todos
      .filter((todo) => !todo.done)
      .map(
        (todo) =>
          ({
            label: todo.title,
            description: todo.description,
            detail: '',
            todo
          } as TodoQuickPick)
      );
    quickPick.title = options?.title || 'Todo list';
    quickPick.placeholder = options?.placeholder || '';
    quickPick.canSelectMany = options?.canSelectMany || false;
    quickPick.onDidChangeSelection(() => {
      selectedTodos = quickPick.selectedItems.map((item) => item.todo);
      quickPick.hide();
    });
    quickPick.onDidHide(() => {
      resolve(selectedTodos);
    });
    quickPick.show();
  });
}
