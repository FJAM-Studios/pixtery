import React, { useState } from "react";
import {
  View,
  Button,
  Text,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import DragImage from "./DragImage";
import { shuffle } from "./util";

export interface SquareProps {
  squareSize: number;
  initX: number;
  initY: number;
  squareX: number;
  squareY: number;
  gridSize: number;
}

export default ({ boardSize }: { boardSize: number }) => {
  const [gridSize, setGridSize] = useState(3);
  const squareSize = boardSize / gridSize;

  const shufflePics = (ev?: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (ev) ev.preventDefault();
    const _rand = [...rand];
    shuffle(_rand);
    setRand(_rand);
  };

  const changeGrid = (up: boolean): void => {
    if (up && gridSize < 5) {
      setGridSize(gridSize + 1);
      setRand(shuffle(fillArray(gridSize + 1)));
    }
    if (!up && gridSize > 2) {
      setGridSize(gridSize - 1);
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
      {rand.map((num: number, ix: number) => {
        return (
          <DragImage
            key={ix}
            initX={ix % gridSize}
            initY={Math.floor(ix / gridSize)}
            squareSize={squareSize}
            squareX={num % gridSize}
            squareY={Math.floor(num / gridSize)}
            gridSize={gridSize}
          />
        );
      })}
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
