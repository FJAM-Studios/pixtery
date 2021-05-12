const TESTING_MODE = false;

const SNAP_MARGIN = 0.25;

const COMPRESSION = 0.5;

const DEFAULT_IMAGE_SIZE = {
  width: 1080,
  height: 1080,
};

const TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";
const ANDROID_BANNER_ID = "ca-app-pub-5028593996211038/4454679708";
const IOS_BANNER_ID = "ca-app-pub-5028593996211038/6122984590";

// I could only get the test ad units to work. not clear to me whether
// we'd have to wait 48hrs for real ads, if the apps need to be on the
// real store to get real ads, or if there's some other thing I'm missing.
const BANNER_ID = TEST_BANNER_ID;

const TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";
const INTERSTITIAL_ID = TEST_INTERSTITIAL_ID;

// so we don't have to deal w fullscreen ads before sending a test pixtery
const DISPLAY_PAINFUL_ADS = true;

const DEGREE_CONVERSION = Math.PI / 180;

const USE_NATIVE_DRIVER = true;

const ROTATION_ENABLE_DEFAULT = true;

export {
  TESTING_MODE,
  SNAP_MARGIN,
  COMPRESSION,
  DEFAULT_IMAGE_SIZE,
  BANNER_ID,
  INTERSTITIAL_ID,
  DISPLAY_PAINFUL_ADS,
  DEGREE_CONVERSION,
  USE_NATIVE_DRIVER,
  ROTATION_ENABLE_DEFAULT,
};
