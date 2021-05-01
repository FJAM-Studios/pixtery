import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { DEGREE_CONVERSION, TESTING_MODE } from "../constants";
import { Puzzle, Piece, Point } from "../types";
import {
  shuffle,
  generateJigsawPiecePaths,
  getGridSections,
  fillArray,
  getInitialDimensions,
} from "../util";
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
  const [currentBoard, setCurrentBoard] = useState<number[]>([]);
  const [snapPoints, setSnapPoints] = useState<Point[]>([]);
  const [winMessage, setWinMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [firstSnap, setFirstSnap] = useState(false);
  const [puzzleAreaDimensions, setPuzzleAreaDimensions] = useState({
    puzzleAreaWidth: 0,
    puzzleAreaHeight: 0,
  });

  const measurePuzzleArea = (ev: any): void => {
    if (puzzleAreaDimensions.puzzleAreaHeight) return;
    setPuzzleAreaDimensions({
      puzzleAreaWidth: ev.nativeEvent.layout.width,
      puzzleAreaHeight: ev.nativeEvent.layout.height,
    });
  };

  const checkWin = (): boolean => {
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] !== i) return false;
    }
    return true;
  };

  const checkFirstSnap = (): void => {
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] !== null) setFirstSnap(true);
    }
  };

  useEffect(() => {
    if (puzzle && checkWin()) {
      const winMessage =
        puzzle.message && puzzle.message.length > 0
          ? puzzle.message
          : "Congrats! You solved the puzzle!";
      setWinMessage(winMessage);
      markPuzzleComplete(publicKey);
    }
    if (!firstSnap) checkFirstSnap();
  }, [currentBoard]);

  useEffect(() => {
    const matchingPuzzles = [...receivedPuzzles, ...sentPuzzles].filter(
      (puz) => puz.publicKey === publicKey
    );
    if (matchingPuzzles.length) {
      const pickedPuzzle = matchingPuzzles[0];
      const { gridSize } = pickedPuzzle;
      const squareSize = boardSize / gridSize;
      const numPieces = gridSize * gridSize;
      const minSandboxY = boardSize * 1.05;
      const maxSandboxY = puzzleAreaDimensions.puzzleAreaHeight - squareSize;

      setPuzzle(pickedPuzzle);

      const shuffleOrder = shuffle(fillArray(gridSize), disableShuffle);

      const createPieces = async () => {
        const _pieces: Piece[] = [];
        const piecePaths =
          pickedPuzzle.puzzleType === "jigsaw"
            ? generateJigsawPiecePaths(gridSize, squareSize)
            : [];
        // manipulate images in Puzzle component instead to save on renders
        for (let i = 0; i < numPieces; i++) {
          const solvedIndex = shuffleOrder[i];
          const [
            squareX,
            squareY,
            widthY,
            widthX,
            initX,
            initY,
            viewBoxX,
            viewBoxY,
            solutionX,
            solutionY,
          ] = getInitialDimensions(
            pickedPuzzle.puzzleType,
            minSandboxY,
            maxSandboxY,
            solvedIndex,
            i,
            gridSize,
            squareSize
          );

          const href = await ImageManipulator.manipulateAsync(
            pickedPuzzle.imageURI,
            [
              {
                resize: {
                  width: boardSize,
                  height: boardSize,
                },
              },
              {
                crop: {
                  originX: viewBoxX,
                  originY: viewBoxY,
                  width: widthX,
                  height: widthY,
                },
              },
            ],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );

          const piece: Piece = {
            href,
            pieceWidth: widthX,
            pieceHeight: widthY,
            piecePath: piecePaths.length ? piecePaths[solvedIndex] : "",
            initX,
            initY,
            initialRotation:
              Math.floor(Math.random() * 4) * 90 * DEGREE_CONVERSION,
            solvedIndex,
          };
          _pieces.push(piece);
        }
        setPieces(_pieces);
      };
      createPieces();

      const gridSections = getGridSections(pickedPuzzle, squareSize);
      const _snapPoints: Point[] = [];
      for (let i = 0; i < pickedPuzzle.gridSize; i++) {
        for (let j = 0; j < pickedPuzzle.gridSize; j++) {
          _snapPoints.push({
            x: (j + 0.5) * squareSize,
            y: (i + 0.5) * squareSize,
          });
        }
      }
      console.log(_snapPoints);
      console.log(gridSections);
      setSnapPoints(_snapPoints);
      setCurrentBoard(new Array(numPieces).fill(null));
      setWinMessage("");
      setErrorMessage("");
      setFirstSnap(false);
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

  // when a piece is moved, it is given new maxZ through updateZ function below
  // this ensures no re-rendering which would reset the native animation
  let maxZ = 0;

  const updateZ = () => {
    maxZ += 1;
    return maxZ;
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
              {!firstSnap ? (
                <Text style={styles(styleProps).startText}>
                  Drag and rotate pieces onto this board!
                </Text>
              ) : null}
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
