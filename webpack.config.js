// Import necessary modules
const path = require("path");
const webpack = require("webpack");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Export the webpack configuration object
module.exports = {
  // Set the mode to "development" so that webpack provides additional debugging information
  mode: "development",

  // Set the devtool to "cheap-module-eval-source-map" for faster rebuilds and better debugging experience
  devtool: "cheap-module-eval-source-map",

  // Define the entry point as "src/main.js"
  entry: {
    main: path.join(process.cwd(), "src", "main.js"),
  },

  // Define the output directory and filename as "docs/bundle.js"
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "bundle.js",
  },

  // Define the dev server options, including the static directory and port
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: process.env.PORT || 9000,
  },

  // Define node options to avoid warnings on certain modules
  node: {
    fs: "empty",
    net: "empty",
  },

  // Define watch options, including the aggregateTimeout and poll interval
  watchOptions: {
    aggregateTimeout: 300,
    poll: 500,
  },

  // Define the plugins to use, including FriendlyErrorsWebpackPlugin, webpack.ProgressPlugin and HtmlWebpackPlugin
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(process.cwd(), "public", "index.html"),
    }),
  ],
};
