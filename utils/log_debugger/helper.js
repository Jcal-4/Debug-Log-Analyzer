const vscode = require("vscode");

function analyzeDebugLog() {
    // Display a message box to the user
    vscode.window.showInformationMessage("Initializing Log Analyzer!");
    console.log("Will start the logic to analyze our debug log");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log("no active editor found");
        return;
    } else {
        // Get current file URI
        const fileUri = editor.document.uri;
        try {
            const fileData = readFile(fileUri).then((fileData) => {
                const fileContent = new TextDecoder().decode(fileData);
                console.log("Decoded File Data: ", fileContent);
                // return data;
            });
        } catch (error) {
            // vscode.window.showErrorMessage(`Error reading file: ${error}`);
            vscode.window.showInformationMessage(`Error reading file: ${error}`);
        }
    }
}

async function readFile(URI) {
    return await vscode.workspace.fs.readFile(URI);
}

module.exports = analyzeDebugLog;
