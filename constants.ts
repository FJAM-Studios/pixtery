const TESTING_MODE = false;

const SNAP_MARGIN = 0.25;

const COMPRESSION = 0.5;

const DEFAULT_IMAGE_SIZE = {
  width: 1080,
  height: 1080,
};

const TEST_BANNER_ID = "***REMOVED***";
const ANDROID_BANNER_ID = "***REMOVED***";
const IOS_BANNER_ID = "***REMOVED***";

// I could only get the test ad units to work. not clear to me whether
// we'd have to wait 48hrs for real ads, if the apps need to be on the
// real store to get real ads, or if there's some other thing I'm missing.
const BANNER_ID = TEST_BANNER_ID;

const TEST_INTERSTITIAL_ID = "***REMOVED***";
const INTERSTITIAL_ID = TEST_INTERSTITIAL_ID;

// so we don't have to deal w fullscreen ads before sending a test pixtery
const DISPLAY_PAINFUL_ADS = true;

const DEGREE_CONVERSION = Math.PI / 180;

const USE_NATIVE_DRIVER = true;

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
};
