module.exports = {
  entry: './src/index.ts',
  mode: process.env.NODE_ENV || "development",
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: {
          loader: 'worker-loader',
          options: {inline: true, fallback: false}
        }
      },
      {
      test: /\.m?ts$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'ts-loader',
      }
    }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    libraryTarget: 'umd'
  }
}
