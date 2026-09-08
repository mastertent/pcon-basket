const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
/** @type {import('webpack').Configuration} */
module.exports = {
    mode: process.env.NODE_ENV || "development",

    entry: {
        'main': path.join(__dirname, 'src/index.ts'),
        //'login-popup': path.join(__dirname, 'src/login/login-popup.ts')
    },

    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'build'),
        clean: true,
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: process.env.NODE_ENV === "production" ? false : "source-map",

    stats: "errors-warnings",

    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 3000,
        open: true,
        compress: true,
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: 'ts-loader' },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
        ]
    },

    // plugins: [
    //     new CopyPlugin({
    //         patterns: [
    //             { from: 'public' }
    //         ]
    //     })
    // ]
};