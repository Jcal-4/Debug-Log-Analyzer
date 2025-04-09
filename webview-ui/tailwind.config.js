// tailwind.config.js
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./node_modules/@heroui/theme/dist/**/*.{js,jsx}"],
    theme: {
        extend: {}
    },
    darkMode: "false",
    plugins: [heroui()]
};
