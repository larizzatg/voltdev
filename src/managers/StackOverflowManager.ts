import * as vscode from 'vscode';
import { STACK_OVERFLOW_URL } from '../constants';

enum StackOverflowManagerErrors {
  NOTHING_SELECTED = 'There is nothing selected in the editor'
}

export class StackOverflowManager {
  async searchInBrowser(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.document.getText(editor.selection);
    if (!editor || !selection) {
      return Promise.reject(
        new Error(StackOverflowManagerErrors.NOTHING_SELECTED)
      );
    }
    const question = selection.split(' ').join('+');
    const language = editor.document.languageId;
    const tags = language !== 'plaintext' ? `+[${language}]` : '';
    const search = `${STACK_OVERFLOW_URL}/search?q=${question}${tags}`;
    await vscode.env.openExternal(vscode.Uri.parse(search, false));
  }
}
