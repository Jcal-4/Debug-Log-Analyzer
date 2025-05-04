import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <HeroUIProvider>
        <App />
    </HeroUIProvider>
);
