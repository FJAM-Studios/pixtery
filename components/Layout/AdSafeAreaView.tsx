import AsyncStorage from "@react-native-async-storage/async-storage";
import { AdMobBanner } from "expo-ads-admob";
import * as Device from "expo-device";
import * as StoreReview from "expo-store-review";
import { useEffect } from "react";
import { StyleProp, ViewStyle, View, LayoutChangeEvent } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
  TEST_BANNER_ID,
  BANNER_ID,
  DAY_IN_MILLISECONDS,
} from "../../constants";
import { setAdHeight } from "../../store/reducers/adHeight";
import { RootState } from "../../types";

export default function AdSafeAreaView(props: {
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}): JSX.Element {
  const dispatch = useDispatch();
  const adHeight = useSelector((state: RootState) => state.adHeight);
  const measureAdArea = (ev: LayoutChangeEvent): void => {
    const adHeightMeasured = ev.nativeEvent.layout.height;
    if (!adHeight) dispatch(setAdHeight(adHeightMeasured));
  };

  // to update adHeight if on initial load it has not yet loaded
  useEffect(() => {
    if (!adHeight) dispatch(setAdHeight(adHeight));
  }, [adHeight]);

  useEffect(() => {
    const checkReviewAvailable = async () => {
      // verify app can ask for review
      const hasAction = await StoreReview.hasAction();
      const isAvail = await StoreReview.isAvailableAsync();

      // check last time asked for review
      let lastAskedReview = await AsyncStorage.getItem("@lastAskedReview");

      // if never asked for review (like after initial install), then set
      // last time asked as now and save
      if (!lastAskedReview) {
        lastAskedReview = Date.now().toString();
        await AsyncStorage.setItem("@lastAskedReview", lastAskedReview);
      }

      // check if > 1 day since last asked
      const longEnough = Date.now() - +lastAskedReview > DAY_IN_MILLISECONDS;

      // if app can ask and been more than 1 day, ask for review
      if (hasAction && isAvail && longEnough) {
        lastAskedReview = Date.now().toString();
        await AsyncStorage.setItem("@lastAskedReview", lastAskedReview);
        StoreReview.requestReview();
      }
    };
    checkReviewAvailable();
  }, []);

  return (
    <View {...props.style}>
      {props.children}
      <View onLayout={(ev) => measureAdArea(ev)}>
        <AdMobBanner
          bannerSize="smartBannerPortrait"
          adUnitID={Device.isDevice ? BANNER_ID : TEST_BANNER_ID}
          style={{ marginTop: "auto", alignSelf: "center" }}
          servePersonalizedAds
        />
      </View>
    </View>
  );
}
