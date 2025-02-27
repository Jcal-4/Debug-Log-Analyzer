import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

const vscode = acquireVsCodeApi();

ReactDOM.render(<App vscode={vscode} />, document.getElementById("root"));
