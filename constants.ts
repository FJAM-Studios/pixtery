import { Platform } from "react-native";

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

const BANNER_ID = Platform.OS === "ios" ? IOS_BANNER_ID : ANDROID_BANNER_ID;

const TEST_INTERSTITIAL_ID = "***REMOVED***";
const IOS_INTERSTITIAL_ID = "***REMOVED***";
const ANDROID_INTERSTITIAL_ID = "***REMOVED***";

const INTERSTITIAL_ID =
  Platform.OS === "ios" ? IOS_INTERSTITIAL_ID : ANDROID_INTERSTITIAL_ID;

// so we don't have to deal w fullscreen ads before sending a test pixtery
const DISPLAY_PAINFUL_ADS = false;

const DEGREE_CONVERSION = Math.PI / 180;

const USE_NATIVE_DRIVER = true;

const PUBLIC_KEY_LENGTH = 9;

const MIN_BOTTOM_CLEARANCE = 0.7;

const VERSION_NUMBER = "1.2.0";

const ARGUABLY_CLEVER_PHRASES = [
  "Please wait!",
  "One moment...",
  "Give it a sec.",
  "Uploading puzzle data.",
  "So pixterious!",
];

const DAY_IN_MILLISECONDS = 0;

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
  PUBLIC_KEY_LENGTH,
  MIN_BOTTOM_CLEARANCE,
  VERSION_NUMBER,
  ARGUABLY_CLEVER_PHRASES,
};
