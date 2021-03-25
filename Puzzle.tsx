import React, { useState } from "react";
import {
  Text,
  View,
  Button,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";

import PuzzlePiece from "./PuzzlePiece";
import { shuffle, generateJigsawPiecePaths } from "./util";

export default ({
  boardSize,
  imageURI,
  puzzleType,
}: {
  boardSize: number;
  imageURI: string;
  puzzleType: string;
}) => {
  const [gridSize, setGridSize] = useState(3);
  const squareSize = boardSize / gridSize;
  let image: { uri: string };
  if (imageURI && imageURI.length > 0) {
    image = { uri: imageURI };
  } else image = require("./assets/earth.jpg");

  const [piecePaths, setPiecePaths] = useState(
    generateJigsawPiecePaths(gridSize, squareSize)
  );

  const shufflePics = (ev?: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (ev) ev.preventDefault();
    const _rand = [...rand];
    shuffle(_rand);
    setRand(_rand);
  };

  const changeGrid = (up: boolean): void => {
    if (up && gridSize < 5) {
      setGridSize(gridSize + 1);
      setPiecePaths(
        generateJigsawPiecePaths(gridSize + 1, boardSize / (gridSize + 1))
      );
      setRand(shuffle(fillArray(gridSize + 1)));
    }
    if (!up && gridSize > 2) {
      setGridSize(gridSize - 1);
      setPiecePaths(
        generateJigsawPiecePaths(gridSize - 1, boardSize / (gridSize - 1))
      );
      setRand(shuffle(fillArray(gridSize - 1)));
    }
  };

  const fillArray = (gridSize: number): number[] => {
    const numberArray = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      numberArray.push(i);
    }
    return numberArray;
  };

  const [rand, setRand] = useState(shuffle(fillArray(gridSize)));

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        alignSelf: "center",
        backgroundColor: "slateblue",
        width: "95%",
      }}
    >
      {/* could probably cut down on some of these props*/}
      {rand.map((num: number, ix: number) => (
        <PuzzlePiece
          // this random key forces Draggable/React to rerender these pieces when changing board
          // seems like cheating, but maybe not?
          key={Math.random() * (1 + ix)}
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
      <View
        style={{
          flex: 1,
          width: "100%",
          maxHeight: "5%",
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 10,
        }}
      >
        <Button
          title="-"
          onPress={() => changeGrid(false)}
          disabled={gridSize === 2}
        />
        <Text style={{ fontSize: 20 }}>Grid Size: {gridSize}</Text>
        <Button
          title="+"
          onPress={() => changeGrid(true)}
          disabled={gridSize === 5}
        />
      </View>
      <Button title="Reset" onPress={shufflePics} />
    </View>
  );
};
