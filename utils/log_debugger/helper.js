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
        console.log("fileUri: ", fileUri);
        try {
            readFile(fileUri).then((fileData) => {
                const fileContent = new TextDecoder().decode(fileData);
                let executedComponents = [];
                executedComponents = retrieveComponents(fileContent);
                if (executedComponents.length === 0) {
                    vscode.window.showInformationMessage("No components found in the log file");
                } else {
                    console.log(executedComponents);

                    // let resultMap = executedComponents[0];
                    // for (let [key, value] of resultMap.entries()) {
                    //     console.log(`${key}: ${value}`);
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
    let stack = [];
    let codeUnitMap = new Map();
    let counter = 0;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes("CODE_UNIT_STARTED")) {
            counter += 1;
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            codeUnitMap.set("CODE_UNIT_STARTED_" + counter, methodDetails);
            stack.push(methodDetails);
        } else if (line.includes("METHOD_ENTRY")) {
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            let methodDetailsLowercase = methodDetails.toLowerCase();
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
            counter += 1;
            codeUnitMap.set("METHOD_ENTRY_" + counter, methodDetails);
        } else if (line.includes("CODE_UNIT_FINISHED")) {
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            if (stack.length > 0) {
                let lastMethod = stack.pop();
                if (lastMethod == methodDetails) {
                    counter += 1;
                    codeUnitMap.set("CODE_UNIT_FINISHED_" + counter, methodDetails);
                }
            }
            if (stack.length === 0) {
                // executedComponents.push(Object.fromEntries(codeUnitMap));
                executedComponents.push(new Map(codeUnitMap));
                codeUnitMap.clear();
                counter = 0;
            }
        }
    }
    return executedComponents;
}

// STACK: ['CODE_UNIT_STARTED_1', 'CODE_UNIT_STARTED_2', 'CODE_UNIT_STARTED_3']
// 14:06:23.1 (1737138)|CODE_UNIT_STARTED|[EXTERNAL]|01p830000009tTO|ReturnAccessoriesDetailsControllerTest.makeData()
// 14:06:23.1 (4694724)|METHOD_ENTRY|[2]|01p830000009tTO|ReturnAccessoriesDetailsControllerTest.ReturnAccessoriesDetailsControllerTest()
// 14:06:23.1 (99219423)|CODE_UNIT_STARTED|[EXTERNAL]|Flow:User
// 14:06:23.1 (99249223)|CODE_UNIT_FINISHED|Flow:User
module.exports = analyzeDebugLog;
