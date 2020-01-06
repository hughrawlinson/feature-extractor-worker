module.exports = {
  entry: "./src/main/index.ts",
  mode: process.env.NODE_ENV || "development",
  devtool: "inline-source-map",
  stats: {
    chunkModules: true
  },
  module: {
    rules: [
      {
        test: /\.m?ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  resolve: {
    mainFields: ["main"],
    extensions: [".ts", ".js"]
  },
  output: {
    libraryTarget: "umd"
  }
};
