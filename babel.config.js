module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin',
      // ["module:react-native-dotenv", {
      //   "moduleName": "@env",
      //   "path": ".env",
      //   "blocklist": null,
      //   "allowlist": ['FIREBASE_API_KEY'],
      //   "blacklist": null, // DEPRECATED
      //   "whitelist": null, // DEPRECATED
      //   "safe": false,
      //   "allowUndefined": false,
      //   "verbose": false
      // }]
    ]
  }
};
