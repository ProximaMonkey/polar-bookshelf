const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const workers = require('os').cpus().length - 1;

console.log("Using N workers: " + workers);

module.exports = {
    // mode: 'production',
    entry: {
        "chrome": [ "./web/js/apps/chrome.ts"],
        "repository": [ "./apps/repository/js/entry.tsx"],
        "login": [ "./apps/repository/js/login.ts"],
    },
    module: {

        rules: [

            // https://github.com/webpack-contrib/cache-loader
            //
            // looks like with the cache loader the initial compile is about 10%
            // longer but 2x faster once the cache is running.
            { loader: 'cache-loader' },
            {
                test: path.resolve(__dirname, 'node_modules/electron/index.js'),
                use: 'null-loader'
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,

                use: [
                    {
                        loader: 'thread-loader',
                        options: {
                            // there should be 1 cpu for the fork-ts-checker-webpack-plugin
                            workers: 15,
                            // set this to Infinity in watch mode - see https://github.com/webpack-contrib/thread-loader
                            poolTimeout: Infinity,
                            workerParallelJobs: 100,
                            poolTimeout: 2000,
                        }
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            // performance: this improved performance by about 2x.
                            // from 20s to about 10s
                            transpileOnly: true,
                            experimentalWatchApi: true,

                            // IMPORTANT! use happyPackMode mode to speed-up
                            // compilation and reduce errors reported to webpack
                            happyPackMode: true

                        }
                    }
                ]

            }

        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, 'web/dist'),
        filename: '[name]-bundle.js',
        // publicPath: '/web/js/apps'
    },
    node: {
        //needed to make webpack work on chrome
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.$": "jquery",
            "window.jQuery": "jquery"
        }),
        new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true })

    ],
    optimization: {
        minimize: true,
        usedExports: true,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    }

}


