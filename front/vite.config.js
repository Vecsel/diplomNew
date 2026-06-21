var _a;
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
var basePath = (_a = process.env.VITE_BASE_PATH) !== null && _a !== void 0 ? _a : "/";
export default defineConfig({
    base: basePath.endsWith("/") ? basePath : "".concat(basePath, "/"),
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
});
