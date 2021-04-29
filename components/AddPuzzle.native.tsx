import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as React from "react";
import { View } from "react-native";
import { Headline, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { Puzzle } from "../types";
import Header from "./Header";
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
  const { imageURI, publicKey } = newPuzzle;
  const [isLoading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        // for now, giving image a filename based on URL from server, can change later if needed
        const fileName = imageURI.slice(imageURI.lastIndexOf("/") + 1);

        // create directory for pixtery files if it doesn't exist
        const pixteryDir = FileSystem.cacheDirectory + "pixtery/";
        const dirInfo = await FileSystem.getInfoAsync(pixteryDir);
        if (!dirInfo.exists) {
          console.log("Directory doesn't exist, creating...");
          await FileSystem.makeDirectoryAsync(pixteryDir, {
            intermediates: true,
          });
        }
        const localURI = pixteryDir + fileName;
        // if you already have this image, don't download it
        const fileInfo = await FileSystem.getInfoAsync(localURI);
        if (!fileInfo.exists) {
          console.log("Image doesn't exist, downloading...");
          // download the image from pixtery server and save to pixtery dir
          await FileSystem.downloadAsync(imageURI, localURI);
        }
        // save puzzle data to localStorage
        newPuzzle.imageURI = localURI;
        const allPuzzles = [...receivedPuzzles, newPuzzle];
        await AsyncStorage.setItem(
          "@pixteryPuzzles",
          JSON.stringify(allPuzzles)
        );
        setReceivedPuzzles(allPuzzles);
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

  if (isLoading) {
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        padding: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "flex-start",
      }}
    >
      <Header
        theme={theme}
        notifications={
          receivedPuzzles.filter((puzzle) => !puzzle.completed).length
        }
        navigation={navigation}
      />
    </SafeAreaView>
  );
}
