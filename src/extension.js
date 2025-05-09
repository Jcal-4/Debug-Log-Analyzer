const vscode = require("vscode");

const analyzeDebugLog = require("./log_analyzer/index");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // This line of code will only be executed once when your extension is activated
    console.log('Extension "Debug Analyzer" is now active!');

    const logicFunction = vscode.commands.registerCommand("log-analyzer.analyzeDebugLog", () => {
        console.log("analyzeDebugLog command is triggered");
        analyzeDebugLog(context);
    });

    context.subscriptions.push(logicFunction);
}

function deactivate() {
    console.log("Extension deactivated");
}

module.exports = { activate, deactivate };
