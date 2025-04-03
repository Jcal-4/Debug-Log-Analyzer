const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const ignoreList = require("./ignoreList");

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
                let executedComponents = retrieveComponents(fileContent);
                if (executedComponents.length === 0) {
                    vscode.window.showInformationMessage("No components found in the log file");
                } else {
                    console.log("executedComponents: ", executedComponents);
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
 * Retrieves executed components from the file content.
 * @param {string} fileContent - The content of the log file.
 * @returns {Array<Array>} - An array of arrays representing executed components.
 */
function retrieveComponents(fileContent) {
    const lines = fileContent.split("\n");
    let executedComponents = [];
    let stack = [];
    let codeUnitArray = [];
    let codeUnitCounter = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let currentLineNumber = i + 1;
        if (line.includes("CODE_UNIT_STARTED")) {
            let methodName = "";
            codeUnitCounter += 1;
            let parts = line.split("|");
            if (parts[parts.length - 1].includes("trigger/")) {
                methodName = parts[parts.length - 2];
            } else {
                methodName = parts[parts.length - 1];
            }
            codeUnitArray.push(["CODE_UNIT_STARTED_" + codeUnitCounter, methodName]);
            stack.push({ methodName, codeUnitCounter });
        } else if (line.includes("|METHOD_ENTRY|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["METHOD_ENTRY" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("|METHOD_EXIT|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["METHOD_EXIT" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("FLOW_START_INTERVIEW_BEGIN")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["FLOW_START_INTERVIEW_BEGIN" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("NAMED_CREDENTIAL_REQUEST")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["NAMED_CREDENTIAL_REQUEST" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("NAMED_CREDENTIAL_RESPONSE")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["NAMED_CREDENTIAL_RESPONSE" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("FLOW_START_INTERVIEWS_ERROR")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["FLOW_START_INTERVIEWS_ERROR" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("CALLOUT_REQUEST")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["CALLOUT_REQUEST" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("CALLOUT_RESPONSE")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["CALLOUT_RESPONSE" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("EXCEPTION_THROWN")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["EXCEPTION_THROWN" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("FATAL_ERROR")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["FATAL_ERROR" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("VALIDATION_FAIL")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["VALIDATION_FAIL" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("VALIDATION_PASS")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["VALIDATION_PASS" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("VALIDATION_RULE")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["VALIDATION_RULE" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("VALIDATION_ERROR")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["VALIDATION_ERROR" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("USER_DEBUG")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["USER_DEBUG" + "(Line: " + currentLineNumber + ") ", methodName]);
            }
        } else if (line.includes("VARIABLE_ASSIGNMENT")) {
            let parts = line.split("|");
            let variableName = parts[parts.length - 3];
            let variableValue = parts[parts.length - 2];
            const constantVariable = parts.length != 6;
            if (
                !constantVariable &&
                variableName != "this" &&
                variableName != "t" &&
                variableName != "handler" &&
                variableName != "field" &&
                variableName != "tName" &&
                !variableName.includes("this.")
            ) {
                codeUnitArray.push([
                    "VARIABLE_ASSIGNMENT" + "(Line: " + currentLineNumber + ") " + "- (" + variableName + ") ",
                    variableValue
                ]);
            }
        } else if (line.includes("CODE_UNIT_FINISHED")) {
            let parts = line.split("|");
            let methodName = "";
            if (parts[parts.length - 1].includes("trigger/")) {
                methodName = parts[parts.length - 2];
            } else {
                methodName = parts[parts.length - 1];
            }
            if (stack.length > 0) {
                let prevLine = lines[i - 1];
                prevLine = prevLine.split("|");
                // let prevMethodName = prevLine[prevLine.length - 1];
                let prevMethodName = "";
                if (prevLine[prevLine.length - 1].includes("trigger/")) {
                    prevMethodName = prevLine[prevLine.length - 2];
                } else {
                    prevMethodName = prevLine[prevLine.length - 1];
                }
                let lastMethod = stack.pop();
                if (prevMethodName == methodName) {
                    // Remove the corresponding CODE_UNIT_STARTED entry if it matches
                    codeUnitArray = codeUnitArray.filter(
                        (entry) => entry[0] !== "CODE_UNIT_STARTED_" + lastMethod.codeUnitCounter
                    );
                    codeUnitCounter -= 1;
                } else if (lastMethod.methodName == methodName) {
                    // Store the method details in the array with a unique key
                    codeUnitArray.push(["CODE_UNIT_FINISHED_" + lastMethod.codeUnitCounter, methodName]);
                }
            }
            if (stack.length === 0) {
                // Restructure the array and add it to the executed components
                codeUnitArray = restructureArray(codeUnitArray);
                executedComponents.push([...codeUnitArray]);
                codeUnitArray = [];
                codeUnitCounter = 0;
            }
        }
    }
    return executedComponents;
}

/**
 * Restructures the input array to nest CODE_UNIT entries.
 * @param {Array} inputArray - The input array to restructure.
 * @returns {Array} - The restructured array.
 */
function restructureArray(inputArray) {
    let stack = [];
    let result = [];
    let currentArray = result;

    for (let [key, value] of inputArray) {
        if (key.startsWith("CODE_UNIT_STARTED")) {
            let newArray = [];
            // Add the new array to the current array with the current key
            currentArray.push([key, newArray]);
            stack.push(currentArray);
            // Update the current array to the new nested array
            currentArray = newArray;
            currentArray.push([key, value]);
        } else if (key.startsWith("CODE_UNIT_FINISHED")) {
            currentArray.push([key, value]);
            // Pop the stack to return to the previous nesting level
            currentArray = stack.pop();
        } else {
            // For other keys, simply add the key-value pair to the current array
            currentArray.push([key, value]);
        }
    }
    return result;
}

/**
 * Creates a webview panel to display the log analysis results.
 * @param {Array} executedComponents - The input array to restructure.
 */
function sendMessageToWebview(context, executedComponents) {
    console.log("executedComponents: ", executedComponents);
    const panel = vscode.window.createWebviewPanel("logAnalyzer", "React Log Analyzer", vscode.ViewColumn.One, {
        retainContextWhenHidden: true,
        enableScripts: true,
        enableFindWidget: true
    });

    // Resolve the path to `index.html`
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

    // Retry Sending Messages if above method is not working
    // function sendMessageWithRetry(panel, message, retries = 5, delay = 500) {
    //     let attempt = 0;

    //     const send = () => {
    //         if (panel.webview) {
    //             panel.webview.postMessage(message);
    //         } else if (attempt < retries) {
    //             attempt++;
    //             setTimeout(send, delay);
    //         }
    //     };

    //     send();
    // }

    // sendMessageWithRetry(panel, {
    //     command: "initialize",
    //     data: { executedComponents: executedComponents }
    // });

    context.subscriptions.push(panel);
}

module.exports = analyzeDebugLog;
