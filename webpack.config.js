const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');

module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        static: path.join(__dirname, 'public'),
        compress: true,
        port: 9000,
        hot: true,
        watchFiles: ['public/**/*'],
        proxy: [
            {
                context: ['/ppl-api'],
                target: 'https://api.perplexity.ai',
                pathRewrite: { '^/ppl-api': '' },
                secure: false,
                changeOrigin: true,
            },
            {
                context: ['/google-place-api'],
                target: 'https://places.googleapis.com/v1/places',
                pathRewrite: { '^/google-place-api': '' },
                secure: false,
                changeOrigin: true,
            },
            {
                context: ['/google-route-api'],
                target: 'https://routes.googleapis.com/directions/v2',
                pathRewrite: { '^/google-route-api': '' },
                secure: false,
                changeOrigin: true,
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ]
};
