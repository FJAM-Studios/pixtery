import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useEffect, useState, useRef } from "react";
import { Text, View, StyleSheet, Image, LayoutChangeEvent } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { DEGREE_CONVERSION, TESTING_MODE } from "../constants";
import {
  shuffle,
  generateJigsawPiecePaths,
  getSnapPoints,
  fillArray,
  getInitialDimensions,
  validateBoard,
} from "../puzzleUtils";
import { Puzzle, Piece, Point, BoardSpace } from "../types";
import AdSafeAreaView from "./AdSafeAreaView";
import Header from "./Header";
import PuzzlePiece from "./PuzzlePiece";

//disable shuffling for testing
const disableShuffle = TESTING_MODE;

export default ({
  boardSize,
  theme,
  navigation,
  receivedPuzzles,
  sentPuzzles,
  route,
  setReceivedPuzzles,
}: {
  boardSize: number;
  theme: any;
  navigation: any;
  receivedPuzzles: Puzzle[];
  sentPuzzles: Puzzle[];
  route: any;
  setReceivedPuzzles: (puzzles: Puzzle[]) => void;
}): JSX.Element => {
  const { publicKey } = route.params;

  const [puzzle, setPuzzle] = useState<Puzzle>();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [snapPoints, setSnapPoints] = useState<Point[]>([]);
  const [winMessage, setWinMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [puzzleAreaDimensions, setPuzzleAreaDimensions] = useState({
    puzzleAreaWidth: 0,
    puzzleAreaHeight: 0,
  });

  // z index and current board are not handled through react state so that they don't
  // cause Puzzle/PuzzlePiece re-renders, which would break the positional tracking
  // for native animations and gesturehandler

  // when a piece is moved, it is given new maxZ through updateZ function below
  let maxZ = useRef(0).current;

  const updateZ = () => {
    maxZ += 1;
    return maxZ;
  };

  // store current pieces snapped to board
  let currentBoard: BoardSpace[] = useRef([]).current;

  const checkWin = () => {
    if (puzzle && validateBoard(currentBoard, puzzle.gridSize)) {
      const winMessage =
        puzzle.message && puzzle.message.length > 0
          ? puzzle.message
          : "Congrats! You solved the puzzle!";
      setWinMessage(winMessage);
      markPuzzleComplete(publicKey);
    }
  };

  const measurePuzzleArea = (ev: LayoutChangeEvent): void => {
    console.log('puz area height', ev.nativeEvent.layout.height)
    if (puzzleAreaDimensions.puzzleAreaHeight) return;
    setPuzzleAreaDimensions({
      puzzleAreaWidth: ev.nativeEvent.layout.width,
      puzzleAreaHeight: ev.nativeEvent.layout.height,
    });
  };

  useEffect(() => {
    const matchingPuzzles = [...receivedPuzzles, ...sentPuzzles].filter(
      (puz) => puz.publicKey === publicKey
    );
    if (matchingPuzzles.length) {
      const pickedPuzzle = matchingPuzzles[0];
      const { gridSize, puzzleType, imageURI } = pickedPuzzle;
      const squareSize = boardSize / gridSize;
      const numPieces = gridSize * gridSize;
      const minSandboxY = boardSize * 1.05;
      const maxSandboxY = puzzleAreaDimensions.puzzleAreaHeight - squareSize;

      setPuzzle(pickedPuzzle);

      const shuffleOrder = shuffle(fillArray(gridSize), disableShuffle);

      const createPieces = async () => {
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
            squareSize
          );

          const href = await ImageManipulator.manipulateAsync(
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
      };
      createPieces();
      setSnapPoints(getSnapPoints(gridSize, squareSize));
      setWinMessage("");
      setErrorMessage("");
      currentBoard = new Array(numPieces).fill(null);
      maxZ = 0;
    }
  }, [publicKey, puzzleAreaDimensions]);

  const styleProps = {
    theme,
    boardSize,
  };

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
    setReceivedPuzzles(allPuzzles);
  };

  // need to return dummy component to measure the puzzle area via onLayout
  if (!puzzleAreaDimensions.puzzleAreaHeight)
    return (
      <AdSafeAreaView style={styles(styleProps).parentContainer}>
        <Header
          theme={theme}
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
  if (puzzle && pieces.length) {
    return (
      <AdSafeAreaView style={styles(styleProps).parentContainer}>
        <Header
          theme={theme}
          notifications={
            receivedPuzzles.filter((puzzle) => !puzzle.completed).length
          }
          navigation={navigation}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <View style={styles(styleProps).puzzleArea}>
            <View style={styles(styleProps).messageContainer}>
              <Text style={styles(styleProps).startText}>
                Drag and rotate pieces onto this board!
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
                currentBoard={currentBoard}
                checkWin={checkWin}
              />
            ))
          ) : (
            <Image
              source={{ uri: puzzle.imageURI }}
              style={{
                width: boardSize,
                height: boardSize,
                position: "absolute",
                top: "0%",
              }}
            />
          )}
          <View style={styles(styleProps).messageContainer}>
            <Text style={styles(styleProps).winText}>{winMessage}</Text>
          </View>
          <View style={styles(styleProps).messageContainer}>
            <Text style={styles(styleProps).errorText}>{errorMessage}</Text>
          </View>
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
};

const styles = (props: any) =>
  StyleSheet.create({
    messageContainer: {
      flexDirection: "row",
      zIndex: -1,
    },
    errorText: {
      fontSize: 20,
      flexWrap: "wrap",
      textAlign: "center",
      flex: 1,
      color: "orange",
    },
    winText: {
      fontSize: 20,
      flexWrap: "wrap",
      textAlign: "center",
      flex: 1,
      color: "white",
    },
    startText: {
      fontSize: 20,
      flexWrap: "wrap",
      textAlign: "center",
      flex: 1,
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
