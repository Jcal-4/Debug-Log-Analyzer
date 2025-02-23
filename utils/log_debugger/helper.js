const vscode = require("vscode");

function analyzeDebugLog() {
    // Display a message box to the user
    vscode.window.showInformationMessage("Initializing Log Analyzer!");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log("no active editor found");
        return;
    } else {
        // Get current file URI
        const fileUri = editor.document.uri;
        try {
            readFile(fileUri).then((fileData) => {
                const fileContent = new TextDecoder().decode(fileData);
                let executedComponents = [];
                executedComponents = retrieveComponents(fileContent);
                if (executedComponents.length === 0) {
                    vscode.window.showInformationMessage("No components found in the log file");
                } else {
                    console.log(executedComponents);
                    // for (let i = 0; i < executedComponents.length; i++) {
                    //     console.log("executedComponent --> ", executedComponents[i]);
                    // }
                }
                // return data;
            });
        } catch (error) {
            vscode.window.showInformationMessage(`Error reading file: ${error}`);
        }
    }
}

async function readFile(URI) {
    return await vscode.workspace.fs.readFile(URI);
}

function retrieveComponents(fileContent) {
    const lines = fileContent.split("\n");
    let executedComponents = [];
    let ignoreList = [
        "system.",
        ".bulkBefore",
        ".bulkAfter",
        "Logger.",
        "Math.",
        "LoggerParameter.",
        "EncodingUtil.",
        "EventServices.",
        "TriggerFactory.",
        "AccessLevel.",
        "Database.QueryLocatorIterator",
        "JSON.",
        "Crypto.",
        "Url",
        "Request.",
        "UserServices.",
        "Constants.",
        "TriggerHandler()",
        "AccountService.",
        "LoggerScenarioRule.",
        "TriggerHandler.afterInsert()"
    ];
    let codeUnitObj = {};
    for (let i = 0; i < lines.length; i++) {
        let counter = 0;
        const line = lines[i];
        if (line.includes("CODE_UNIT_STARTED")) {
            const parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            methodDetails = "CODE_UNIT_STARTED: " + methodDetails;
            // executedComponents.push(methodDetails);
        }
        if (line.includes("METHOD_ENTRY")) {
            counter += 1;
            const parts = line.split("|");
            const methodDetails = parts[parts.length - 1];
            const methodDetailsLowercase = methodDetails.toLowerCase();
            let shouldIgnore = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodDetailsLowercase.includes(ignoreItem.toLowerCase())) {
                    // console.log("Ignoring method: ", methodDetailsLowercase, " due to ignore item: ", ignoreItem);
                    shouldIgnore = true;
                }
            });
            if (shouldIgnore) {
                continue;
            }
            codeUnitObj["METHOD_ENTRY_" + counter] = methodDetails;
            // executedComponents.push(methodDetails);
        }
        if (line.includes("CODE_UNIT_FINISHED")) {
            const parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            methodDetails = "CODE_UNIT_FINISHED: " + methodDetails;
            executedComponents.push(codeUnitObj);
            codeUnitObj = {};
            counter = 0;
            // executedComponents.push(methodDetails);
        }
    }
    return executedComponents;
}

module.exports = analyzeDebugLog;
