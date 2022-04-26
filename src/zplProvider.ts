import * as vscode from 'vscode';
import { getNonce } from './util';

export class ZPLEditorProvider implements vscode.CustomReadonlyEditorProvider {
  private static readonly viewType = 'vscode-zpl-viewer.preview';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new ZPLEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      this.viewType,
      provider
    );
    return providerRegistration;
  }

  openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext,
    token: vscode.CancellationToken
  ): vscode.CustomDocument | Thenable<vscode.CustomDocument> {
    return { uri, dispose: (): void => {} };
  }

  resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<title>Cat Scratch</title>
			</head>
			<body>
				<div class="notes">
					<div class="add-button">
						<button>Scratch!</button>
					</div>
				</div>
			</body>
			</html>`;
  }
}
