import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useEffect } from "react";
import { View } from "react-native";
import { Headline, ActivityIndicator } from "react-native-paper";
import Toast from "react-native-root-toast";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction } from "redux";

import { queryPuzzleCallable } from "../../FirebaseApp";
import { setReceivedPuzzles } from "../../store/reducers/receivedPuzzles";
import { setSentPuzzles } from "../../store/reducers/sentPuzzles";
import { LibraryContainerProps, Puzzle, RootState } from "../../types";
import { downloadImage } from "../../util";
import { Logo, Title } from "../StaticElements";

export default function AddPuzzle({
  navigation,
  route,
}: LibraryContainerProps<"AddPuzzle">): JSX.Element {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const { sourceList } = route.params;
  let puzzleList: Puzzle[];
  let storageItem: string;
  let setPuzzles: (puzzleList: Puzzle[]) => AnyAction;
  if (sourceList === "sent") {
    puzzleList = sentPuzzles;
    storageItem = "@pixterySentPuzzles";
    setPuzzles = setSentPuzzles;
  } else {
    puzzleList = receivedPuzzles;
    storageItem = "@pixteryPuzzles";
    setPuzzles = setReceivedPuzzles;
  }

  const fetchPuzzle = async (publicKey: string): Promise<Puzzle | void> => {
    let puzzleData;
    try {
      puzzleData = (await queryPuzzleCallable({ publicKey })).data as Puzzle;
      return puzzleData; // get just nested data from returned JSON
    } catch (error) {
      console.log(error);
      if (error instanceof Error) throw new Error(error.message); //rethrow the error so it can be caught by outer method
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
      await AsyncStorage.setItem(storageItem, JSON.stringify(allPuzzles));
      dispatch(setPuzzles(allPuzzles));
    } catch (error) {
      console.log(error);
      alert("Could not save puzzle to your phone");
      if (error instanceof Error) throw new Error(error.message); //rethrow error for outer method
    }
  };

  useEffect(() => {
    const searchForPuzzle = async () => {
      // all logic determining which screen to navigate to happens here in order to place navigation at the end of every branch. Otherwise the function will continue running after navigating away, which can cause the user to get redirected if there is an uncaught navigation further down the line
      try {
        const { publicKey } = route.params; //no need to check whether publicKey exists, that is done by Splash before navigating here
        const match = await searchForLocalMatch(publicKey);
        if (match) navigation.navigate("Puzzle", { publicKey, sourceList });
        else {
          const newPuzzle: Puzzle | void = await fetchPuzzle(publicKey);
          if (newPuzzle) {
            await savePuzzle(newPuzzle);
            navigation.navigate("Puzzle", { publicKey, sourceList });
          } else
            navigation.navigate("MakeContainer", {
              screen: "Make",
            });
        }
      } catch (e) {
        console.log(e);
        Toast.show(
          "Error retrieving Pixtery! Check your connection or try again later.",
          {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
          }
        );
        navigation.navigate("LibraryContainer", {
          screen: "PuzzleListContainer",
          params: { screen: "PuzzleList" },
        });
      }
    };
    console.log("run");
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
