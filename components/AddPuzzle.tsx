import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as React from "react";
import { View } from "react-native";
import { Headline, ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction } from "redux";

import { functions } from "../FirebaseApp";
import { setGalleryPuzzles } from "../store/reducers/galleryPuzzles";
import { setReceivedPuzzles } from "../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../store/reducers/sentPuzzles";
import { Puzzle, AddPuzzleRoute, ScreenNavigation, RootState } from "../types";
import { goToScreen, downloadImage } from "../util";
import Logo from "./Logo";
import Title from "./Title";

export default function AddPuzzle({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: AddPuzzleRoute;
}): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const galleryPuzzles = useSelector(
    (state: RootState) => state.galleryPuzzles
  );

  const { sourceList } = route.params;

  let puzzleList: Puzzle[];
  let storageItem: string;
  let setPuzzles: (puzzleList: Puzzle[]) => AnyAction;
  if (sourceList === "sent") {
    puzzleList = sentPuzzles;
    storageItem = "@pixterySentPuzzles";
    setPuzzles = setSentPuzzles;
  } else if (sourceList === "received") {
    puzzleList = receivedPuzzles;
    storageItem = "@pixteryPuzzles";
    setPuzzles = setReceivedPuzzles;
  } else {
    puzzleList = galleryPuzzles;
    setPuzzles = setGalleryPuzzles;
  }

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

  const searchForLocalMatch = async (publicKey: string): Promise<boolean> => {
    const matchingPuzzle = puzzleList.filter(
      (puz) => puz.publicKey === publicKey
    );
    //also check if we have the image already
    if (matchingPuzzle.length) {
      const { imageURI } = matchingPuzzle[0];
      const fileName = imageURI.slice(imageURI.lastIndexOf("/") + 1);
      const extension = imageURI.slice(-4) === ".jpg" ? "" : ".jpg";
      const localURI = FileSystem.documentDirectory + fileName + extension;
      const fileInfo = await FileSystem.getInfoAsync(localURI);
      return fileInfo.exists;
    } else return false;
  };

  const savePuzzle = async (newPuzzle: Puzzle) => {
    try {
      await downloadImage(newPuzzle);
      // save puzzle data to localStorage
      const allPuzzles = [
        newPuzzle,
        ...puzzleList.filter((p) => p.publicKey !== newPuzzle.publicKey),
      ];
      if (storageItem)
        await AsyncStorage.setItem(storageItem, JSON.stringify(allPuzzles));
      dispatch(setPuzzles(allPuzzles));
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
        const { publicKey } = route.params; //no need to check whether publicKey exists, that is done by Splash before navigating here
        const match = await searchForLocalMatch(publicKey);
        if (match) goToScreen(navigation, "Puzzle", { publicKey, sourceList });
        else {
          const newPuzzle: Puzzle | void = await fetchPuzzle(publicKey);
          if (newPuzzle) {
            await savePuzzle(newPuzzle);
            goToScreen(navigation, "Puzzle", { publicKey, sourceList });
          } else goToScreen(navigation, "Home");
        }
      } catch (e) {
        console.log(e);
        goToScreen(navigation, "Home"); //if there is an error in this method or in inner methods, abandon adding the puzzle and go to the home screen
      }
    };
    searchForPuzzle();
  });

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
      <Headline>
        {sourceList === "gallery" ? "Loading Gallery" : "Adding New Pixtery"}
      </Headline>
      <ActivityIndicator animating color={theme.colors.text} size="large" />
    </View>
  );
}
