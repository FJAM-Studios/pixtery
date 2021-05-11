import { AdMobBanner } from "expo-ads-admob";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

import { BANNER_ID } from "../constants";

export default (props: any) => {
  console.log("props", props.style);
  return (
    <SafeAreaView {...props.style}>
      <View>
      {props.children}
      </View>
      <View style={{flex: 2, justifyContent: 'space-between'}}>
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={BANNER_ID}
        style={{ marginTop: "auto", alignSelf: "center" }}
      />        
      </View>
    </SafeAreaView>
  );
};
// style={{flex: 2, justifyContent: 'space-between'}}