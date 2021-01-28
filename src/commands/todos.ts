import * as vscode from 'vscode';
import { TodoInput, Todo } from '../entities/Todo';

type TodoQuickPick = {
  todo: Todo;
  label: string;
  description: string;
  detail: string;
};

export async function createTodo(): Promise<TodoInput> {
  const title = await vscode.window.showInputBox({
    prompt: 'Write the title of your new todo'
  });

  if (!title) {
    return Promise.reject('User cancel the todo creation');
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

export function selectTodo(todos: Todo[]): Promise<Todo | undefined> {
  return new Promise((resolve) => {
    let todo: Todo | undefined = undefined;
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
    quickPick.title = 'List of todo';
    quickPick.onDidChangeSelection(() => {
      todo = quickPick.selectedItems[0].todo;
      quickPick.hide();
    });
    quickPick.onDidHide(() => {
      resolve(todo);
    });
    quickPick.show();
  });
}
