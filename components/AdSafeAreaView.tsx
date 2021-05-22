import { AdMobBanner } from "expo-ads-admob";
import React, { useEffect, useState } from "react";
import { StyleProp, ViewStyle, View, LayoutChangeEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { BANNER_ID } from "../constants";
import { setAdHeight } from "../store/reducers/screenHeight";

// start here - either do an onlayout, or do this
// https://stackoverflow.com/questions/50935918/how-to-get-banner-size-of-smart-banner
export default function AdSafeAreaView(props: {
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}): JSX.Element {
  const dispatch = useDispatch();
  // const [adHeight, setAdHeight] = useState(0);
  const measureAdArea = (ev: LayoutChangeEvent): void => {
    const adHeight = ev.nativeEvent.layout.height;
    console.log('adheight at adview', adHeight)
    if (adHeight) dispatch(setAdHeight(adHeight));
  };
  // useEffect(() => {
  //   dispatch(setAdHeight(adHeight));
  // })
  // console.log('adheight', adHeight)
  // if(!adHeight) return(
  //   <SafeAreaView {...props.style}>
  //   {props.children}
  //   <View onLayout={(ev) => measureAdArea(ev)}>
  //   <AdMobBanner
  //     bannerSize="smartBannerPortrait"
  //     adUnitID={BANNER_ID}
  //     style={{ marginTop: "auto", alignSelf: "center" }}
  //   />
  //   </View>
  //   </SafeAreaView>
  // )

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
