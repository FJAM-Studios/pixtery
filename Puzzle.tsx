import React, { useState } from "react";
import {
  View,
  Button,
  Text,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import DragImage from "./DragImage";

export interface SquareProps {
  squareSize: number;
  initX: number;
  initY: number;
  squareX: number;
  squareY: number;
}

export default ({ squareSize }: { squareSize: number }) => {
  const [rand, setRand] = useState(shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]));

  const shufflePics = (ev: NativeSyntheticEvent<NativeTouchEvent>) => {
    ev.preventDefault();
    const _rand = [...rand];
    shuffle(_rand);
    setRand(_rand);
  };

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
            initX={ix % 3}
            initY={Math.floor(ix / 3)}
            squareSize={squareSize}
            squareX={num % 3}
            squareY={Math.floor(num / 3)}
          />
        );
      })}
      {/* <Text
        style={{
          alignSelf: "center",
          color: "white",
          fontSize: 10,
          paddingBottom: 2,
        }}
      >
        Drag the pictures!
      </Text> */}
      <Button title="Reset" onPress={shufflePics} />
    </View>
  );
};

function shuffle(array: number[]) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
