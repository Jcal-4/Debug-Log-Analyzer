const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/webview/app.js",
    output: {
        path: path.resolve(__dirname, "src", "webview"),
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx"]
    }
};
