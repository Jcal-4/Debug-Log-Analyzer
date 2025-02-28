import React, { useEffect, useState } from "react";
import "./index.css"; // Import the CSS file

const App = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const vscode = acquireVsCodeApi();

        // Listen for messages from the extension
        window.addEventListener("message", (event) => {
            console.log("event", event);
            const message = event.data;
            console.log("message", message);
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
                if (val.length === 2 && typeof val[0] === "string" && typeof val[1] === "string") {
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

    return (
        <div>
            <h1>React Webview for Log Analyzer</h1>
            {data ? (
                <div className="data-container">
                    {flattenArray(data).map((item, index) => (
                        <div key={index} className="data-item">
                            <span className="data-key">{item.key}: </span>
                            <span className="data-value">{item.value}</span>
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
