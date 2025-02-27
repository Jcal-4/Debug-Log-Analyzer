const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const ignoreList = require("./ignoreList");

/**
 * Analyzes the debug log by reading the active text editor's content
 * and extracting executed components.
 */
function analyzeDebugLog(context) {
    vscode.window.showInformationMessage("Initializing Log Analyzer!");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log("No active editor found");
        return;
    } else {
        const fileUri = editor.document.uri;
        console.log("fileUri: ", fileUri);
        try {
            readFile(fileUri).then((fileData) => {
                const fileContent = new TextDecoder().decode(fileData);
                let executedComponents = retrieveComponents(fileContent);
                if (executedComponents.length === 0) {
                    vscode.window.showInformationMessage("No components found in the log file");
                } else {
                    sendMessageToWebview(context);
                    // webview(context, executedComponents);
                    // console.log(executedComponents);
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
 * @returns {Array<Map>} - An array of maps representing executed components.
 */
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
            codeUnitMap.set("CODE_UNIT_STARTED_" + codeUnitCounter, methodDetails);
            stack.push({ methodDetails, codeUnitCounter });
        } else if (line.includes("METHOD_ENTRY")) {
            let parts = line.split("|");
            let methodDetails = parts[parts.length - 1];
            let methodDetailsLowercase = methodDetails.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodDetailsLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                counter += 1;
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

/**
 * Restructures the input map to nest CODE_UNIT entries.
 * @param {Map|string} inputMap - The input map or object to restructure.
 * @returns {Map} - The restructured map.
 */
function restructureMap(inputMap) {
    let stack = [];
    let result = new Map();
    let currentMap = result;
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
            currentMap.set(key, value);
            // Pop the stack to return to the previous nesting level
            currentMap = stack.pop();
        } else {
            // For other keys, simply add the key-value pair to the current map
            currentMap.set(key, value);
        }
    }
    return result;
}

function sendMessageToWebview(context) {
    const panel = vscode.window.createWebviewPanel("logAnalyzer", "React Log Analyzer", vscode.ViewColumn.One, {
        enableScripts: true
    });

    // Resolve the path to `index.html`
    const htmlFilePath = path.join(context.extensionPath, "src", "webview", "index.html");

    // Read the HTML file content and replace resource paths
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

    // Convert the local file path to a webview URI
    const webviewUri = (file) => panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "webview", file)));

    // Replace the placeholder in the HTML with the webview URI
    htmlContent = htmlContent.replace(/src="\.\/index\.js"/g, `src="${webviewUri("index.js")}"`);

    // Set the HTML content to Webview
    panel.webview.html = htmlContent;

    // Pass data to webview (this is similar to websocket)
    panel.webview.postMessage({
        command: "initialize",
        data: {
            message: "This is a test for our passed in data"
        }
    });

    // Handle messages from React Webview
    panel.webview.onDidReceiveMessage(
        (message) => {
            if (message.command === "requestData") {
                panel.webview.postMessage({
                    command: "update",
                    data: { message: "Hello from VS Code Extension!", count: 5 }
                });
                // Add more cases here to handle other types of errors
                // vscode.window.showErrorMessage(message.text);
                // return;
            }
        },
        undefined,
        context.subscriptions
    );

    context.subscriptions.push(panel);
}

module.exports = analyzeDebugLog;
