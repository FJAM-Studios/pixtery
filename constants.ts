import * as Device from "expo-device";
import { Platform } from "react-native";

import admobIDs from "./admobIDs";

const TESTING_MODE = false;

const SNAP_MARGIN = 0.25;

const COMPRESSION = 0.5;

const DEFAULT_IMAGE_SIZE = {
  width: 1080,
  height: 1080,
};

const {
  TEST_BANNER_ID,
  IOS_BANNER_ID,
  ANDROID_BANNER_ID,
  TEST_INTERSTITIAL_ID,
  IOS_INTERSTITIAL_ID,
  ANDROID_INTERSTITIAL_ID,
} = admobIDs;

let BANNER_ID = TEST_BANNER_ID;
let INTERSTITIAL_ID = TEST_INTERSTITIAL_ID;
if (Device.isDevice) {
  BANNER_ID = Platform.OS === "ios" ? IOS_BANNER_ID : ANDROID_BANNER_ID;
  INTERSTITIAL_ID =
    Platform.OS === "ios" ? IOS_INTERSTITIAL_ID : ANDROID_INTERSTITIAL_ID;
}

// so we don't have to deal w fullscreen ads before sending a test pixtery
const DISPLAY_PAINFUL_ADS = false;

const DEGREE_CONVERSION = Math.PI / 180;

const USE_NATIVE_DRIVER = true;

const PUBLIC_KEY_LENGTH = 9;

const MIN_BOTTOM_CLEARANCE = 0.7;

const VERSION_NUMBER = "2.0.52";

const ARGUABLY_CLEVER_PHRASES = [
  "Please wait!",
  "One moment...",
  "Give it a sec.",
  "Uploading puzzle data.",
  "So pixterious!",
];

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

const DAILY_TIMEZONE = "America/New_York";

const DATE_FORMAT = "MMM D YYYY";

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
  DAY_IN_MILLISECONDS,
  DAILY_TIMEZONE,
  DATE_FORMAT,
};
