import { AdMobBanner } from "expo-ads-admob";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

import { BANNER_ID } from "../constants";

export default (props: any) => {
  console.log('props', props.style)
  return (
    <SafeAreaView {...props.style}>
      <View style={{minHeight: "0%", overflow: "hidden"}}>
      {props.children}

      </View>

      {/* {props.children.map(child => {return(<View style={{flex: 1}}>{child}</View>)})} */}
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={BANNER_ID}
        style={{ marginTop: "auto", alignSelf: "center", flex: 2}}
      />
    
    </SafeAreaView>
  );
};
