const path = require('path');

module.exports = {
  entry: './game.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  mode: 'development', // or 'production' for optimized builds
  module: {
    rules: [
      {
        test: /\.js$/, // All .js files
        exclude: /node_modules\/(?!(@clerk)\/).*/,
        use: {
          loader: 'babel-loader', // Transpile ES6+ code
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
