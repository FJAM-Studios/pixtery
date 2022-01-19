import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { ScrollView, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Headline, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

import { setTheme } from "../../store/reducers/theme";
import { allThemes } from "../../themes";
import { PixteryTheme, RootState } from "../../types";

function ThemeDisplay({
  theme,
  pixTheme,
  setSelectingTheme,
}: {
  theme: PixteryTheme;
  pixTheme: PixteryTheme;
  setSelectingTheme: (value: React.SetStateAction<boolean>) => void;
}): JSX.Element {
  const { height } = useSelector((state: RootState) => state.screenHeight);
  const dispatch = useDispatch();
  return (
    <TouchableOpacity
      style={{ alignItems: "center" }}
      onPress={async () => {
        dispatch(setTheme(pixTheme));
        await AsyncStorage.setItem("@themeID", JSON.stringify(pixTheme.ID));
        setSelectingTheme(false);
      }}
    >
      <View
        style={{
          width: height * 0.1,
          height: height * 0.1,
          backgroundColor: "white",
          borderColor: "white",
          borderRadius: theme.roundness,
          borderWidth: 1,
          margin: 10,
          justifyContent: "flex-start",
          flexDirection: "column",
          alignContent: "flex-start",
        }}
      >
        <View
          style={{
            backgroundColor: pixTheme.colors.primary,
            width: "50%",
            height: "50%",
            borderTopLeftRadius: theme.roundness,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        <View
          style={{
            backgroundColor: pixTheme.colors.background,
            width: "50%",
            height: "50%",
            borderBottomLeftRadius: theme.roundness,
            position: "absolute",
            bottom: 0,
            left: 0,
          }}
        />
        <View
          style={{
            backgroundColor: pixTheme.colors.accent,
            width: "50%",
            height: "50%",
            borderTopRightRadius: theme.roundness,
            position: "absolute",
            top: 0,
            right: 0,
          }}
        />
        <View
          style={{
            backgroundColor: pixTheme.colors.surface,
            width: "50%",
            height: "50%",
            borderBottomRightRadius: theme.roundness,
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        />
      </View>
      <Text>{pixTheme.name}</Text>
    </TouchableOpacity>
  );
}

export default function ThemeSelector({
  setSelectingTheme,
}: {
  setSelectingTheme: (value: React.SetStateAction<boolean>) => void;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0)",
        elevation: 100,
        alignSelf: "center",
      }}
    >
      <ScrollView
        style={{
          position: "absolute",
          width: "75%",
          height: "95%",
          backgroundColor: theme.colors.primary,
          elevation: 100,
          borderRadius: theme.roundness,
          alignSelf: "center",
        }}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Headline>Select Theme</Headline>
        {allThemes.map((pixTheme) => (
          <ThemeDisplay
            theme={theme}
            pixTheme={pixTheme}
            setSelectingTheme={setSelectingTheme}
            key={pixTheme.name}
          />
        ))}
      </ScrollView>
    </View>
  );
}
