import * as vscode from 'vscode';
import { TodoRepository } from './repositories/TodoRepository';
import { createTodo, editTodo, selectTodo } from './commands/todos';
import { CommandType } from './commands/CommandType';
import { TodoInput } from './entities/Todo';

export function activate(context: vscode.ExtensionContext): void {
  const todoRepository = new TodoRepository(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_NEW, async () => {
      const inputs = await createTodo();
      if (inputs) {
        await todoRepository.add(inputs);
        vscode.window.showInformationMessage('New todo created');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_EDIT, async () => {
      const selectedTodo = await selectTodo([...todoRepository.todos.values()]);
      if (!selectedTodo) {
        return;
      }
      const editedInputs = await editTodo(selectedTodo as TodoInput);
      if (editedInputs) {
        await todoRepository.edit(editedInputs, selectedTodo.id);
      }
    })
  );
}

// this method is called when your extension is deactivated
// export function deactivate() {}
