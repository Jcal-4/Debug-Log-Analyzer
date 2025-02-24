const vscode = require("vscode");
const ignoreList = require("./ignoreList");

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
                // Retrieve components from the file content
                executedComponents = retrieveComponents(fileContent);
                if (executedComponents.length === 0) {
                    vscode.window.showInformationMessage("No components found in the log file");
                } else {
                    console.log(executedComponents);
                }
            });
        } catch (error) {
            vscode.window.showInformationMessage(`Error reading file: ${error}`);
        }
    }
}

async function readFile(URI) {
    // Read the file content from the given URI
    return await vscode.workspace.fs.readFile(URI);
}

function retrieveComponents(fileContent) {
    const lines = fileContent.split("\n");
    let executedComponents = [];
    let stack = [];
    let codeUnitMap = new Map();
    let counter = 0;
    let codeUnitCounter = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes("CODE_UNIT_STARTED")) {
            codeUnitCounter += 1;
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            // Store the method details in the map with a unique key
            codeUnitMap.set("CODE_UNIT_STARTED_" + codeUnitCounter, methodDetails);
            // Push an object with methodDetails and counter onto the stack
            stack.push({ methodDetails, codeUnitCounter });
        } else if (line.includes("METHOD_ENTRY")) {
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            let methodDetailsLowercase = methodDetails.toLowerCase();
            let shouldIgnoreMethod = false;
            // Check if the method should be ignored based on the ignore list
            ignoreList.forEach((ignoreItem) => {
                if (methodDetailsLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                counter += 1;
                // Store the method details in the map with a unique key
                codeUnitMap.set("METHOD_ENTRY_" + counter, methodDetails);
            }
        } else if (line.includes("CODE_UNIT_FINISHED")) {
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            if (stack.length > 0) {
                let prevLine = lines[i - 1];
                let prevParts = prevLine.split("|");
                let prevMethodDetails = prevParts[prevParts.length - 1];
                let lastMethod = stack.pop();
                if (prevMethodDetails == methodDetails) {
                    // Remove the corresponding CODE_UNIT_STARTED entry if it matches
                    codeUnitMap.delete("CODE_UNIT_STARTED_" + lastMethod.codeUnitCounter);
                    codeUnitCounter -= 1;
                } else if (lastMethod.methodDetails == methodDetails) {
                    // Store the method details in the map with a unique key
                    codeUnitMap.set("CODE_UNIT_FINISHED_" + lastMethod.codeUnitCounter, methodDetails);
                }
            }
            if (stack.length === 0) {
                // Restructure the map and add it to the executed components
                codeUnitMap = restructureMap(codeUnitMap);
                executedComponents.push(new Map(codeUnitMap));
                codeUnitMap.clear();
                codeUnitCounter = 0;
            }
        }
    }
    return executedComponents;
}

function restructureMap(inputMap) {
    let stack = [];
    let result = new Map();
    let currentMap = result;
    // Convert inputMap to an array of entries if it's a Map
    if (inputMap instanceof Map) {
        inputMap = Array.from(inputMap.entries());
    }
    for (let [key, value] of inputMap) {
        if (key.startsWith("CODE_UNIT_STARTED")) {
            let newMap = new Map();
            // Add the new map to the current map with the current key
            currentMap.set(key, newMap);
            stack.push(currentMap);
            // Update the current map to the new nested map
            currentMap = newMap;
            currentMap.set(key, value);
        } else if (key.startsWith("CODE_UNIT_FINISHED")) {
            // Add the current key-value pair to the current map
            currentMap.set(key, value);
            // Pop the stack to return to the previous nesting level
            currentMap = stack.pop();
        } else {
            // For other keys, simply add the key-value pair to the current map
            currentMap.set(key, value);
        }
    }

    // Return the restructured map
    return result;
}

module.exports = analyzeDebugLog;
