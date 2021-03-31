import React, { useEffect, useState } from "react";
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
import { TESTING_MODE } from "./constants";
import { GridSections } from './types';

//disable shuffling for testing
const disableShuffle = TESTING_MODE;

export default ({
  boardSize,
  imageURI,
  puzzleType,
}: {
  boardSize: number;
  imageURI: string;
  puzzleType: string;
}) => {
  const [gridSize, setGridSize] = useState<number>(3);
  const squareSize: number = boardSize / gridSize;
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

// populates X Y coordinates for upper left corner of each grid section
  const getGridSections = (): GridSections => {
    // separated row and col in case needed for future flexibility
    let gridSections: GridSections = {
        rowDividers: [0],
        colDividers: [0]
    };
    for(let i = 1; i < gridSize; i++) {
        let x: number;
        let y: number;
        if(puzzleType === 'squares') {
            x = i * squareSize;
            y = i * squareSize;
        }
        //if jigsaw
        else {
            x = squareSize * 0.75 + (i-1) * squareSize;
            y = squareSize * 0.75 + (i-1) * squareSize;
        }
        gridSections.rowDividers.push(x)
        gridSections.colDividers.push(y)
    }
    console.log(gridSections, squareSize)
    return gridSections
}

const [gridSections, setGridSections] = useState<GridSections>(getGridSections());

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
    setGridSections(getGridSections())
  };

  const fillArray = (gridSize: number): number[] => {
    const numberArray = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      numberArray.push(i);
    }
    return numberArray;
  };
// start here, array generics
  const [rand, setRand] = useState<number[]>(
    shuffle(fillArray(gridSize), disableShuffle)
  );
// start here - need to type for number and null
  const [currentBoard, setCurrentBoard] = useState<(number | null) []>(
      [...rand]
  )

  const [winMessage, setWinMessage] = useState<string>('')

  const checkWin = (): void => {
      if(currentBoard[0] !== 0) return;
      for(let i = 0; i < currentBoard.length; i++){
          if(currentBoard[i] !== i) return;
      }
      setWinMessage('Congrats! You solved the puzzle!')
  }

  useEffect(() => {
      checkWin()
  }, [currentBoard])
  console.log('currentboard', currentBoard)

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
        />
      ))}
      <Text style={{ 
          fontSize: 20,
          justifyContent: "space-around",
          marginBottom: 10,
          width: "100%"
          }}>{winMessage}</Text>
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
