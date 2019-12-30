module.exports = {
  mode: process.env.NODE_ENV || "development",
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {inline: true, fallback: false}
        }
      },
      {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-optional-chaining'
          ]
        }
      }
    }
    ]
  },
  output: {
    libraryTarget: 'umd'
  }
}
