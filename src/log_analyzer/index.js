const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const parseLogFileContent = require("./parseLogFileContent");

/**
 * Analyzes the debug log by reading the active text editor's content
 * and extracting executed components.
 */
function analyzeDebugLog(context) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("No active editor found. Please open a log file to analyze.");
        return;
    } else {
        const fileUri = editor.document.uri;
        console.log("fileUri: ", fileUri);
        try {
            readFile(fileUri).then((fileData) => {
                const fileContent = new TextDecoder().decode(fileData);
                if (!fileUri.fsPath.endsWith(".log")) {
                    vscode.window.showInformationMessage(
                        " The active file is not a log file. Please open a .log file to analyze."
                    );
                    return;
                }
                let executedComponents = parseLogFileContent(fileContent);
                if (executedComponents.length === 0) {
                    vscode.window.showInformationMessage("No components found in the log file");
                } else {
                    sendMessageToWebview(context, executedComponents);
                }
            });
        } catch (error) {
            vscode.window.showInformationMessage(`Error reading file: ${error}`);
        }
    }
}

/**
 * Reads the file content from the given URI.
 * @param {vscode.Uri} URI - The URI of the file to read.
 * @returns {Promise<Uint8Array>} - The file content as a Uint8Array.
 */
async function readFile(URI) {
    return await vscode.workspace.fs.readFile(URI);
}

/**
 * Creates a webview panel to display the log analysis results.
 * @param {Array} executedComponents - The restructured components to send to webview.
 */
function sendMessageToWebview(context, executedComponents) {
    console.log("executedComponents: ", executedComponents);
    const panel = vscode.window.createWebviewPanel("logAnalyzer", "React Log Analyzer", vscode.ViewColumn.One, {
        retainContextWhenHidden: true,
        enableScripts: true,
        enableFindWidget: true
    });

    // Resolve the path to `index.html` from React build directory
    const htmlFilePath = path.join(context.extensionPath, "webview-ui", "build", "index.html");
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

    // Convert the local file path to a webview URI
    const webviewUri = (file) =>
        panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(context.extensionPath, "webview-ui", "build", "assets", file))
        );
    // Replace the placeholder in the HTML with the webview URI
    htmlContent = htmlContent
        .replace(/src="\/assets\/index\.js"/g, `src="${webviewUri("index.js")}"`)
        .replace(/href="\/assets\/index\.css"/g, `href="${webviewUri("index.css")}"`);

    panel.webview.html = htmlContent;

    // Handle messages from React Webview
    panel.webview.onDidReceiveMessage(
        (message) => {
            if (message.command === "webviewLoaded") {
                console.log("webview loaded");
                panel.webview.postMessage({
                    command: "initialize",
                    data: {
                        executedComponents: executedComponents
                    }
                });
            } else if (message.command === "error") {
                console.log("Error: ", "error Received");
            }
        },
        undefined,
        context.subscriptions
    );

    context.subscriptions.push(panel);
}

module.exports = analyzeDebugLog;
