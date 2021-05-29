module.exports = {
  entry: ["./web/index.tsx"],
  target: "web",
  output: {
    path: __dirname,
    filename: "./public/bundle.js",
  },
  mode: "development",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  devtool: "source-map",
  watchOptions: {
    ignored: /node_modules/,
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-typescript"],
        },
      },
    ],
  },
};
