const vscode = require("vscode");

function analyzeDebugLog() {
    // Display a message box to the user
    vscode.window.showInformationMessage("Initializing Log Analyzer!");
    
    console.log("Will start the logic to analyze our debug log");
    
}

module.exports = analyzeDebugLog;
