import { AdMobBanner } from "expo-ads-admob";
import React, { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BANNER_ID } from "../constants";
// start here - either do an onlayout, or do this
// https://stackoverflow.com/questions/50935918/how-to-get-banner-size-of-smart-banner
export default function AdSafeAreaView(props: {
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}): JSX.Element {
  const [adHeight, setAdHeight] = useState(0);
  return (
    <SafeAreaView {...props.style}>
      {props.children}
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={BANNER_ID}
        style={{ marginTop: "auto", alignSelf: "center" }}
      />
    </SafeAreaView>
  );
}
