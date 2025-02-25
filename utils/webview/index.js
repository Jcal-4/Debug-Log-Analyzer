const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function createWebviewPanel(context, executedComponents) {
    const panel = vscode.window.createWebviewPanel("logAnalyzer", "Log Analyzer", vscode.ViewColumn.One, {
        enableScripts: true
    });
    const htmlPath = path.join(context.extensionPath, "utils", "webview", "webview.html");
    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Insert data into the HTML content
    // htmlContent = htmlContent.replace("{{data}}", "data passed in!");

    const executedComponentsJSON = JSON.stringify(executedComponents);
    // const executedComponentsJSON = executedComponents;
    htmlContent = htmlContent.replace("{{executedComponents}}", executedComponentsJSON);
    panel.webview.html = htmlContent;
}

module.exports = createWebviewPanel;
