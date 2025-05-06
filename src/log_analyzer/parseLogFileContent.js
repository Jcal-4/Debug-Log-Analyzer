const ignoreList = require("./ignoreList");

/**
 * Retrieves executed components from the file content.
 * @param {string} fileContent - The content of the log file.
 * @returns {Array<Array>} - An array of arrays representing executed components.
 */
function parseLogFileContent(fileContent) {
    const lines = fileContent
    let executedComponents = [];
    let stack = [];
    let codeUnitArray = [];
    let codeUnitCounter = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // let currentLineNumber = i + 1;
        if (line.includes("CODE_UNIT_STARTED")) {
            let methodName = "";
            codeUnitCounter += 1;
            let parts = line.split("|");
            if (parts[parts.length - 1].includes("trigger/")) {
                methodName = parts[parts.length - 2];
            } else {
                methodName = parts[parts.length - 1];
            }
            codeUnitArray.push([`CODE_UNIT_STARTED_${codeUnitCounter} - ${methodName}`, methodName]);
            // codeUnitArray.push(["CODE_UNIT_STARTED_" + codeUnitCounter, methodName]);

            stack.push({ methodName, codeUnitCounter });
        } else if (line.includes("|METHOD_ENTRY|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodKey = parts[2];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["METHOD_ENTRY " + methodKey + " - ", methodName, methodKey]);
            }
        } else if (line.includes("|METHOD_EXIT|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let methodKey = parts[2];
            let methodNameLowercase = methodName.toLowerCase();
            let shouldIgnoreMethod = false;
            ignoreList.forEach((ignoreItem) => {
                if (methodNameLowercase.includes(ignoreItem.toLowerCase())) {
                    shouldIgnoreMethod = true;
                }
            });
            if (!shouldIgnoreMethod) {
                codeUnitArray.push(["METHOD_EXIT " + methodKey + " - ", methodName, methodKey]);
            }
        } else if (line.includes("|FLOW_START_INTERVIEW_BEGIN|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["FLOW_START_INTERVIEW_BEGIN - ", methodName]);
        } else if (line.includes("NAMED_CREDENTIAL_REQUEST")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["NAMED_CREDENTIAL_REQUEST - ", methodName]);
        } else if (line.includes("|NAMED_CREDENTIAL_RESPONSE|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["NAMED_CREDENTIAL_RESPONSE - ", methodName]);
        } else if (line.includes("|FLOW_START_INTERVIEWS_ERROR|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["FLOW_START_INTERVIEWS_ERROR - ", methodName]);
        } else if (line.includes("|CALLOUT_REQUEST|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["CALLOUT_REQUEST - ", methodName]);
        } else if (line.includes("|CALLOUT_RESPONSE|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["CALLOUT_RESPONSE - ", methodName]);
        } else if (line.includes("|EXCEPTION_THROWN|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let apexLine = parts[2];

            codeUnitArray.push(["EXCEPTION_THROWN " + apexLine + " - ", methodName]);
        } else if (line.includes("|FATAL_ERROR|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["FATAL_ERROR - ", methodName]);
        } else if (line.includes("|VALIDATION_FAIL")) {
            codeUnitArray.push(["VALIDATION_FAIL", ""]);
        } else if (line.includes("|VALIDATION_PASS")) {
            codeUnitArray.push(["VALIDATION_PASS", ""]);
        } else if (line.includes("|VALIDATION_FORMULA|")) {
            let parts = line.split("|");

            let validationFormula = parts.slice(2).join("|");
            let nextLine = lines[i + 1];
            while (!nextLine.includes("|VALIDATION_PASS") && !nextLine.includes("|VALIDATION_FAIL")) {
                i++;
                validationFormula += "\n" + nextLine;
                nextLine = lines[i + 1];
            }
            codeUnitArray.push(["VALIDATION_FORMULA - ", validationFormula]);
        } else if (line.includes("|VALIDATION_RULE|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["VALIDATION_RULE - ", methodName]);
        } else if (line.includes("|VALIDATION_ERROR|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];

            codeUnitArray.push(["VALIDATION_ERROR - ", methodName]);
        } else if (line.includes("|USER_DEBUG|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let apexLine = parts[2];

            codeUnitArray.push(["USER_DEBUG " + apexLine + " - ", methodName]);
        } else if (line.includes("|VARIABLE_ASSIGNMENT|")) {
            let parts = line.split("|");
            let variableName = "";
            let variableValue = "";
            let apexLine = parts[2];
            if (parts.length == 6) {
                variableName = parts[parts.length - 3];
                variableValue = parts[parts.length - 2];
            } else if (parts.length == 5) {
                variableName = parts[parts.length - 2];
                variableValue = parts[parts.length - 1];
            }
            if (variableName != "this" && variableName != "t" && variableName != "handler" && variableName != "field" && variableName != "tName") {
                codeUnitArray.push(["VARIABLE_ASSIGNMENT " + apexLine + " - (" + variableName + ") ", variableValue]);
            }
        } else if (line.includes("|SOQL_EXECUTE_BEGIN|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let apexLine = parts[2];
            codeUnitArray.push(["SOQL_EXECUTE_BEGIN " + apexLine + " - ", methodName]);
        } else if (line.includes("|SOQL_EXECUTE_END|")) {
            let parts = line.split("|");
            let methodName = parts[parts.length - 1];
            let apexLine = parts[2];
            codeUnitArray.push(["SOQL_EXECUTE_END " + apexLine + " - ", methodName]);
        } else if (line.includes("|DML_BEGIN|")) {
            let parts = line.split("|");
            let methodName = parts.slice(3).join("|");
            let apexLine = parts[2];
            codeUnitArray.push(["DML_BEGIN " + apexLine + " - ", methodName]);
        } else if (line.includes("|DML_END|")) {
            let parts = line.split("|");
            // let methodName = parts[parts.length - 1];
            let apexLine = parts[2];
            codeUnitArray.push(["DML_END " + apexLine, ""]);
        } else if (line.includes("|CODE_UNIT_FINISHED|")) {
            // codeUnitArray.push([`CODE_UNIT_STARTED_${codeUnitCounter} : ${methodName}`, methodName]);

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
                        (entry) => !entry[0].includes("CODE_UNIT_STARTED_" + lastMethod.codeUnitCounter)
                        // (entry) => entry[0] !== "CODE_UNIT_STARTED_" + lastMethod.codeUnitCounter
                    );
                    codeUnitCounter -= 1;
                } else if (lastMethod.methodName == methodName) {
                    // Store the method details in the array with a unique key
                    codeUnitArray.push(["CODE_UNIT_FINISHED_" + lastMethod.codeUnitCounter + " - ", methodName]);
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
    if (executedComponents.length === 0 && codeUnitArray.length > 0) {
        console.log("codeUnitArray: ", codeUnitArray);
        let result = { parsedContent: codeUnitArray, codeUnitStarted: false };
        return result;
    } else {
        console.log("executedComponents: ", executedComponents);
        let result = { parsedContent: executedComponents, codeUnitStarted: true };
        return result;
    }
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

    for (let [key, value, extra = null] of inputArray) {
        if (key.startsWith("CODE_UNIT_STARTED")) {
            let newArray = [];
            // Add the new array to the current array with the current key
            currentArray.push([key, newArray, extra]);
            stack.push(currentArray);
            // Update the current array to the new nested array
            currentArray = newArray;
            // currentArray.push([key, value, extra]);
        } else if (key.startsWith("CODE_UNIT_FINISHED")) {
            currentArray.push([key, value, extra]);
            // Pop the stack to return to the previous nesting level
            currentArray = stack.pop();
        } else {
            // For other keys, simply add the key-value pair to the current array
            currentArray.push([key, value, extra]);
        }
    }
    return result;
}

module.exports = parseLogFileContent;
