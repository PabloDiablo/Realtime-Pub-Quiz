/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  entry: {
    main: './src/client/index.tsx',
    scoreboard: './src/client/scoreboard.tsx'
  },
  mode: isDev ? 'development' : undefined,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
      title: 'Pub Quiz',
      inject: 'body',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'scoreboard/index.html',
      template: './public/index.html',
      title: 'Pub Quiz | Scoreboard',
      inject: 'body',
      chunks: ['scoreboard']
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  output: {
    filename: '[name].[contentHash].bundle.js',
    path: path.resolve(__dirname, 'dist/client'),
    publicPath: '/'
  },
  devtool: isDev ? 'inline-source-map' : undefined,
  devServer: {
    contentBase: './public',
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        { from: /^\/scoreboard/, to: '/scoreboard/index.html' }
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        pathRewrite: { '^/api': '' }
      },
      '/api': {
        target: 'ws://localhost:3001',
        pathRewrite: { '^/api': '' },
        ws: true
      }
    }
  }
};
