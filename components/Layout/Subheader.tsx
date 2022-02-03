import { Header, HeaderBackButton } from "@react-navigation/elements";
import { ParamListBase } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";

import { StackScreens } from "../../types";

export default function Subheader({
  navigation,
  title,
  enableBack,
  specificDestination,
}: {
  navigation: NativeStackNavigationProp<ParamListBase, string>;
  title: string;
  enableBack: boolean;
  specificDestination?: keyof StackScreens;
}): JSX.Element {
  const onPress = () => {
    if (specificDestination) navigation.navigate(specificDestination);
    else navigation.goBack();
  };
  return (
    <Header
      title={title}
      headerLeft={() =>
        enableBack ? <HeaderBackButton onPress={onPress} /> : null
      }
      headerStyle={{ height: 40 }}
      headerTitleStyle={{ fontSize: 20 }}
    />
  );
}
