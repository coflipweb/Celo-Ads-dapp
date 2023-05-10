const path = require("path");
const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config");

// Define options for the webpack development server
const devServerOptions = {
  contentBase: path.join(__dirname, "dist"), // Serve files from the "dist" directory
  compress: true, // Enable gzip compression
  hot: true, // Enable hot module replacement (HMR)
  port: 4001, // Use port 4001
  open: true, // Open the browser automatically
  historyApiFallback: true, // Enable HTML5 History API fallback
  publicPath: "/", // Serve the root URL
};

// Add the webpack development server client entrypoints to the webpack configuration
webpackDevServer.addDevServerEntrypoints(webpackConfig, devServerOptions);

// Create a webpack compiler instance with the provided configuration
const compiler = webpack(webpackConfig);

// Create a new instance of the webpack development server with the provided compiler and options
const server = new webpackDevServer(compiler, devServerOptions);

// Start the development server and listen on the specified port and host
server.listen(devServerOptions.port, "localhost", () => {
  console.log(`Dev server listening on port ${devServerOptions.port}`);
});