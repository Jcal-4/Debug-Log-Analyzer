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
    let codeUnitCounter = 0; // New counter for CODE_UNIT pairs

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes("CODE_UNIT_STARTED")) {
            codeUnitCounter += 1; // Increment the CODE_UNIT counter
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            codeUnitMap.set("CODE_UNIT_STARTED_" + codeUnitCounter, methodDetails);
            stack.push({ methodDetails, codeUnitCounter }); // Push an object with methodDetails and counter
        } else if (line.includes("METHOD_ENTRY")) {
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            // console.log("METHOD_ENTRY" + counter, methodDetails);
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
                let prevLine = lines[i - 1];
                let prevParts = prevLine.split("|");
                let prevMethodDetails = prevParts[prevParts.length - 1];
                let lastMethod = stack.pop();
                if (prevMethodDetails == methodDetails) {
                    codeUnitMap.delete("CODE_UNIT_STARTED_" + lastMethod.codeUnitCounter);
                    codeUnitCounter -= 1;
                } else if (lastMethod.methodDetails == methodDetails) {
                    codeUnitMap.set("CODE_UNIT_FINISHED_" + lastMethod.codeUnitCounter, methodDetails);
                }
            }
            if (stack.length === 0) {
                codeUnitMap = restructureMap(codeUnitMap);
                executedComponents.push(new Map(codeUnitMap));
                codeUnitMap.clear();
                codeUnitCounter = 0;
            }
        }
    }
    return executedComponents;
}

module.exports = analyzeDebugLog;

/*
    arrayOfMaps = []
    codeUnitMap = new Map();
    stack['data1','data2']

    codeUnitMap = {"CODE_UNIT_STARTED_1": data1, "method_entry2": s1, "CODE_UNIT_STARTED_3": data2, "method_entry4": s2, "CODE_UNIT_STARTED_5": data2, "CODE_UNIT_STARTED_6": data1}


    CODE_UNIT_STARTED_1.data1(map)
        method_entry2.s1(key,value)
        CODE_UNIT_STARTED_3.data2(map)
            method_entry4.s2(key,value)
        CODE_UNIT_FINISHED_5.data2(map)
    CODE_UNIT_FINISHED_6.data1(map)
*/

function restructureMap(inputMap) {
    // Stack to keep track of the current nesting level
    let stack = [];
    // Result map to store the restructured entries
    let result = new Map();
    // Current map reference, initially pointing to the result map
    let currentMap = result;

    // Convert inputMap to an array of entries if it's a Map
    if (inputMap instanceof Map) {
        inputMap = Array.from(inputMap.entries());
    } else {
        inputMap = Object.entries(inputMap);
    }

    if (!Array.isArray(inputMap)) {
        throw new TypeError("inputMap is not an array");
    }

    // Iterate over each entry in the input map
    for (let [key, value] of inputMap) {
        // If the key indicates the start of a code unit
        if (key.startsWith("CODE_UNIT_STARTED")) {
            // Create a new map for the nested structure
            let newMap = new Map();
            // Add the new map to the current map with the current key
            currentMap.set(key, newMap);
            // Push the current map onto the stack to save the current state
            stack.push(currentMap);
            // Update the current map to the new nested map
            currentMap = newMap;
            // Add the current key-value pair to the new nested map
            currentMap.set(key, value);
        } else if (key.startsWith("CODE_UNIT_FINISHED")) {
            // If the key indicates the end of a code unit
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

// // Example usage:
// const inputMap = {
//     CODE_UNIT_STARTED_1: "data1",
//     method_entry2: "s1",
//     CODE_UNIT_STARTED_3: "data2",
//     method_entry4: "s2",
//     CODE_UNIT_STARTED_5: "data3",
//     method_entry6: "s2",
//     CODE_UNIT_FINISHED_7: "data3",
//     CODE_UNIT_FINISHED_8: "data2",
//     CODE_UNIT_FINISHED_9: "data1"
// };

// // Call the function with the example input map
// const restructuredMap = restructureMap(inputMap);
// // Log the restructured map to the console
// console.log(JSON.stringify(restructuredMap, null, 2));
