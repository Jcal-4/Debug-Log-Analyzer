import React, { useEffect, useState } from "react";

const App = ({ vscode }) => {
    const [dynamicContent, setDynamicContent] = useState("");

    useEffect(() => {
        window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.command) {
                case "initialize":
                    setDynamicContent(message.data.dynamicContent);
                    break;
                // Handle other messages as needed
            }
        });
    }, []);

    return (
        <div>
            <h1>Hello, World!</h1>
            <p>This is an example react webview for log analyzer.</p>
            <div id="content">{dynamicContent}</div>
        </div>
    );
};

export default App;
