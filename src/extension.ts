import * as vscode from 'vscode';
import { TodoRepository } from './repositories/TodoRepository';
import { createTodo } from './commands/todos';
import { CommandType } from './commands/CommandType';

export function activate(context: vscode.ExtensionContext): void {
  const todoRepository = new TodoRepository(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_NEW, async () => {
      const inputs = await createTodo();
      await todoRepository.add(inputs);
      vscode.window.showInformationMessage('New todo created');
    })
  );
}

// this method is called when your extension is deactivated
// export function deactivate() {}
