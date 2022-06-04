const path = require('path');

module.exports = {
    mode: 'production',
    entry: "./prebuild/block-extractor.mjs",
    output: {
        path: path.resolve(__dirname),
        filename: "index.js",
        library:{
            type: "commonjs-static",
        }
    },
    module:{
        rules: [
            {
                test: /\.mjs$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            plugins: ["@babel/plugin-proposal-class-properties"],
                        }
                    }
                ],
            }
        ],
    },
    target: "node",
};