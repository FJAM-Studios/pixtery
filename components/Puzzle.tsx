import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useEffect, useState, useRef } from "react";
import { Text, View, StyleSheet, Image, LayoutChangeEvent } from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import { Theme } from "react-native-paper/lib/typescript/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { DEGREE_CONVERSION, TESTING_MODE } from "../constants";
import {
  shuffle,
  generateJigsawPiecePaths,
  getSnapPoints,
  fillArray,
  getInitialDimensions,
  validateBoard,
} from "../puzzleUtils";
import { setReceivedPuzzles } from "../store/reducers/receivedPuzzles";
import {
  Puzzle,
  Piece,
  Point,
  BoardSpace,
  ScreenNavigation,
  PuzzleRoute,
  RootState,
} from "../types";
import { saveToLibrary } from "../util";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import PuzzlePiece from "./PuzzlePiece";

//disable shuffling for testing
const disableShuffle = TESTING_MODE;
export default function PuzzleComponent({
  navigation,
  route,
}: {
  navigation: ScreenNavigation;
  route: PuzzleRoute;
}): JSX.Element {
  const dispatch = useDispatch();
  const { publicKey } = route.params;
  const theme = useSelector((state: RootState) => state.theme);
  const { boardSize } = useSelector((state: RootState) => state.screenHeight);
  const receivedPuzzles = useSelector(
    (state: RootState) => state.receivedPuzzles
  );
  const sentPuzzles = useSelector((state: RootState) => state.sentPuzzles);
  const adHeight = useSelector((state: RootState) => state.adHeight);

  const [puzzle, setPuzzle] = useState<Puzzle>();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [snapPoints, setSnapPoints] = useState<Point[]>([]);
  const [winMessage, setWinMessage] = useState<string>("");
  const [puzzleAreaDimensions, setPuzzleAreaDimensions] = useState({
    puzzleAreaWidth: 0,
    puzzleAreaHeight: 0,
  });
  const [sound, setSound] = useState<Audio.Sound>();
  const [opaque, setOpaque] = useState<boolean>(false);
  const [isReady, setReady] = useState<boolean>(false);
  const styleProps = {
    theme,
    boardSize,
  };

  // z index and current board are not handled through react state so that they don't
  // cause Puzzle/PuzzlePiece re-renders, which would break the positional tracking
  // for native animations and gesturehandler

  // when a piece is moved, it is given new maxZ through updateZ function below
  const maxZ = useRef(0);

  const updateZ = () => {
    maxZ.current += 1;
    return maxZ.current;
  };

  // store current pieces snapped to board
  const currentBoard = useRef<BoardSpace[]>([]);

  //set up the camera click sound and clean up on unmount
  useEffect(() => {
    const initializeSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/camera-click.wav")
      );
      setSound(sound);
    };

    initializeSound();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const animateWin = async () => {
    setTimeout(() => {
      setOpaque(true);
      setTimeout(() => {
        const winMessage =
          puzzle && puzzle.message && puzzle.message.length > 0
            ? puzzle.message
            : "Congrats! You solved the puzzle!";
        setWinMessage(winMessage);
        setOpaque(false);
      }, 100);
      if (sound) sound.playAsync();
    }, 100);
  };

  const checkWin = () => {
    if (puzzle && validateBoard(currentBoard.current, puzzle.gridSize)) {
      animateWin();
      markPuzzleComplete(publicKey);
    }
  };

  const measurePuzzleArea = (ev: LayoutChangeEvent): void => {
    if (puzzleAreaDimensions.puzzleAreaHeight) return;
    setPuzzleAreaDimensions({
      puzzleAreaWidth: ev.nativeEvent.layout.width,
      puzzleAreaHeight: ev.nativeEvent.layout.height,
    });
  };

  useEffect(() => {
    setReady(false);
    const matchingPuzzles = [...receivedPuzzles, ...sentPuzzles].filter(
      (puz) => puz.publicKey === publicKey
    );
    if (matchingPuzzles.length && puzzleAreaDimensions.puzzleAreaWidth > 0) {
      // this enables us to dynamically reference parent container padding below when we calculate ad banner position
      const parentContainerStyle = StyleSheet.flatten([
        styles(styleProps).parentContainer,
      ]);

      const pickedPuzzle = matchingPuzzles[0];
      const { gridSize, puzzleType, imageURI } = pickedPuzzle;
      const squareSize = boardSize / gridSize;
      const numPieces = gridSize * gridSize;
      const minSandboxY = boardSize * 1.01;
      // maxSandboxY (upper left max bound of initial piece position)
      // sometimes depending on screenheight, min is larger than max
      const maxSandboxY = Math.max(
        puzzleAreaDimensions.puzzleAreaHeight -
          adHeight -
          parentContainerStyle.padding * 2 -
          squareSize,
        minSandboxY
      );

      setPuzzle(pickedPuzzle);

      const shuffleOrder = shuffle(fillArray(gridSize), disableShuffle);

      const createPieces = async () => {
        try {
          const _pieces: Piece[] = [];
          const piecePaths =
            puzzleType === "jigsaw"
              ? generateJigsawPiecePaths(gridSize, squareSize)
              : [];
          // manipulate images in Puzzle component instead to save on renders
          for (
            let shuffledIndex = 0;
            shuffledIndex < numPieces;
            shuffledIndex++
          ) {
            const solvedIndex = shuffleOrder[shuffledIndex];
            const {
              pieceDimensions,
              initialPlacement,
              viewBox,
              snapOffset,
            } = getInitialDimensions(
              puzzleType,
              minSandboxY,
              maxSandboxY,
              solvedIndex,
              shuffledIndex,
              gridSize,
              squareSize,
              boardSize
            );

            const href = await ImageManipulator.manipulateAsync(
              // testing an invalid imageURI, in case the pic is deleted/corrupted
              // imageURI + "bogus",
              imageURI,
              [
                {
                  resize: {
                    width: boardSize,
                    height: boardSize,
                  },
                },
                {
                  crop: { ...viewBox, ...pieceDimensions },
                },
              ],
              { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
            );

            const piece: Piece = {
              href,
              pieceDimensions,
              piecePath: piecePaths.length ? piecePaths[solvedIndex] : "",
              initialPlacement,
              initialRotation:
                Math.floor(Math.random() * 4) * 90 * DEGREE_CONVERSION,
              solvedIndex,
              snapOffset,
            };
            _pieces.push(piece);
          }
          setPieces(_pieces);
          setReady(true);
        } catch (e) {
          console.log(e);
          alert("Could not load puzzle!");
          navigation.navigate("Home");
        }
      };
      createPieces();
      setSnapPoints(getSnapPoints(gridSize, squareSize));
      setWinMessage("");
      currentBoard.current = [];
      maxZ.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    boardSize,
    navigation,
    publicKey,
    puzzleAreaDimensions,
    receivedPuzzles,
    sentPuzzles,
    adHeight,
  ]);

  const markPuzzleComplete = async (key: string) => {
    const allPuzzles = [
      ...receivedPuzzles.map((puz) => {
        return {
          ...puz,
          completed: key === puz.publicKey ? true : puz.completed,
        };
      }),
    ];
    await AsyncStorage.setItem("@pixteryPuzzles", JSON.stringify(allPuzzles));
    dispatch(setReceivedPuzzles(allPuzzles));
  };

  // need to return dummy component to measure the puzzle area via onLayout
  if (!puzzleAreaDimensions.puzzleAreaHeight)
    return (
      <AdSafeAreaView style={styles(styleProps).parentContainer}>
        <Header
          notifications={
            receivedPuzzles.filter((puzzle) => !puzzle.completed).length
          }
          navigation={navigation}
        />
        <View
          onLayout={(ev) => measurePuzzleArea(ev)}
          style={{
            flex: 1,
            justifyContent: "flex-end",
          }}
        />
      </AdSafeAreaView>
    );
  if (isReady && puzzle && pieces.length) {
    return opaque ? (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
        }}
      />
    ) : (
      <AdSafeAreaView style={styles(styleProps).parentContainer}>
        <Header
          notifications={
            receivedPuzzles.filter((puzzle) => !puzzle.completed).length
          }
          navigation={navigation}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "flex-start",
            alignSelf: "center",
            width: boardSize,
          }}
        >
          <View style={styles(styleProps).puzzleArea}>
            <View style={styles(styleProps).messageContainer}>
              <Text style={styles(styleProps).startText}>
                Drag pieces onto the board!
              </Text>
              <Text style={styles(styleProps).startText}>
                Double tap a piece to rotate!
              </Text>
            </View>
          </View>
          {!winMessage ? (
            pieces.map((piece: Piece, ix: number) => (
              <PuzzlePiece
                key={ix}
                piece={piece}
                puzzleAreaDimensions={puzzleAreaDimensions}
                updateZ={updateZ}
                snapPoints={snapPoints}
                currentBoard={currentBoard.current}
                checkWin={checkWin}
              />
            ))
          ) : (
            <>
              <Image
                source={{ uri: puzzle.imageURI }}
                style={{
                  width: boardSize,
                  height: boardSize,
                }}
              />
              <View style={styles(styleProps).winContainer}>
                <Text style={styles(styleProps).winText}>{winMessage}</Text>
              </View>
              <Button
                icon="download-circle"
                mode="contained"
                style={{ margin: 15 }}
                onPress={() => saveToLibrary(puzzle.imageURI)}
              >
                Save Image
              </Button>
            </>
          )}
        </View>
      </AdSafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles(styleProps).parentContainer}>
        <ActivityIndicator animating color={theme.colors.text} size="large" />
      </SafeAreaView>
    );
  }
}

const styles = (props: { theme: Theme; boardSize: number }) =>
  StyleSheet.create({
    messageContainer: {
      flexDirection: "column",
      zIndex: -1,
    },
    winContainer: {
      flexDirection: "row",
      zIndex: 1,
    },
    winText: {
      fontSize: 25,
      flexWrap: "wrap",
      textAlign: "center",
      flex: 1,
      color: "white",
      marginTop: 20,
    },
    startText: {
      fontSize: 20,
      flexWrap: "wrap",
      textAlign: "center",
      margin: 10,
      color: "white",
    },
    puzzleArea: {
      width: props.boardSize,
      height: props.boardSize,
      borderWidth: 4,
      borderColor: "white",
      position: "absolute",
      top: "0%",
      justifyContent: "center",
    },
    parentContainer: {
      flex: 1,
      flexDirection: "column",
      padding: 10,
      backgroundColor: props.theme.colors.background,
      justifyContent: "flex-start",
    },
  });
