import { AdMobBanner } from "expo-ads-admob";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { BANNER_ID } from "../constants";

export default function AdSafeAreaView(props: any): JSX.Element {
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
};
