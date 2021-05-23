import { AdMobBanner } from "expo-ads-admob";
import React from "react";
import { StyleProp, ViewStyle, View, LayoutChangeEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

import { BANNER_ID } from "../constants";
import { setAdHeight } from "../store/reducers/screenHeight";

export default function AdSafeAreaView(props: {
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}): JSX.Element {
  const dispatch = useDispatch();
  const measureAdArea = (ev: LayoutChangeEvent): void => {
    const adHeight = ev.nativeEvent.layout.height;
    if (adHeight) dispatch(setAdHeight(adHeight));
  };

  return (
    <SafeAreaView {...props.style}>
      {props.children}
      <View onLayout={(ev) => measureAdArea(ev)}>
        <AdMobBanner
          bannerSize="smartBannerPortrait"
          adUnitID={BANNER_ID}
          style={{ marginTop: "auto", alignSelf: "center" }}
        />
      </View>
    </SafeAreaView>
  );
}
