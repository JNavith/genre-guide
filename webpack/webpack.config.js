const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')


class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
  }
}


module.exports = {
  entry: './src/css/tailwind.postcss',
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.postcss$/,
        use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
        ]
      },
      {
        test: /\.jpg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path]/img/[name].[ext]',
            }  
          }
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css", 
      chunkFilename: "css/[id].css"
    }),
    new PurgecssPlugin({
      paths: glob.sync(`./src/html/**/*`,  { nodir: true }),
      extractors: [
        {
          extractor: TailwindExtractor,
          extensions: ['html']
        }
      ]
    }),
  ],
}

if (process.env.NODE_ENV !== "production") {
  // Exclude purgecss from dev builds
  module.exports.plugins.pop();
}
