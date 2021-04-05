import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { Headline, ActivityIndicator } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./Header";
import Logo from "./Logo";
import Title from "./Title";
import { Puzzle } from "./types";

//this component will receive a puzzle object from component that opens link
//for now, though, the puzzle object is passed directly from DevTest
export default ({
  navigation,
  theme,
  receivedPuzzles,
  route,
  setReceivedPuzzles,
}: {
  navigation: any;
  theme: any;
  receivedPuzzles: Puzzle[];
  route: any;
  setReceivedPuzzles: (puzzles: Puzzle[]) => void;
}) => {
  const newPuzzle: Puzzle = route.params;
  const { imageURI } = newPuzzle;

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
        // if you already have this image, don't download it
        const fileInfo = await FileSystem.getInfoAsync(pixteryDir + fileName);
        if (!dirInfo.exists) {
          console.log("Image doesn't exist, downloading...");
          // download the image from pixtery server and save to pixtery dir
          await FileSystem.downloadAsync(imageURI, pixteryDir + fileName);
        }
        // save puzzle data to localStorage if it's not already there
        // should probably use a UUID for the puzzle, but for now use filenames
        const puzzleImageFileNames = receivedPuzzles.map((puzzle) =>
          puzzle.imageURI.slice(puzzle.imageURI.lastIndexOf("/") + 1)
        );
        if (!puzzleImageFileNames.includes(fileName)) {
          //update local storage and app state
          const allPuzzles = [...receivedPuzzles, newPuzzle];
          await AsyncStorage.setItem(
            "@pixteryPuzzles",
            JSON.stringify(allPuzzles)
          );
          setReceivedPuzzles(allPuzzles);
          navigation.navigate("PuzzleList");
        }
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
        <ActivityIndicator
          animating={true}
          color={theme.colors.text}
          size="large"
        />
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
};
