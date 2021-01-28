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
