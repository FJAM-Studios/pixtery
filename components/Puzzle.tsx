import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, useWindowDimensions } from "react-native";
import { TESTING_MODE } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import PuzzlePiece from "./PuzzlePiece";
import { shuffle, generateJigsawPiecePaths } from "../util";
import { Puzzle, GridSections } from "../types";
// import { theme } from "../App";

//disable shuffling for testing
const disableShuffle = TESTING_MODE;

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
  const { width, height } = useWindowDimensions();
  const sandBoxHeight = height * 0.95 - squareSize * gridSize;
  const sandBoxWidth = width * 0.95;
  const image = { uri: imageURI };
  const [piecePaths, setPiecePaths] = useState(
    generateJigsawPiecePaths(gridSize, squareSize)
  );
  const [puzzleAreaDimensions, setPuzzleAreaDimensions] = useState({
    puzzleAreaWidth: 0,
    puzzleAreaHeight: 0
  })
  const measurePuzzleArea = (ev: any): void => {
    if(puzzleAreaDimensions.puzzleAreaHeight) return;
    setPuzzleAreaDimensions({ 
        puzzleAreaWidth: ev.nativeEvent.layout.width,
        puzzleAreaHeight: ev.nativeEvent.layout.height
      })
    };
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

  const [shuffledPieces, setShuffledPieces] = useState<number[]>(
    shuffle(fillArray(gridSize), disableShuffle)
  );

  const [currentBoard, setCurrentBoard] = useState<(number | null)[]>(
    Array(shuffledPieces.length).fill(null),
  );

  const [winMessage, setWinMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkWin = (): void => {
    if (currentBoard[0] !== 0) return;
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] !== i) return;
    }
    const winMessage = message && message.length>0
      ? message
      : "Congrats! You solved the puzzle!";
    setWinMessage(winMessage);
  };

  useEffect(() => {
    checkWin();
  }, [currentBoard]);

  const styleProps = {
    theme, boardSize
  }

  // need to return dummy component to measure the puzzle area via onLayout
  if(!puzzleAreaDimensions.puzzleAreaHeight) return (
    <SafeAreaView
      style={styles(styleProps).parentContainer}
    >
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
    >
    </View>
  </SafeAreaView>
  )
  return (
    <SafeAreaView
      style={styles(styleProps).parentContainer}
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
        <View
          style={styles(styleProps).puzzleArea}
        >
          <View style={styles(styleProps).messageContainer}>
            <Text style={styles(styleProps).startText}>Move pieces onto this board!</Text>
          </View>
        </View>
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
            sandBoxHeight={sandBoxHeight}
            sandBoxWidth={sandBoxWidth}
            puzzleAreaDimensions={puzzleAreaDimensions}
          />
        ))}
        <View style={styles(styleProps).messageContainer}>
          <Text style={styles(styleProps).winText}>{winMessage}</Text>
        </View>
        <View style={styles(styleProps).messageContainer}>
          <Text style={styles(styleProps).errorText}>{errorMessage}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = (props: any) => StyleSheet.create({
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
    justifyContent: "center"
  },
  parentContainer: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
    backgroundColor: props.theme.colors.background,
    justifyContent: "flex-start",
  }
});
