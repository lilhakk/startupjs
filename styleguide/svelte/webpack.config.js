const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const autoprefixer = require('autoprefixer')

module.exports = env => {
  const isEnvDevelopment = env === 'development'

  const plugins = [
    new HtmlWebpackPlugin({
      template: '../index.html',
      minify: { collapseWhitespace: true }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].chunk.css'
    }),
    autoprefixer
  ]

  return {
    name: 'src',
    entry: './src',
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, './build'),
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.svelte', '.json']
    },
    module: {
      rules: [
        {
          test: [/\.js$/],
          include: [path.join(__dirname, './src')],
          loader: 'babel-loader'
        },
        {
          test: /\.svelte$/,
          use: {
            loader: 'svelte-loader',
            options: {
              emitCss: true,
              hotReload: false,
              hotOptions: {
                optimistic: true
              }
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false // necessary if you use url('/path/to/some/asset.png|jpg|gif')
              }
            }
          ]
        }
      ]
    },
    optimization: {
      minimize: !isEnvDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2
            },
            mangle: {
              safari10: true
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true
            }
          },
          parallel: true,
          cache: true,
          extractComments: false
        }),
        new OptimizeCssAssetsPlugin({})
      ]
    },
    plugins,
    devServer: {
      publicPath: '/',
      contentBase: './public',
      historyApiFallback: true,
      overlay: true,
      compress: true,
      port: 4000,
      disableHostCheck: true
    },
    node: {
      fs: 'empty',
      __dirname: true
    }
  }
}
