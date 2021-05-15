import { AdMobBanner } from "expo-ads-admob";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BANNER_ID } from "../constants";

export default function AdSafeAreaView(props: {
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}): JSX.Element {
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
