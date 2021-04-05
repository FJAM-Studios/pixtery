import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { TESTING_MODE } from "./constants";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import PuzzlePiece from "./PuzzlePiece";
import { shuffle, generateJigsawPiecePaths } from "./util";
import { Puzzle, GridSections } from "./types";

//disable shuffling for testing
const disableShuffle = TESTING_MODE;
// note: not working yet when grid changes; to confirm whether that is needed given that is info that is received
export default ({
  boardSize,
  theme,
  navigation,
  receivedPuzzles,
  route,
}: {
  boardSize: number;
  theme: any;
  navigation: any;
  receivedPuzzles: Puzzle[];
  route: any;
}) => {
  const { imageURI, puzzleType, gridSize, message } = route.params;
  const squareSize = boardSize / gridSize;
  const image = { uri: imageURI };
  //doesn't need to be part of state now, since you can't change a received puzzle
  const [piecePaths, setPiecePaths] = useState(
    generateJigsawPiecePaths(gridSize, squareSize)
  );

  // populates X Y coordinates for upper left corner of each grid section
  const getGridSections = (): GridSections => {
    // separated row and col in case needed for future flexibility
    let gridSections: GridSections = {
      rowDividers: [0],
      colDividers: [0],
    };
    for (let i = 1; i < gridSize; i++) {
      let x: number;
      let y: number;
      if (puzzleType === "squares") {
        x = i * squareSize;
        y = i * squareSize;
      }
      //if jigsaw
      else {
        x = squareSize * 0.75 + (i - 1) * squareSize;
        y = squareSize * 0.75 + (i - 1) * squareSize;
      }
      gridSections.rowDividers.push(x);
      gridSections.colDividers.push(y);
    }
    return gridSections;
  };

  //same, doesn't need to be state
  const [gridSections, setGridSections] = useState<GridSections>(
    getGridSections()
  );

  const fillArray = (gridSize: number): number[] => {
    const numberArray = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      numberArray.push(i);
    }
    return numberArray;
  };

  //same, doesn't need to be state
  const [shuffledPieces, setShuffledPieces] = useState<number[]>(
    shuffle(fillArray(gridSize), disableShuffle)
  );

  const [currentBoard, setCurrentBoard] = useState<(number | null)[]>([
    ...shuffledPieces,
  ]);

  const [winMessage, setWinMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkWin = (): void => {
    if (currentBoard[0] !== 0) return;
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] !== i) return;
    }
    const winMessage = message.length
      ? message
      : "Congrats! You solved the puzzle!";
    setWinMessage(winMessage);
  };

  useEffect(() => {
    checkWin();
  }, [currentBoard]);

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
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {shuffledPieces.map((num: number, ix: number) => (
          <PuzzlePiece
            key={num}
            num={num}
            ix={ix}
            gridSize={gridSize}
            squareSize={squareSize}
            puzzleType={puzzleType}
            image={image}
            piecePath={piecePaths[num]}
            boardSize={boardSize}
            gridSections={gridSections}
            currentBoard={currentBoard}
            setCurrentBoard={setCurrentBoard}
            setErrorMessage={setErrorMessage}
          />
        ))}
        <View>
          <View style={styles.messageContainer}>
            <Text style={styles.winText}>{winMessage}</Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
});
