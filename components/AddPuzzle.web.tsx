import { CommonActions } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import { Headline, ActivityIndicator } from "react-native-paper";

import { Puzzle } from "../types";
import Logo from "./Logo";
import Title from "./Title";

export default function AddPuzzle({
  navigation,
  theme,
  receivedPuzzles,
  route,
  setReceivedPuzzles,
  setSelectedPuzzle,
}: {
  navigation: any;
  theme: any;
  receivedPuzzles: Puzzle[];
  route: any;
  setReceivedPuzzles: (puzzles: Puzzle[]) => void;
  setSelectedPuzzle: Function;
}): JSX.Element {
  const newPuzzle: Puzzle = route.params;

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        //replace puzzle's partial URI with full URL to remote image
        setReceivedPuzzles([newPuzzle]);
        setSelectedPuzzle(newPuzzle);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Puzzle" }],
          })
        );
      } catch (e) {
        console.log(e);
      }
    };
    loadImage();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Logo width="100" height="100" />
      <Title width="100" height="35" />
      <Headline>Adding New Pixtery</Headline>
      <ActivityIndicator animating color={theme.colors.text} size="large" />
    </View>
  );
}
