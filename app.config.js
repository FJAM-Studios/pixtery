const admobIDs = require("./admobIDs");
const sentry = require("./sentry");

export default ({ config }) => {
  const _config = {
    ...config,
    extra: {
      functionEmulator: process.env.FUNC === "true",
    },
  };
  _config.android.config.googleMobileAdsAppId = admobIDs.ANDROID_APP_ID;
  _config.ios.config.googleMobileAdsAppId = admobIDs.IOS_APP_ID;
  _config.hooks.postPublish[0].config.authToken = sentry.AUTH_TOKEN;
  return _config;
};
