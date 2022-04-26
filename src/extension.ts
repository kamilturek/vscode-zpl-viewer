import * as vscode from 'vscode';
import { ZPLEditorProvider } from './zplProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(ZPLEditorProvider.register(context));
}

export function deactivate() {}
