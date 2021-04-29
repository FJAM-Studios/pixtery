import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { TESTING_MODE } from "../constants";
import { Puzzle, GridSections } from "../types";
import {
  shuffle,
  generateJigsawPiecePaths,
  getGridSections,
  fillArray,
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
  puzzle,
  receivedPuzzles,
  route,
  setReceivedPuzzles,
}: {
  boardSize: number;
  theme: any;
  navigation: any;
  puzzle: Puzzle;
  receivedPuzzles: Puzzle[];
  route: any;
  setReceivedPuzzles: (puzzles: Puzzle[]) => void;
}): JSX.Element => {
  const [piecePaths, setPiecePaths] = useState<string[]>();

  const [gridSections, setGridSections] = useState<GridSections>();

  const [shuffledPieces, setShuffledPieces] = useState<number[]>();

  const [zIndexes, setZIndexes] = useState<number[]>([]);

  const [highestZ, setHighestZ] = useState<number>(1);

  const [currentBoard, setCurrentBoard] = useState<number[]>([]);

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

  const [winMessage, setWinMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const moveToTop = (idx: number): void => {
    const newIndices = [...zIndexes];
    newIndices[idx] = highestZ + 1;
    setHighestZ(highestZ + 1);
    setZIndexes(newIndices);
  };

  const checkWin = (): boolean => {
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] !== i) return false;
    }
    return true;
  };

  const [firstSnap, setFirstSnap] = useState(false);

  const checkFirstSnap = (): void => {
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] !== null) setFirstSnap(true);
    }
  };

  useEffect(() => {
    if (firstSnap && checkWin()) {
      const winMessage =
        puzzle.message && puzzle.message.length > 0
          ? puzzle.message
          : "Congrats! You solved the puzzle!";
      setWinMessage(winMessage);
      markPuzzleComplete(puzzle.publicKey);
    }
    if (!firstSnap) checkFirstSnap();
  }, [currentBoard]);

  useEffect(() => {
    const { gridSize } = puzzle;
    const squareSize = boardSize / gridSize;
    const numPieces = gridSize * gridSize;
    setPiecePaths(generateJigsawPiecePaths(gridSize, squareSize));
    setGridSections(getGridSections(puzzle, squareSize));
    setShuffledPieces(shuffle(fillArray(gridSize), disableShuffle));
    setCurrentBoard(new Array(numPieces).fill(null));
    setZIndexes(new Array(numPieces).fill(1));
    setWinMessage("");
    setErrorMessage("");
    setFirstSnap(false);
  }, [puzzle]);

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
  if (puzzle && gridSections && piecePaths && shuffledPieces) {
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
                  Move pieces onto this board!
                </Text>
              ) : null}
            </View>
          </View>
          {!winMessage ? (
            shuffledPieces.map((num: number, ix: number) => (
              <PuzzlePiece
                key={num}
                num={num}
                ix={ix}
                gridSize={puzzle.gridSize}
                squareSize={boardSize / puzzle.gridSize}
                puzzleType={puzzle.puzzleType}
                imageURI={puzzle.imageURI}
                piecePath={piecePaths[num]}
                boardSize={boardSize}
                gridSections={gridSections}
                currentBoard={currentBoard}
                setCurrentBoard={setCurrentBoard}
                setErrorMessage={setErrorMessage}
                puzzleAreaDimensions={puzzleAreaDimensions}
                z={zIndexes[ix]}
                moveToTop={moveToTop}
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
