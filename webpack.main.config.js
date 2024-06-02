
const path = require('path');


module.exports = {
    mode: "development",
    entry: './src/main.ts',
    target: 'electron-main',
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    output: {
      path: __dirname + '/dist-electron',
      filename: 'main.js'
    }
  };