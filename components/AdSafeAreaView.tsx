import { AdMobBanner } from "expo-ads-admob";
import React, { useEffect, useState } from "react";
import { StyleProp, ViewStyle, View, LayoutChangeEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { BANNER_ID } from "../constants";
import { setAdHeight } from "../store/reducers/adHeight";
import { RootState } from "../types";

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
