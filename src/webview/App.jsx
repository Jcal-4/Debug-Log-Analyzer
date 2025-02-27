import React, { useEffect, useState } from "react";

const App = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const vscode = acquireVsCodeApi();

        // Request data from the extension
        vscode.postMessage({ command: "requestData" });

        // Listen for messages from the extension
        window.addEventListener("message", (event) => {
            const message = event.data;
            if (message.command === "update") {
                setData(message.data);
            }
        });

        return () => {
            window.removeEventListener("message", () => {});
        };
    }, []);

    return (
        <div>
            <h1>React Webview in VS Code</h1>
            {data ? (
                <p>
                    {data.message} - Count: {data.count}
                </p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default App;
