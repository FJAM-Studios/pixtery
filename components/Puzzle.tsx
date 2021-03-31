import React, { useState } from "react";
import {
  Text,
  View,
  Button,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";

import PuzzlePiece from "./PuzzlePiece";
import { shuffle, generateJigsawPiecePaths } from "../util";
import { Puzzle } from "../types";

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
  const { imageURI, puzzleType, gridSize } = route.params;
  const squareSize = boardSize / gridSize;
  const image = { uri: imageURI };
  const [piecePaths, setPiecePaths] = useState(
    generateJigsawPiecePaths(gridSize, squareSize)
  );

  const fillArray = (gridSize: number): number[] => {
    const numberArray = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      numberArray.push(i);
    }
    return numberArray;
  };

  const [shuffledPieces, setRand] = useState(shuffle(fillArray(gridSize)));

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
      <View>
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
          />
        ))}
      </View>
    </SafeAreaView>
  );
};
