// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const analyzeDebugLog = require("./utils/log_debugger/helper");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "text-extension" is now active!');

    const logicFunction = vscode.commands.registerCommand("log-analyzer.analyzeDebugLog", () => {
        analyzeDebugLog();
    });

    context.subscriptions.push(logicFunction);
}

// This method is called when your extension is deactivated
function deactivate() {
    console.log("Extension deactivated");
}

module.exports = {
    activate,
    deactivate
};
