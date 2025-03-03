import React, { useEffect, useState, useRef } from "react";
import "./index.css"; // Import the CSS file

const App = () => {
    // terms needed to be defined to use in html components
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
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
                if (val.length === 2 && typeof val[0] === "string" && Array.isArray(val[1])) {
                    return acc.concat(
                        { key, value: `${val[0]}`, nested: false },
                        flattenArray(val[1], key).map((item) => ({ ...item, nested: true }))
                    );
                } else if (val.length === 2 && typeof val[0] === "string" && typeof val[1] === "string") {
                    return acc.concat({ key, value: `${val[0]}: ${val[1]}` });
                }
                return acc.concat(flattenArray(val, key));
            } else if (typeof val === "object" && val !== null) {
                return acc.concat(flattenArray(Object.entries(val), key));
            } else {
                return acc.concat({ key, value: val });
            }
        }, []);
    };

    /**
     * Handles click of Expand button.
     * @param {event} - The event object.
     */
    const handleButtonClick = (e) => {
        let nextElement = e.currentTarget.parentElement.nextElementSibling;
        console.log("nextElement", nextElement);
        console.log("contains data-item", nextElement.classList.contains("data-item"));
        console.log("contains nested-array", nextElement.classList.contains("nested-array"));
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

    // React Hook used to perform side effects in function components
    useEffect(() => {
        if (searchTerm) {
            const index = flattenArray(data).findIndex((item) => item.value.toLowerCase().includes(searchTerm.toLowerCase()));
            if (index !== -1 && itemRefs.current[index]) {
                itemRefs.current[index].scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [searchTerm, data]);

    return (
        <div>
            <h1>React Webview for Log Analyzer</h1>
            {data ? (
                <div className="data-container">
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {flattenArray(data).map((item, index) => (
                        <div key={index} className={`data-item ${item.nested ? "nested-array" : ""}`} ref={(el) => (itemRefs.current[index] = el)}>
                            <span className="data-key">{item.key}: </span>
                            <span className="data-value">{item.value}</span>
                            {!item.nested && (
                                <button className="top-level-button" onClick={handleButtonClick}>
                                    Expand
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>Processing Data...</p>
            )}
        </div>
    );
};

export default App;
