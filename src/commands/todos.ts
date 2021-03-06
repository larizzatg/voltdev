import * as vscode from 'vscode';
import { TodoInput, Todo } from '../entities/Todo';
import { CommandType } from './CommandType';

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
    prompt: 'Write the title of your new task',
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
      prompt: 'Write the description of your new task',
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
    prompt: 'Edit the title of your task',
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
      prompt: 'Edit the description of your task',
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
    quickPick.title = options?.title || 'Todo List';
    quickPick.placeholder = options?.placeholder || '';
    quickPick.canSelectMany = options?.canSelectMany || false;
    const onSelection = () => {
      selectedTodos = quickPick.selectedItems.map((item) => item.todo);
      quickPick.hide();
    };

    if (options?.canSelectMany) {
      quickPick.onDidAccept(onSelection);
    } else {
      quickPick.onDidChangeSelection(onSelection);
    }

    quickPick.onDidHide(() => {
      resolve(selectedTodos);
    });
    quickPick.show();
  });
}

export async function emptyTodoConfirmation(action?: string): Promise<boolean> {
  const options = ['Create new task', 'Maybe later'];
  const selection = await vscode.window.showInformationMessage(
    `You don't have tasks ${action ? 'to ' + action : ''}`,
    ...options
  );
  if (selection === options[0]) {
    await vscode.commands.executeCommand<Todo[]>(CommandType.TODO_NEW);
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}
