// const vscode = require("vscode");
// const path = require("path");
// const fs = require("fs");

// function createWebviewPanel(context, executedComponents) {
//     const panel = vscode.window.createWebviewPanel("logAnalyzer", "Log Analyzer", vscode.ViewColumn.One, {
//         enableScripts: true
//     });
//     const htmlPath = path.join(context.extensionPath, "utils", "webview", "webview.html");
//     let htmlContent = fs.readFileSync(htmlPath, "utf8");

//     // Function to process maps and generate HTML content
//     function processMap(map, parentId) {
//         let html = "";
//         let idCounter = 1;
//         for (let [key, value] of map) {
//             const currentId = `${parentId}-${idCounter}`;
//             html += `<div id="${currentId}">Key: ${key}, Value: ${value}</div>`;
//             if (value instanceof Map) {
//                 html += processMap(value, currentId); // Recursively process nested maps
//             }
//             idCounter++;
//         }
//         return html;
//     }

//     let dynamicHtmlContent = "";
//     for (let i = 0; i < executedComponents.length; i++) {
//         dynamicHtmlContent += processMap(executedComponents[i], `parent-div-${i + 1}`);
//     }

//     // Insert the generated HTML content into the main HTML template
//     htmlContent = htmlContent.replace("{{dynamicContent}}", dynamicHtmlContent);

//     panel.webview.html = htmlContent;
// }

// module.exports = createWebviewPanel;
