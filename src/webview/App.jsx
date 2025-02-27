import React, { useEffect, useState } from "react";

const App = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const vscode = acquireVsCodeApi();

        // Listen for messages from the extension
        window.addEventListener("message", (event) => {
            const message = event.data;
            if (message.command === "update") {
                setData(message.data);
            } else if (message.command === "initialize") {
                setData(message.data);
            }
        });

        // Send back message to extension if needed
        vscode.postMessage({ command: "requestData" });

        return () => {
            window.removeEventListener("message", () => {});
        };
    }, []);

    return (
        <div>
            <h1>React Webview for Log Analyzer</h1>
            {data ? (
                <p>
                    {data.message} - Count: {data.count}
                </p>
            ) : (
                <p>Processing Data...</p>
            )}
        </div>
    );
};

export default App;
