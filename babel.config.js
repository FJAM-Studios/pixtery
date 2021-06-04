/* eslint-disable prettier/prettier */
// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: [
//       ["babel-preset-expo"],
//       ["@babel/preset-env", { targets: { node: "current" } }],
//       ["@babel/preset-typescript"],
//     ],
//     env: {
//       production: {
//         plugins: 
//           ["@babel/plugin-transform-flow-strip-types", "react-native-paper/babel", 'react-native-reanimated/plugin'],
//           // [
//           //   "@babel/plugin-transform-flow-strip-types"
//           // ],
//           // ["@babel/plugin-proposal-private-methods", { "loose": true }],
//           // ["@babel/plugin-proposal-class-properties", { "loose": true }],
//           // ['@babel/plugin-proposal-decorators', { legacy: true }],
//           // ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
//     },
//   },
// };
// }

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
