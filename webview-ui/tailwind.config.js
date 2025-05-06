// tailwind.config.js
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
    // content: ["./node_modules/@heroui/theme/dist/**/*.{js,jsx}"],
    content: ["./**/*.{html,js,jsx}"],
    theme: {
        extend: {
            colors: {
                customBlue: "#66fcf1"
            },
            fontSize: {
                "xxs-custom": "9.5px"
            }
        }
    },
    darkMode: "false",
    plugins: [heroui()]
};
