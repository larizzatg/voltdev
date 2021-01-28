import * as vscode from 'vscode';
import { TodoRepository } from './repositories/TodoRepository';
import { createTodo, editTodo, selectTodos } from './commands/todos';
import { CommandType } from './commands/CommandType';
import { TodoInput } from './entities/Todo';
import { warn } from 'console';

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
      const [selectedTodo] = await selectTodos([
        ...todoRepository.todos.values()
      ]);
      if (!selectedTodo) {
        return;
      }
      const editedInputs = await editTodo(selectedTodo as TodoInput);
      if (editedInputs) {
        await todoRepository.edit(editedInputs, selectedTodo.id);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_COMPLETE, async () => {
      const selectedTodos = await selectTodos(
        [...todoRepository.todos.values()],
        { canSelectMany: true, title: "Let's slash some todos" }
      );
      await Promise.all(
        selectedTodos.map((todo) => todoRepository.complete(todo.id))
      );
      vscode.window.showInformationMessage(
        `${selectedTodos.length} todos completed`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(CommandType.TODO_DELETE, async () => {
      const [selectedTodo] = await selectTodos([
        ...todoRepository.todos.values()
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
        await todoRepository.delete(selectedTodo.id);
        vscode.window.showInformationMessage(
          `Deleted todo: ${selectedTodo.title}`
        );
      }
    })
  );
}

// this method is called when your extension is deactivated
// export function deactivate() {}
