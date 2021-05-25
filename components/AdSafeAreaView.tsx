import { AdMobBanner } from "expo-ads-admob";
import React, { useEffect, useState } from "react";
import { StyleProp, ViewStyle, View, LayoutChangeEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

import { BANNER_ID } from "../constants";
import { setAdHeight } from "../store/reducers/adHeight";

export default function AdSafeAreaView(props: {
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}): JSX.Element {
  const dispatch = useDispatch();
  const [adHeightState, setAdHeightState] = useState(0);
  const measureAdArea = (ev: LayoutChangeEvent): void => {
    const adHeight = ev.nativeEvent.layout.height;
    console.log('posY', adHeight)
    if (!adHeightState) setAdHeightState(adHeight);
  };

  useEffect(() => {
    console.log("adheight at adview useeffect", adHeightState);
    if (adHeightState) dispatch(setAdHeight(adHeightState));
  });

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
