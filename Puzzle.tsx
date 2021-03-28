import React, { useState } from "react";
import {
  Text,
  View,
  Button,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import { Asset } from "expo-asset";
import PuzzlePiece from "./PuzzlePiece";
import { shuffle, generateJigsawPiecePaths } from "./util";
import { testingMode } from "./constants";

//disable shuffling for testing
const disableShuffle = testingMode;

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
  } else image = Asset.fromModule(require("./assets/earth.jpg"));

  const [piecePaths, setPiecePaths] = useState(
    generateJigsawPiecePaths(gridSize, squareSize)
  );

  const shufflePics = (ev?: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (ev) ev.preventDefault();
    const _rand = [...rand];
    shuffle(_rand, disableShuffle);
    setRand(_rand);
  };
//TO DO gridsections TS and interface. need to add case for jigsaw
  const getGridSections = () => {
    let gridSections = {rowDividers: [], colDividers: []} // separated row and col in case needed for future flexibility
    for(let i = 0; i <= gridSize; i++) {
        let x: number;
        let y: number;
        if(puzzleType === 'squares') {
            if(i === gridSize) {
                x = gridSize * squareSize
                y = gridSize * squareSize
            }
            else {
                x = i % gridSize * squareSize;
                y = i % gridSize * squareSize;    
            }
        }
        else {
            // insert jigsaw logic
        }
        gridSections.rowDividers.push(x)
        gridSections.colDividers.push(y)
    }
    console.log(gridSections)
    return gridSections
}

const [gridSections, setGridSections] = useState(getGridSections());

// TO DO need to include grid sections in this function
  const changeGrid = (up: boolean): void => {
    if (up && gridSize < 5) {
      setGridSize(gridSize + 1);
      setPiecePaths(
        generateJigsawPiecePaths(gridSize + 1, boardSize / (gridSize + 1))
      );
      setRand(shuffle(fillArray(gridSize + 1), disableShuffle));
    }
    if (!up && gridSize > 2) {
      setGridSize(gridSize - 1);
      setPiecePaths(
        generateJigsawPiecePaths(gridSize - 1, boardSize / (gridSize - 1))
      );
      setRand(shuffle(fillArray(gridSize - 1), disableShuffle));
    }
  };

  const fillArray = (gridSize: number): number[] => {
    const numberArray = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      numberArray.push(i);
    }
    return numberArray;
  };

  const [rand, setRand] = useState(
    shuffle(fillArray(gridSize), disableShuffle)
  );
// rand needs to match up with ix?
// after generating rand, calculate answer set
// answer set initialized as [false, false,...] taking into account pieces that coincidentally start at correct place
// pass down to PuzzlePiece as a prop a function that will update tihs answer array 
// i.e. whether each puzzle piece matches up to where on the grid it should be
// if all are true then it's a win

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
          gridSections={gridSections}
          rand={rand}
          setRand={setRand}
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

// is there a way we know when user has released a piece
// figure out where to get locations of dragged pieces