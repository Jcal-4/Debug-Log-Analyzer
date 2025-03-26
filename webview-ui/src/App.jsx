import React, { useEffect, useState, useRef } from "react";
import "./index.css"; // Import the CSS file
import { Input } from "@heroui/react";

const App = () => {
    // terms needed to be defined to use in html components
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matchingCount, setMatchingCount] = useState(0); // State to keep track of matching items count
    const [matchingItems, setMatchingItems] = useState([]); // State to store matching items with original indices
    const itemRefs = useRef([]);

    useEffect(() => {
        // we can't import vscode api directly so we need to use acquireVsCodeApi
        const vscode = acquireVsCodeApi();

        // Send back message to extension if needed
        vscode.postMessage({ command: "webviewLoaded" });

        // Listen for messages from the extension
        window.addEventListener("message", (event) => {
            const message = event.data;
            if (message.command === "initialize") {
                console.log("initialize (executedComponents Received)", message.data.executedComponents);
                let newArray = message.data.executedComponents;
                setData(newArray);
            }
        });

        return () => {
            window.removeEventListener("message", () => {});
        };
    }, []);

    const flattenArray = (arr, parentKey = "") => {
        return arr.reduce((acc, val, index) => {
            const key = parentKey ? `${parentKey}.${index}` : `${index}`;

            if (Array.isArray(val)) {
                return acc.concat(flattenArrayFromArray(val, key));
            } else if (typeof val === "object" && val !== null) {
                return acc.concat(flattenArray(Object.entries(val), key));
            } else {
                return acc.concat({ key, value: val });
            }
        }, []);
    };

    // Val: ['CODE_UNIT_STARTED_1', Array[]]
    // Val: ['METHOD_ENTRY_1', 'makeData()']
    const flattenArrayFromArray = (val, key) => {
        if (val.length === 2 && typeof val[0] === "string") {
            const isValArray = Array.isArray(val[1]);
            const includesCodeUnitStarted = val[0].includes("CODE_UNIT_STARTED_");
            const includesMethodEntry = val[0].includes("METHOD_ENTRY");
            const includesMethodExit = val[0].includes("METHOD_EXIT");
            const includesVariableAssignment = val[0].includes("VARIABLE_ASSIGNMENT");
            const includesUserDebug = val[0].includes("USER_DEBUG");
            const includesFlow = val[0].includes("FLOW_");
            const includesValidation = val[0].includes("VALIDATION");
            const isCodeUnitStarted = isValArray && includesCodeUnitStarted;
            if (Array.isArray(val[1])) {
                // Case: [string, [array]]
                const nestedItems = flattenArray(val[1], key).map((item) => ({ ...item, nested: true }));
                return [{ key, event: `${val[0]}`, nested: false, codeUnitStarted: isCodeUnitStarted }, ...nestedItems];
            } else if (typeof val[1] === "string") {
                // Case: [string, string]
                return [
                    {
                        key,
                        event: `${val[0]}`,
                        value: `${val[1]}`,
                        codeUnitStarted: isCodeUnitStarted,
                        userDebug: includesUserDebug,
                        isMethodEntry: includesMethodEntry,
                        isMethodExit: includesMethodExit,
                        isVariableAssignment: includesVariableAssignment,
                        isFlow: includesFlow,
                        isValidation: includesValidation
                    }
                ];
            }
        }
        // Case: array
        return flattenArray(val, key);
    };

    /**
     * Handles click of Expand button.
     * @param {event} - The event object.
     */
    const handleButtonClick = (e) => {
        // Toggle the button text and background color
        const button = e.currentTarget;
        const isShowMore = button.innerHTML === "Show More";
        button.innerHTML = isShowMore ? "Show Less" : "Show More";
        button.style.backgroundColor = isShowMore ? "#1F2833" : "#007acc";

        let nextElement = e.currentTarget.parentElement.nextElementSibling;

        while (
            nextElement &&
            nextElement.classList.contains("data-item") &&
            nextElement.classList.contains("nested-array")
        ) {
            // let computedStyle = window.getComputedStyle(nextElement);
            // nextElement.style.display = computedStyle.display === "none" ? "block" : "none";

            // patch for top level button to show/hide nested values
            nextElement.style.display = isShowMore ? "block" : "none";

            nextElement = nextElement.nextElementSibling;
        }
    };

    const handleInnerButtonClick = (e) => {
        // Toggle the button text and background color
        const button = e.currentTarget;
        const isShowMore = button.innerHTML === "Show More";
        button.innerHTML = isShowMore ? "Show Less" : "Show More";
        button.style.backgroundColor = isShowMore ? "#1F2833" : "#007acc";

        let codeUnitElement = button.parentElement;
        let codeUnitVal = codeUnitElement.querySelector(".data-event").innerHTML.split("_")[3];

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
            if (nextElementValue && nextElementValue.includes("CODE_UNIT_FINISHED_" + codeUnitVal)) {
                nextElementMatchesCurrent = true;
                nextElement.style.display = computedStyle.display === "none" ? "block" : "none";
                break;
            } else {
                nextElement.style.display = computedStyle.display === "none" ? "block" : "none";
            }

            nextElement = nextElement.nextElementSibling;
        }
    };

    // Function to highlight search term in the value
    const highlightSearchTerm = (value, searchTerm) => {
        if (!value) return value; // Ensure value is defined
        if (!searchTerm) return value;
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

    // React Hook used to perform side effects in function components
    useEffect(() => {
        if (searchTerm) {
            const flattenedData = flattenArray(data);
            const matchingItems = flattenedData
                .map((item, index) => ({ item, index })) // Store the original index
                .filter(
                    ({ item }) =>
                        (item.value && item.value.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (item.event && item.event.toLowerCase().includes(searchTerm.toLowerCase()))
                );

            setMatchingItems(matchingItems); // Update the matching items
            setMatchingCount(matchingItems.length); // Update the matching count
            console.log("matchingItems", matchingItems);
            if (matchingItems.length > 0) {
                const nearestIndex = matchingItems[currentIndex % matchingItems.length].index;
                if (itemRefs.current[nearestIndex]) {
                    itemRefs.current[nearestIndex].scrollIntoView({ behavior: "smooth", block: "center" });
                }
            } else {
                setMatchingCount(0); // Reset the matching count if search term is empty
            }
        }
    }, [searchTerm, data, currentIndex]);

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
        const { id, checked } = e.target;
        console.log("id-->", id, "checked-->", checked);
        let assignmentVariables = [];

        if (checked) {
            assignmentVariables = document.querySelectorAll(`.${id}`);
            assignmentVariables.forEach((item) => {
                item.style.display = "block";
            });
            if (id == "method-entry") {
                console.log("here1");
                assignmentVariables = document.querySelectorAll(".method-exit");
                assignmentVariables.forEach((item) => {
                    item.style.display = "block";
                });
            }
        } else {
            assignmentVariables = document.querySelectorAll(`.${id}`);
            assignmentVariables.forEach((item) => {
                item.style.display = "none";
            });
            if (id == "method-entry") {
                assignmentVariables = document.querySelectorAll(".method-exit");
                assignmentVariables.forEach((item) => {
                    item.style.display = "none";
                });
            }
        }
    };

    return (
        <div>
            {data ? (
                <div className="container">
                    <div className="search-container">
                        <div className="search-inner-container">
                            {/* <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentIndex(0); // Reset index when search term changes
                                }}
                                onKeyDown={handleKeyDown}
                            /> */}
                            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                <Input
                                    size={"sm"}
                                    label="Search..."
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentIndex(0); // Reset index when search term changes
                                    }}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            {searchTerm && (
                                <div className="search-popup">
                                    {currentIndex + 1} of {matchingCount}
                                    <div>
                                        <button onClick={handlePrevious}>⬆️</button>
                                        <button onClick={handleNext}>⬇️</button>
                                    </div>
                                </div>
                            )}
                            <fieldset className="data-filters">
                                <legend>Elements to Display</legend>
                                <div>
                                    <input type="checkbox" id="flow" onChange={handleCheckboxChange} defaultChecked />
                                    <label>Flows</label>
                                </div>
                                <div>
                                    <input
                                        type="checkbox"
                                        id="method-entry"
                                        onChange={handleCheckboxChange}
                                        defaultChecked
                                    />
                                    <label>Method Entry/Exit</label>
                                </div>
                                <div>
                                    <input
                                        type="checkbox"
                                        id="validation-rule"
                                        onChange={handleCheckboxChange}
                                        defaultChecked
                                    />
                                    <label>Validations</label>
                                </div>
                                <div>
                                    <input
                                        type="checkbox"
                                        id="variable-assignment"
                                        onChange={handleCheckboxChange}
                                        defaultChecked
                                    />
                                    <label>Variable Assignment</label>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    <div className="data-container">
                        <h1>React Webview for Debug Log Analyzing</h1>
                        {flattenArray(data).map((item, index) => (
                            <div
                                key={index}
                                className={`data-item ${item.nested ? "nested-array" : ""} ${item.codeUnitStarted ? "code-unit-started" : ""} ${item.userDebug ? "user-debug" : ""} ${item.isMethodEntry ? "method-entry" : ""} ${item.isVariableAssignment ? "variable-assignment" : ""} ${item.isFlow ? "flow" : ""} ${item.isValidation ? "validation-rule" : ""}  ${item.isMethodExit ? "method-exit" : ""}`}
                                ref={(el) => (itemRefs.current[index] = el)}
                            >
                                {/* <span className="data-key">{item.key}: </span> */}
                                <span className={`data-event ${item.codeUnitStarted ? "code-unit-started" : ""}`}>
                                    {highlightSearchTerm(item.event, searchTerm)} :{" "}
                                </span>
                                <span className="data-value">{highlightSearchTerm(item.value, searchTerm)}</span>
                                {!item.nested && (
                                    <button className="top-level-button" onClick={handleButtonClick}>
                                        Show More
                                    </button>
                                )}
                                {item.codeUnitStarted && item.nested && (
                                    <button className="inner-level-button" onClick={handleInnerButtonClick}>
                                        Show Less
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p>Processing Data...</p>
            )}
        </div>
    );
};

export default App;
