const admobIDs = require("./admobIDs");
export default ({ config }) => {
  const _config = {
    ...config,
    extra: {
      functionEmulator: process.env.FUNC === "true",
    },
  };
  _config.android.config.googleMobileAdsAppId = admobIDs.ANDROID_APP_ID;
  _config.ios.config.googleMobileAdsAppId = admobIDs.IOS_APP_ID;
  return _config;
};
