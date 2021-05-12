import { AdMobBanner } from "expo-ads-admob";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BANNER_ID } from "../constants";

export default function AdSafeAreaView(props: any): JSX.Element {
  return (
    <SafeAreaView {...props.style}>
      <View>{props.children}</View>
      <View style={{ flex: 2, justifyContent: "space-between" }}>
        <AdMobBanner
          bannerSize="smartBannerPortrait"
          adUnitID={BANNER_ID}
          style={{ marginTop: "auto", alignSelf: "center" }}
        />
      </View>
    </SafeAreaView>
  );
}
