import React, { useEffect, useState, useRef } from "react";
import "./index.css"; // Import the CSS file

const App = () => {
    // terms needed to be defined to use in html components
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemRefs = useRef([]);

    useEffect(() => {
        // we can't import vscode api directly so we need to use acquireVsCodeApi
        const vscode = acquireVsCodeApi();

        // Listen for messages from the extension
        window.addEventListener("message", (event) => {
            const message = event.data;
            if (message.command === "update") {
                setData(message.data);
            } else if (message.command === "initialize") {
                console.log("initialize", message.data.executedComponents);
                let newArray = message.data.executedComponents;
                setData(newArray);
            }
        });
        // Send back message to extension if needed
        vscode.postMessage({ command: "requestData" });

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

    // Case: ['CODE_UNIT_STARTED_1', Array[]]
    // Case: ['METHOD_ENTRY_1', 'makeData()']
    const flattenArrayFromArray = (val, key) => {
        if (val.length === 2 && typeof val[0] === "string") {
            const isValArray = Array.isArray(val[1]);
            const includesCodeUnitStarted = val[0].includes("CODE_UNIT_STARTED_");
            const includesUserDebug = val[0].includes("USER_DEBUG");
            const isCodeUnitStarted = isValArray && includesCodeUnitStarted;
            if (Array.isArray(val[1])) {
                // Case: [string, array]
                const nestedItems = flattenArray(val[1], key).map((item) => ({ ...item, nested: true }));
                return [{ key, value: `${val[0]}`, nested: false, codeUnitStarted: isCodeUnitStarted, userDebug: includesUserDebug }, ...nestedItems];
            } else if (typeof val[1] === "string") {
                // Case: [string, string]
                return [{ key, value: `${val[0]}: ${val[1]}`, codeUnitStarted: isCodeUnitStarted, userDebug: includesUserDebug }];
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
        // toggle the button text between "Show More" and "Show Less"
        if (e.currentTarget.innerHTML === "Show More") {
            e.currentTarget.innerHTML = "Show Less";
            e.currentTarget.style.backgroundColor = "#1F2833";
        } else {
            e.currentTarget.innerHTML = "Show More";
            e.currentTarget.style.backgroundColor = "#007acc";
        }

        let nextElement = e.currentTarget.parentElement.nextElementSibling;
        console.log("nextElement", nextElement);
        // check if nextElement is a data-item and nested-array, if so then change
        while (nextElement && nextElement.classList.contains("data-item") && nextElement.classList.contains("nested-array")) {
            // element does not have an inline style.display property set so the following method will allow us to get the property
            let computedStyle = window.getComputedStyle(nextElement);
            if (computedStyle.display === "none") {
                nextElement.style.display = "block";
            } else {
                nextElement.style.display = "none";
            }
            nextElement = nextElement.nextElementSibling;
        }
    };

    const handleInnerButtonClick = (e) => {
        // toggle the button text between "Show More" and "Show Less"
        if (e.currentTarget.innerHTML === "Show More") {
            e.currentTarget.innerHTML = "Show Less";
            e.currentTarget.style.backgroundColor = "#1F2833";
        } else {
            e.currentTarget.innerHTML = "Show More";
            e.currentTarget.style.backgroundColor = "#007acc";
        }
        let currentElement = e.currentTarget.parentElement;
        let currentElementValue = currentElement.querySelector(".data-value");
        currentElementValue = currentElementValue.innerHTML;
        currentElementValue = currentElementValue.split("_")[3]; // the number associated with the code unit
        let nextElement = e.currentTarget.parentElement.nextElementSibling;
        let nextElementValue = nextElement.querySelector(".data-value");
        nextElementValue = nextElementValue.innerHTML;
        let nextElementMatchesCurrent = false;
        // create logic here to check that nextElement if value CODE_UNIT_FINISHED matches CODE_UNIT_STARTED
        if (nextElementValue && nextElementValue.includes("CODE_UNIT_FINISHED_" + currentElementValue)) {
            nextElementMatchesCurrent = true;
            nextElement.style.display = "none";
        }
        // check if nextElement is a data-item and nested-array, if so then change
        while (nextElement && nextElement.classList.contains("data-item") && nextElement.classList.contains("nested-array") && !nextElementMatchesCurrent) {
            // element does not have an inline style.display property set so the following method will allow us to get the property
            let computedStyle = window.getComputedStyle(nextElement);
            if (computedStyle.display === "none") {
                nextElement.style.display = "block";
            } else {
                nextElement.style.display = "none";
            }
            if (nextElement) {
                nextElementValue = nextElement.querySelector(".data-value");
                nextElementValue = nextElementValue.innerHTML;
                if (nextElementValue && nextElementValue.includes("CODE_UNIT_FINISHED_" + currentElementValue)) {
                    nextElementMatchesCurrent = true;
                }
            }
            nextElement = nextElement.nextElementSibling;
        }
    };

    // Function to highlight search term in the value
    const highlightSearchTerm = (value, searchTerm) => {
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
            const index = flattenArray(data).findIndex((item) => item.value.toLowerCase().includes(searchTerm.toLowerCase()));
            if (index !== -1 && itemRefs.current[index]) {
                itemRefs.current[index].scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [searchTerm, data]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % flattenArray(data).filter((item) => item.value.toLowerCase().includes(searchTerm.toLowerCase())).length);
        }
    };

    return (
        <div>
            <h1>React Webview for Debug Log Analyzing</h1>
            {data ? (
                <div className="container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentIndex(0); // Reset index when search term changes
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="data-container">
                        {flattenArray(data).map((item, index) => (
                            <div
                                key={index}
                                className={`data-item ${item.nested ? "nested-array" : ""} ${item.codeUnitStarted ? "code-unit-started" : ""} ${item.userDebug ? "user-debug" : ""}`}
                                ref={(el) => (itemRefs.current[index] = el)}
                            >
                                <span className="data-key">{item.key}: </span>
                                <span className={`data-value ${item.codeUnitStarted ? "code-unit-started" : ""}`}>{highlightSearchTerm(item.value, searchTerm)}</span>
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
