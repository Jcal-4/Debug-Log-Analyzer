import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
                manualChunks: {
                    // Split React and React DOM into a separate chunk
                    react: ["react", "react-dom"],
                    // Split HeroUI into its own chunk
                    heroui: ["@heroui/react"],
                    // Example: Split other large dependencies
                    lodash: ["lodash"]
                }
            }
        },
        chunkSizeWarningLimit: 600
    }
});
