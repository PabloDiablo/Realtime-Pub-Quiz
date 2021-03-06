/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  entry: {
    team: './src/team/index.tsx',
    quizMaster: './src/quiz-master/index.tsx'
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
    new Dotenv(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './res/index.html',
      title: 'QuizWhip',
      inject: 'body',
      chunks: ['team']
    }),
    new HtmlWebpackPlugin({
      filename: 'quiz-master/index.html',
      template: './res/quiz-master.html',
      title: 'QuizWhip | Quiz Master',
      inject: 'body',
      chunks: ['quizMaster']
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
    path: path.resolve(__dirname, '..', 'dist'),
    publicPath: '/'
  },
  devtool: isDev ? 'inline-source-map' : undefined,
  devServer: {
    contentBase: './public',
    host: '0.0.0.0',
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        { from: /^\/quiz-master/, to: '/quiz-master/index.html' }
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001'
      }
    }
  }
};
