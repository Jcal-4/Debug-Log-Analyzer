const vscode = require("vscode");
const path = require("path");
const fs = require("fs");


function activate(context) {
    let disposable = vscode.commands.registerCommand("vscode-react-webview.openWebview", function () {
        const panel = vscode.window.createWebviewPanel("reactWebview", "React Webview", vscode.ViewColumn.One, {
            enableScripts: true // Allow JS execution in the Webview
        });

        // Resolve the path to `index.html`
        const htmlFilePath = path.join(context.extensionPath, "src", "webview", "index.html");

        // Read the HTML file content and replace resource paths
        let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

        // Convert local file paths to Webview URIs
        const webviewUri = (file) => panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "webview", file)));

        htmlContent = htmlContent.replace(/src="\.\/index\.js"/g, `src="${webviewUri("index.js")}"`);

        // Set the HTML content to Webview
        panel.webview.html = htmlContent;

        // Handle messages from Webview
        panel.webview.onDidReceiveMessage(
            (message) => {
                if (message.command === "requestData") {
                    panel.webview.postMessage({
                        command: "update",
                        data: { message: "Hello from VS Code Extension!", count: 5 }
                    });
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
