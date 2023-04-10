import * as vscode from 'vscode';
import { zplToPng } from './labelary';
import { getNonce } from './util';

export class ZPLEditorProvider implements vscode.CustomTextEditorProvider {
  private static readonly viewType = 'vscode-zpl-viewer.preview';

  private dpmm: number;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.dpmm = 8;
  }

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new ZPLEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      this.viewType,
      provider
    );
    return providerRegistration;
  }

  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    vscode.workspace
      .createFileSystemWatcher(document.uri.fsPath)
      .onDidChange(() => {
        this.updateWebview(document, webviewPanel);
      });

    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case 'dpmmChanged':
          this.dpmm = e.value;
          this.updateWebview(document, webviewPanel);
      }
    });

    this.updateWebview(document, webviewPanel);
  }

  private getHtmlForWebview(
    webview: vscode.Webview,
    encodedLabel: string
  ): string {
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'zplPreview.css')
    );
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        'node_modules',
        '@vscode/codicons',
        'dist',
        'codicon.css'
      )
    );
    const toolkitUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        'node_modules',
        '@vscode',
        'webview-ui-toolkit',
        'dist',
        'toolkit.js'
      )
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'zplPreview.js')
    );

    const nonce = getNonce();

    return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet" />
        <link href="${codiconsUri}" rel="stylesheet" />

        <script type="module" src="${toolkitUri}"></script>
 
				<title>ZPL Preview</title>
			</head>
			<body>
        <div class="header">
          <div>
            <vscode-button appearance="icon" id="zoom-in">
              <span class="codicon codicon-zoom-in"></span>
            </vscode-button>
            <vscode-button appearance="icon" id="zoom-out">
              <span class="codicon codicon-zoom-out"></span>
            </vscode-button>
          </div>
          <div>
            <vscode-dropdown id="dpmn">
              <vscode-option value="6" ${
                this.dpmm === 6 ? 'selected' : ''
              }>6dpmm</vscode-option>
              <vscode-option value="8" ${
                this.dpmm === 8 ? 'selected' : ''
              }>8dpmm</vscode-option>
              <vscode-option value="12" ${
                this.dpmm === 12 ? 'selected' : ''
              }>12dpmm</vscode-option>
              <vscode-option value="24" ${
                this.dpmm === 24 ? 'selected' : ''
              }>24dpmm</vscode-option>
            </vscode-dropdown>
          </div>
        </div>
        <div>
          <img id="label" src="data:image/png;base64, ${encodedLabel}">
        </div>

        <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  private updateWebview(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    return zplToPng(document.getText(), this.dpmm).then(
      (label: string | void) => {
        if (label) {
          webviewPanel.webview.html = this.getHtmlForWebview(
            webviewPanel.webview,
            label
          );
        }
      }
    );
  }
}
