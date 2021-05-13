import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as React from "react";
import { View } from "react-native";
import { Headline, ActivityIndicator } from "react-native-paper";
import { Theme } from "react-native-paper/lib/typescript/types";

import { storage, functions } from "../FirebaseApp";
import { Puzzle, AddPuzzleRoute, ScreenNavigation } from "../types";
import { goToScreen } from "../util";
import Logo from "./Logo";
import Title from "./Title";

export default function AddPuzzle({
  navigation,
  theme,
  receivedPuzzles,
  route,
  setReceivedPuzzles,
}: {
  navigation: ScreenNavigation;
  theme: Theme;
  receivedPuzzles: Puzzle[];
  route: AddPuzzleRoute;
  setReceivedPuzzles: (puzzles: Puzzle[]) => void;
}): JSX.Element {
  const fetchPuzzle = async (publicKey: string): Promise<Puzzle | void> => {
    const queryPuzzleCallable = functions.httpsCallable("queryPuzzle");
    let puzzleData;
    try {
      puzzleData = await queryPuzzleCallable({ publicKey });
      return puzzleData.data; // get just nested data from returned JSON
    } catch (error) {
      console.error(error);
      throw new Error(error); //rethrow the error so it can be caught by outer method
    }
  };

  const searchForLocalMatch = (publicKey: string): string | null => {
    const matchingPuzzle = receivedPuzzles.filter(
      (puz) => puz.publicKey === publicKey
    );
    return matchingPuzzle.length ? publicKey : null;
  };

  const savePuzzle = async (newPuzzle: Puzzle) => {
    try {
      const { imageURI } = newPuzzle;
      // for now, giving image a filename based on URL from server, can change later if needed
      const fileName = imageURI.slice(imageURI.lastIndexOf("/") + 1);
      const downloadURL = await storage.ref("/" + imageURI).getDownloadURL();

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
        await FileSystem.downloadAsync(downloadURL, localURI);
      }
      // save puzzle data to localStorage
      newPuzzle.imageURI = localURI;
      const allPuzzles = [...receivedPuzzles, newPuzzle];
      await AsyncStorage.setItem("@pixteryPuzzles", JSON.stringify(allPuzzles));
      setReceivedPuzzles(allPuzzles);
    } catch (e) {
      console.log(e);
      alert("Could not save puzzle to your phone");
      throw new Error(e); //rethrow error for outer method
    }
  };

  React.useEffect(() => {
    const searchForPuzzle = async () => {
      // all logic determining which screen to navigate to happens here in order to place navigation at the end of every branch. Otherwise the function will continue running after navigating away, which can cause the user to get redirected if there is an uncaught navigation further down the line
      try {
        // changed this slightly to enforce type checking
        const { queryParams } = Linking.parse(route.params.url);
        if (queryParams && queryParams.publicKey) {
          const { publicKey } = queryParams;
          const match = searchForLocalMatch(publicKey);
          if (match) goToScreen(navigation, "Puzzle", { publicKey });
          else {
            const newPuzzle: Puzzle | void = await fetchPuzzle(publicKey);
            if (newPuzzle) {
              await savePuzzle(newPuzzle);
              goToScreen(navigation, "Puzzle", { publicKey });
            } else goToScreen(navigation, "Home");
          }
        } else goToScreen(navigation, "Home");
      } catch (e) {
        console.log(e);
        goToScreen(navigation, "Home"); //if there is an error in this method or in inner methods, abandon adding the puzzle and go to the home screen
      }
    };
    searchForPuzzle();
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
