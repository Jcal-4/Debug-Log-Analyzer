import React, { useEffect, useState, useRef } from "react";
import { debounce } from "lodash";
import "./index.css"; // Import the CSS file
import { Input, CheckboxGroup, Checkbox, Card, CardBody, Spinner, Code, Tabs, Tab, ScrollShadow } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

const App = () => {
    console.log("App component re-rendered");
    const [data, setData] = useState(null);
    const [codeUnitStarted, setCodeUnitStarted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matchingCount, setMatchingCount] = useState(0);
    const [fatalErrorsCount, setFatalErrorsCount] = useState(0);
    const [exceptionCount, setExceptionCount] = useState(0);
    const [userDebugCount, setuserDebugCount] = useState(0);
    const [matchingItems, setMatchingItems] = useState([]);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterChangeTrigger, setFilterChangeTrigger] = useState(0);
    const itemRefs = useRef([]);

    /**
     * On initial load, send a message to the extension to let it know the webview has loaded.
     * This will allow the extension to send back the executed components data.
     */
    useEffect(() => {
        // we can't import vscode api directly so we need to use acquireVsCodeApi
        const vscode = acquireVsCodeApi();

        vscode.postMessage({ command: "webviewLoaded" });

        // Listen for response from the extension
        window.addEventListener("message", (event) => {
            const message = event.data;
            if (message.command === "initialize") {
                console.log("initialize (executedComponents Received)", message.data.executedComponents);
                let newArray = message.data.executedComponents;
                setData(newArray);
                setCodeUnitStarted(message.data.codeUnitStarted || false);
            }
        });

        return () => {
            window.removeEventListener("message", () => {});
        };
    }, []);

    // Add a useEffect to calculate total errors when `data` changes
    useEffect(() => {
        let fatalErrorCount = 0;
        let exceptionCount = 0;
        let userDebugCount = 0;
        if (data) {
            const flattenedData = flattenArray(data);
            flattenedData.forEach((item) => {
                if (item.isFatalError) {
                    fatalErrorCount++;
                }
                if (item.isException) {
                    exceptionCount++;
                }
                if (item.isUserDebug) {
                    userDebugCount++;
                }
            });

            setFatalErrorsCount(fatalErrorCount);
            setExceptionCount(exceptionCount);
            setuserDebugCount(userDebugCount);
        }
    }, [data]); // Dependency array ensures this runs when `data` changes

    /**
     * Recursively flattens a nested array or object structure into a flat array of key-value pairs.
     *
     * @param {Array} arr - The input array to be flattened. Can contain nested arrays, objects, or primitive values.
     * @param {number} [currentLevel=0] - The current depth level of recursion, used to track the nesting level.
     * @returns {Array<{ value: any, level: number }>} - A flattened array of objects, where each object contains:
     *   - `value`: The corresponding value from the original structure.
     *   - `level`: The depth level of the value in the original structure.
     */
    const flattenArray = (nestedData, currentLevel = 0) => {
        let errorCount = 0;
        let result = nestedData.reduce((flattenedArray, currentItem) => {
            if (Array.isArray(currentItem)) {
                return flattenedArray.concat(processAndFlattenArray(currentItem, currentLevel));
            } else if (typeof currentItem === "object" && currentItem !== null) {
                // Handle objects by converting them to entries and flattening
                return flattenedArray.concat(flattenArray(Object.entries(currentItem), currentLevel));
            } else {
                // Handle primitive values
                return flattenedArray.concat({ value: currentItem, level: currentLevel });
            }
        }, []);

        return result;
    };

    /**
     * Processes an array of key-value pairs or nested arrays and flattens it into a structured format.
     * This method is specifically designed to handle Salesforce log data and classify events like
     * CODE_UNIT_STARTED, METHOD_ENTRY, METHOD_EXIT, etc.
     *
     * @param {Array} dataItem ['CODE_UNIT_STARTED_1', Array[]] - The input array to be processed.
     * @param {number} [currentLevel=0] - The current depth level of recursion, used to track the nesting level.
     * @returns {Array} - A flattened array of objects with structured event data.
     */
    const processAndFlattenArray = (dataItem, currentLevel = 0) => {
        if (dataItem.length >= 2 && typeof dataItem[0] === "string") {
            const isValueArray = Array.isArray(dataItem[1]);
            const includesCodeUnitStarted = dataItem[0].includes("CODE_UNIT_STARTED");
            const includesMethodEntry = dataItem[0].includes("METHOD_ENTRY");
            const includesMethodExit = dataItem[0].includes("METHOD_EXIT");
            const includesVariableAssignment = dataItem[0].includes("VARIABLE_ASSIGNMENT");
            const includesUserDebug = dataItem[0].includes("USER_DEBUG");
            const includesFlow = dataItem[0].includes("FLOW_");
            const includesValidation = dataItem[0].includes("VALIDATION");
            const includesSOQL = dataItem[0].includes("SOQL");
            const includesException = dataItem[0].includes("EXCEPTION_THROWN");
            const includesFatalError = dataItem[0].includes("FATAL_ERROR");
            const isCodeUnitStarted = isValueArray && includesCodeUnitStarted;

            if (Array.isArray(dataItem[1])) {
                // Case: [string, [array]]
                const nestedItems = flattenArray(dataItem[1], currentLevel + 1).map((item) => ({
                    ...item,
                    nested: true
                }));
                return [{ event: `${dataItem[0]}`, nested: false, codeUnitStarted: isCodeUnitStarted, level: currentLevel }, ...nestedItems];
            } else if (typeof dataItem[1] === "string") {
                // Case: [string, string]
                let result = [
                    {
                        key: `${dataItem[2]}`,
                        event: `${dataItem[0]}`,
                        value: `${dataItem[1]}`,
                        codeUnitStarted: isCodeUnitStarted,
                        isUserDebug: includesUserDebug,
                        isMethodEntry: includesMethodEntry,
                        isMethodExit: includesMethodExit,
                        isVariableAssignment: includesVariableAssignment,
                        isFlow: includesFlow,
                        isValidation: includesValidation,
                        isSOQL: includesSOQL,
                        isException: includesException,
                        isFatalError: includesFatalError,
                        level: currentLevel
                    }
                ];
                return result;
            }
        }
        return flattenArray(dataItem, currentLevel);
    };

    /**
     * Handles click of Expand button.
     * @param {event} - The event object.
     */
    const handleCodeStartedButtonClick = (e) => {
        // Toggle the button text and background color
        const button = e.currentTarget;
        const isExpandAll = button.innerHTML === "Expand All";
        button.innerHTML = isExpandAll ? "Hide All" : "Expand All";
        button.style.backgroundColor = isExpandAll ? "#1F2833" : "#007acc";
        // button.classList.toggle("button-clicked");

        let nextElement = e.currentTarget.parentElement.nextElementSibling;

        while (nextElement && nextElement.classList.contains("data-item") && nextElement.classList.contains("nested-array")) {
            if (isExpandAll && nextElement.classList.contains("hide")) {
                nextElement.classList.remove("hide");
            } else if (!isExpandAll && !nextElement.classList.contains("hide")) {
                nextElement.classList.add("hide");
            }
            // Disable the button inside the nextElement
            const nextElementButton = nextElement.querySelector("button");
            if (isExpandAll && nextElementButton?.innerHTML === "Expand All") {
                nextElementButton.innerHTML = "Hide All";
                nextElementButton.classList.remove("button-clicked");
            }

            nextElement = nextElement.nextElementSibling;
        }
    };

    const handleInnerCodeStartedButtonClick = (e) => {
        // Toggle the button text and background color
        const button = e.currentTarget;
        const isExpandAll = button.innerHTML === "Expand All";
        button.innerHTML = isExpandAll ? "Hide All" : "Expand All";
        button.classList.toggle("button-clicked");

        let codeUnitElement = button.parentElement;
        let codeUnitVal = codeUnitElement.querySelector(".data-event").innerHTML.match(/CODE_UNIT_STARTED_(\d+)/)?.[1];

        let nextElement = e.currentTarget.parentElement.nextElementSibling;
        let nextElementMatchesCurrent = false;
        // check if nextElement is a data-item and nested-array, if so then change
        while (
            nextElement &&
            nextElement.classList.contains("data-item") &&
            nextElement.classList.contains("nested-array") &&
            !nextElementMatchesCurrent
        ) {
            let nextElementValue = nextElement.querySelector(".data-event").innerHTML;
            let computedStyle = window.getComputedStyle(nextElement);

            // Check if nextElement value CODE_UNIT_FINISHED matches CODE_UNIT_STARTED
            console.log("nextElementValue", nextElementValue);
            if (nextElementValue && nextElementValue.includes("CODE_UNIT_FINISHED_" + codeUnitVal)) {
                nextElementMatchesCurrent = true;
                nextElement.classList.toggle("hide");

                break;
            } else {
                // nextElement.classList.toggle("hide");
                if (isExpandAll && nextElement.classList.contains("hide")) {
                    nextElement.classList.remove("hide");
                } else if (!isExpandAll && !nextElement.classList.contains("hide")) {
                    nextElement.classList.add("hide");
                }
                // Disable the button inside the nextElement
                const nextElementButton = nextElement.querySelector("button");
                if (isExpandAll && nextElementButton?.innerHTML === "Expand All") {
                    nextElementButton.innerHTML = "Hide All";
                    nextElementButton.classList.remove("button-clicked");
                }
            }

            nextElement = nextElement.nextElementSibling;
        }
    };

    const handleMethodEntryButtonClick = (e) => {
        let methodEntryCounter = 0;
        // Toggle the button text and background color
        const button = e.currentTarget;
        const isExpandAll = button.innerHTML === "Expand All";
        button.innerHTML = isExpandAll ? "Hide All" : "Expand All";
        button.classList.toggle("button-clicked");

        let methodElement = button.parentElement;
        let methodKey = methodElement.getAttribute("data-key");
        let methodValue = methodElement.querySelector(".data-value").innerHTML;
        // Target the next element after the button
        let nextElement = e.currentTarget.parentElement.nextElementSibling;
        let nextElementMatchesCurrent = false;
        while (nextElement && nextElement.classList.contains("data-item") && !nextElementMatchesCurrent) {
            let nextElementKey = nextElement.getAttribute("data-key");
            let nextElementValue = nextElement.querySelector(".data-value").innerHTML;
            let computedStyle = window.getComputedStyle(nextElement);
            // Count for method entries matching the methodValue
            if (nextElementKey === methodKey && methodValue.includes(nextElementValue) && nextElement.classList.contains("method-entry")) {
                methodEntryCounter++;
                if (isExpandAll && nextElement.classList.contains("hide")) {
                    nextElement.classList.remove("hide");
                } else if (!isExpandAll && !nextElement.classList.contains("hide")) {
                    nextElement.classList.add("hide");
                }
                // Disable the button inside the nextElement
                const nextElementButton = nextElement.querySelector("button");
                if (isExpandAll && nextElementButton.innerHTML === "Expand All") {
                    nextElementButton.innerHTML = "Hide All";
                    nextElementButton.classList.remove("button-clicked");
                }
            } else if (
                nextElementKey === methodKey &&
                methodValue.includes(nextElementValue) &&
                nextElement.classList.contains("method-exit") &&
                methodEntryCounter > 0
            ) {
                methodEntryCounter--;
                if (isExpandAll && nextElement.classList.contains("hide")) {
                    nextElement.classList.remove("hide");
                } else if (!isExpandAll && !nextElement.classList.contains("hide")) {
                    nextElement.classList.add("hide");
                }
            } else if (
                nextElementKey === methodKey &&
                methodValue.includes(nextElementValue) &&
                nextElement.classList.contains("method-exit") &&
                methodEntryCounter === 0
            ) {
                nextElementMatchesCurrent = true;
                if (isExpandAll && nextElement.classList.contains("hide")) {
                    nextElement.classList.remove("hide");
                } else if (!isExpandAll && !nextElement.classList.contains("hide")) {
                    nextElement.classList.add("hide");
                }
                break;
            } else {
                if (isExpandAll && nextElement.classList.contains("hide")) {
                    nextElement.classList.remove("hide");
                } else if (!isExpandAll && !nextElement.classList.contains("hide")) {
                    nextElement.classList.add("hide");
                }
                // Disable the button inside the nextElement
                const nextElementButton = nextElement.querySelector("button");
                if (isExpandAll && nextElementButton?.innerHTML === "Expand All") {
                    nextElementButton.innerHTML = "Hide All";
                    nextElementButton.classList.remove("button-clicked");
                }
            }
            nextElement = nextElement.nextElementSibling;
        }
    };

    /**
     * Highlights text depending on if searchTerm matches part of the string.
     * @param {value} - either the event or value of the data item
     * @param {searchTerm} - The term to search for in the value.
     */
    const highlightSearchTerm = (value, searchTerm) => {
        if (!value) return value; // Ensure value is defined
        if (!searchTerm || searchTerm.length < 3) return value;
        // Escape special characters in the search term
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const parts = value.split(new RegExp(`(${escapedSearchTerm})`, "gi"));
        return parts.map((part, index) =>
            part.toLowerCase() === searchTerm.toLowerCase() ? (
                <span key={index} className="highlight">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    // Effect used to handle search bar input and debounce the search term.
    useEffect(() => {
        if (searchTerm && searchTerm.length > 2) {
            const handler = debounce(() => {
                setDebouncedSearchTerm(searchTerm);
            }, 400); // Debounce the search term for 300ms

            handler();

            return () => {
                // Cleanup the debounce handler if searchTerm changes before the timeout
                handler.cancel();
            };
        }
    }, [searchTerm]);

    // Effect to handle the debounced search term
    useEffect(() => {
        if (!data) return;

        if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) {
            // Clear matching items and reset matching count if search term is invalid
            setMatchingItems([]);
            setMatchingCount(0);
            setCurrentIndex(0);
            return;
        }

        const flattenedData = flattenArray(data);
        console.log("Flattened Data:", flattenedData); // Log the flattened data
        const matchingItems = flattenedData
            .map((item, index) => ({ item, index }))
            .filter(({ item, index }) => {
                const element = itemRefs.current[index];
                if (!element) return false; // Ensure the element exists

                const computedStyle = window.getComputedStyle(element);
                if (computedStyle.display === "none") return false; // Skip if the element is hidden

                return (
                    (item.value && item.value.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (item.event && item.event.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            });

        setMatchingItems(matchingItems); // Update the matching items
        setMatchingCount(matchingItems.length); // Update the matching count
    }, [debouncedSearchTerm, filterChangeTrigger]);

    // Effect to handle scrolling to the current index of the matching items
    useEffect(() => {
        if (matchingItems.length > 0) {
            const nearestIndex = matchingItems[currentIndex % matchingItems.length].index;
            if (itemRefs.current[nearestIndex]) {
                itemRefs.current[nearestIndex].scrollIntoView({ behavior: "smooth", block: "center" });
            }
        } else {
            setMatchingCount(0); // Reset the matching count if search term is empty
        }
    }, [currentIndex, matchingItems]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % matchingItems.length);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % matchingItems.length);
        console.log("handleNext", currentIndex);
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + matchingItems.length) % matchingItems.length);
    };

    const handleCheckboxChange = (e) => {
        const { checked, value } = e.target;
        console.log(e.target);
        console.log("value -->", value, "checked-->", checked);
        let assignmentVariables = [];

        if (checked) {
            assignmentVariables = document.querySelectorAll(`.${value}`);
            assignmentVariables.forEach((item) => {
                item.style.display = "block";
            });
            if (value == "method-entry") {
                assignmentVariables = document.querySelectorAll(".method-exit");
                assignmentVariables.forEach((item) => {
                    item.style.display = "block";
                });
            }
        } else {
            assignmentVariables = document.querySelectorAll(`.${value}`);
            assignmentVariables.forEach((item) => {
                item.style.display = "none";
            });
            if (value == "method-entry") {
                assignmentVariables = document.querySelectorAll(".method-exit");
                assignmentVariables.forEach((item) => {
                    item.style.display = "none";
                });
            }
        }

        setFilterChangeTrigger((prev) => prev + 1); // Trigger a re-render to update the UI
    };

    return (
        <div>
            {data ? (
                <Card className="h-screen flex flex-row rounded-none">
                    <CardBody className="filter-container h-screen overflow-y-auto relative">
                        <div className="sticky top-0">
                            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                <Input
                                    size={"sm"}
                                    label="Search..."
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (e.target.value === "" || e.target.value.length < 3) {
                                            // If search term is empty or less than 3 characters
                                            setMatchingCount(0); // Reset matching count if search term is empty
                                            setMatchingItems([]); // Clear matching items
                                        } else {
                                            setCurrentIndex(0); // Reset index when search term changes
                                        }
                                    }}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            {searchTerm.length > 2 && (
                                <div className="search-popup">
                                    {matchingCount > 0 ? currentIndex + 1 : 0} of {matchingCount}
                                    <div className="flex items-center">
                                        <FontAwesomeIcon className="directional-arrow p-1" icon={faArrowUp} onClick={handlePrevious} />
                                        <FontAwesomeIcon className="directional-arrow p-1" icon={faArrowDown} onClick={handleNext} />
                                    </div>
                                </div>
                            )}
                            <div className="mt-2 text-customBlue">
                                <Card>
                                    <CardBody className="sticky top-0">
                                        <CheckboxGroup
                                            defaultValue={["flow", "method-entry", "validation-rule", "variable-assignment", "soql"]}
                                            label="Select Elements"
                                        >
                                            <Checkbox value="flow" onChange={handleCheckboxChange}>
                                                Flows
                                            </Checkbox>
                                            <Checkbox value="method-entry" onChange={handleCheckboxChange}>
                                                Method Entry/Exit
                                            </Checkbox>
                                            <Checkbox value="soql" onChange={handleCheckboxChange}>
                                                SOQL
                                            </Checkbox>
                                            <Checkbox value="validation-rule" onChange={handleCheckboxChange}>
                                                Validations
                                            </Checkbox>
                                            <Checkbox className="text-customBlue" value="variable-assignment" onChange={handleCheckboxChange}>
                                                Variable Assignment
                                            </Checkbox>
                                        </CheckboxGroup>
                                    </CardBody>
                                </Card>
                                <div className="mt-2 mb-2">
                                    <Code className="mt-0" color="danger">
                                        Exceptions Thrown: {exceptionCount}
                                    </Code>
                                    <Code className="mt-2" color="danger">
                                        Fatal Errors: {fatalErrorsCount}
                                    </Code>
                                    <Code className="mt-2" color="warning">
                                        User Debugs: {userDebugCount}
                                    </Code>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <div className="data-container">
                        <Card className="h-screen rounded-r-none">
                            <Tabs
                                classNames={{
                                    tabList: "flex justify-center gap-6 w-full rounded-none p-0 border-b border-divider",
                                    cursor: "w-full bg-[#22d3ee]",
                                    tab: "max-w-fit px-0 h-9",
                                    tabContent: "group-data-[selected=true]:text-customBlue",
                                    flex: "flex justify-center"
                                }}
                                aria-label="Tabs variants"
                                variant="underlined"
                            >
                                <Tab title="Analyzed Debug Log">
                                    <CardBody className="h-[calc(100vh-48px)] p-0">
                                        <ScrollShadow className="pb-6">
                                            {flattenArray(data).map((item, index, array) => {
                                                // Determine if the current item is within a method-entry and method-exit block
                                                let additionalIndent = 0;
                                                for (let i = index - 1; i >= 0; i--) {
                                                    if (array[i].isMethodEntry) {
                                                        additionalIndent += 20; // Add extra indentation for each nested method-entry
                                                    }
                                                    if (array[i].isMethodExit) {
                                                        additionalIndent -= 20; // Remove indentation for method-exit
                                                    }
                                                }

                                                return (
                                                    <div
                                                        data-key={item.key || index}
                                                        key={item.key}
                                                        className={`data-item ${item.nested ? "nested-array" : ""} ${item.codeUnitStarted ? "code-unit-started" : ""} ${item.isUserDebug ? "user-debug" : ""} ${item.isMethodEntry ? "method-entry" : ""} ${item.isVariableAssignment ? "variable-assignment" : ""} ${item.isFlow ? "flow" : ""} ${item.isValidation ? "validation-rule" : ""} ${item.isSOQL ? "soql" : ""}  ${item.isMethodExit ? "method-exit" : ""} ${item.isException ? "exception-thrown" : ""} ${item.isFatalError ? "fatal-error" : ""} ${index === matchingItems[currentIndex]?.index ? "current-index" : ""}`}
                                                        ref={(el) => (itemRefs.current[index] = el)}
                                                        style={{ marginLeft: `${item.level * 20 + additionalIndent}px` }} // Indent based on nesting level
                                                    >
                                                        {item.codeUnitStarted && (
                                                            <span className={`data-event code-unit-started`}>
                                                                {(() => {
                                                                    let splitString = item.event.split(":");
                                                                    let firstPart = splitString.slice(0, 2).join(":");
                                                                    return highlightSearchTerm(firstPart, searchTerm);
                                                                })()}
                                                            </span>
                                                        )}
                                                        {item.codeUnitStarted && (
                                                            <span className={`data-value code-unit-started`}>
                                                                {(() => {
                                                                    let splitString = item.event.split(":");
                                                                    let firstPart = splitString.slice(2).join(":");
                                                                    return highlightSearchTerm(firstPart, searchTerm);
                                                                })()}
                                                            </span>
                                                        )}
                                                        {!item.codeUnitStarted && !item.isVariableAssignment && (
                                                            <span className={`data-event`}>{highlightSearchTerm(item.event, searchTerm)}</span>
                                                        )}
                                                        {!item.codeUnitStarted && !item.isVariableAssignment && (
                                                            <span className="data-value">{highlightSearchTerm(item.value, searchTerm)}</span>
                                                        )}

                                                        {!item.nested && codeUnitStarted && (
                                                            <button className="top-level-button" onClick={handleCodeStartedButtonClick}>
                                                                Hide All
                                                            </button>
                                                        )}
                                                        {item.codeUnitStarted && item.nested && (
                                                            <button className="inner-level-button" onClick={handleInnerCodeStartedButtonClick}>
                                                                Hide All
                                                            </button>
                                                        )}
                                                        {item.isMethodEntry && (
                                                            <button className="inner-level-button" onClick={handleMethodEntryButtonClick}>
                                                                Hide All
                                                            </button>
                                                        )}
                                                        {item.isVariableAssignment && (
                                                            <>
                                                                <span className={`data-event`}>
                                                                    {(() => {
                                                                        const firstPart = item.event.split(")")[0] + ") - ";
                                                                        return highlightSearchTerm(firstPart, searchTerm);
                                                                    })()}
                                                                </span>
                                                                <span className={`data-variable-name`}>
                                                                    {(() => {
                                                                        const match = item.event.match(/\(([^)]+)\).*?\(([^)]+)\)/);
                                                                        if (match && match[2]) {
                                                                            return highlightSearchTerm("(" + match[2] + ") ", searchTerm);
                                                                        }
                                                                    })()}
                                                                </span>
                                                                <span className={`data-value`}>{highlightSearchTerm(item.value, searchTerm)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </ScrollShadow>
                                    </CardBody>
                                </Tab>
                                <Tab title="User Debugs">
                                    <div>Hi</div>
                                </Tab>
                            </Tabs>
                        </Card>
                    </div>
                </Card>
            ) : (
                <div className="flex justify-center items-center h-screen">
                    <Spinner classNames={{ label: "text-foreground mt-4" }} label="Processing Data..." variant="gradient" />
                </div>
            )}
        </div>
    );
};

export default App;
