import React, { useState } from "react";
import {
  Text,
  View,
  Button,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import Draggable from "react-native-draggable";
import * as _Svg from "react-native-svg";
const { Svg, Image, Defs, ClipPath, Path } = _Svg;
// import { shuffle } from "./util";
const shuffle = (arr: any) => arr;
const image = require("./assets/earth.jpg");

class Piece {
  top: Point[] = [];
  bottom: Point[] = [];
  left: Point[] = [];
  right: Point[] = [];
}

interface Point {
  x: number;
  y: number;
}

export default ({ boardSize }: { boardSize: number }) => {
  const [gridSize, setGridSize] = useState(3);
  const squareSize = boardSize / gridSize;

  const generatePiecePaths = (gridSize: number, squareSize: number) => {
    //create empty array for storing Pieces in order
    const pieces: Piece[] = new Array(gridSize * gridSize);
    //fill array with empty pieces
    for (let z = 0; z < pieces.length; z++) pieces[z] = new Piece();
    //loop through the pieces
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const ix = x + y * gridSize;
        const thisPiece = pieces[ix];
        //set flat top
        if (y === 0) {
          thisPiece.top = [
            //goes from left to right
            { x: x * squareSize, y: 0 },
            { x: (x + 1) * squareSize, y: 0 },
          ];
        }
        //and bottom
        if (y === gridSize - 1) {
          thisPiece.bottom = [
            //goes from right to left
            { x: (x + 1) * squareSize, y: gridSize * squareSize },
            { x: x * squareSize, y: gridSize * squareSize },
          ];
        }
        //and left
        if (x === 0) {
          thisPiece.left = [
            //goes from bottom to top
            { x: 0, y: (y + 1) * squareSize },
            { x: 0, y: y * squareSize },
          ];
        }
        //and right
        if (x === gridSize - 1) {
          thisPiece.right = [
            //goes from top to bottom
            { x: gridSize * squareSize, y: y * squareSize },
            { x: gridSize * squareSize, y: (y + 1) * squareSize },
          ];
        }
        //if right side has no points, build curve
        if (thisPiece.right.length === 0) {
          // record curves instead of line ///////////
          // randomly decide if tab points in or out
          const dir = 2 * Math.round(Math.random()) - 1;

          thisPiece.right = [
            //goes from top to bottom
            {
              x: (x + 1) * squareSize + dir * (0 * squareSize),
              y: y * squareSize + 0.2 * squareSize,
            },
            {
              x: (x + 1) * squareSize + dir * (-0.1 * squareSize),
              y: y * squareSize + 0.5 * squareSize,
            },
            {
              x: (x + 1) * squareSize + dir * (0.1 * squareSize),
              y: y * squareSize + 0.4 * squareSize,
            },
            {
              x: (x + 1) * squareSize + dir * (0.3 * squareSize),
              y: y * squareSize + 0.3 * squareSize,
            },
            {
              x: (x + 1) * squareSize + dir * (0.3 * squareSize),
              y: y * squareSize + 0.7 * squareSize,
            },
            {
              x: (x + 1) * squareSize + dir * (0.1 * squareSize),
              y: y * squareSize + 0.6 * squareSize,
            },
            {
              x: (x + 1) * squareSize + dir * (-0.1 * squareSize),
              y: y * squareSize + 0.5 * squareSize,
            },
            {
              x: (x + 1) * squareSize + dir * (0 * squareSize),
              y: y * squareSize + 0.8 * squareSize,
            },
            {
              x: (x + 1) * squareSize + dir * (0 * squareSize),
              y: y * squareSize + squareSize,
            },
          ];
        }
        //if bottom side has no points, build curve
        if (thisPiece.bottom.length === 0) {
          // record curves instead of line ///////////
          const dir = 2 * Math.round(Math.random()) - 1;
          thisPiece.bottom = [
            //goes from right to left
            {
              x: x * squareSize + 0.8 * squareSize,
              y: (y + 1) * squareSize + dir * (0 * squareSize),
            },
            {
              x: x * squareSize + 0.5 * squareSize,
              y: (y + 1) * squareSize + dir * (-0.1 * squareSize),
            },
            {
              x: x * squareSize + 0.6 * squareSize,
              y: (y + 1) * squareSize + dir * (0.1 * squareSize),
            },
            {
              x: x * squareSize + 0.7 * squareSize,
              y: (y + 1) * squareSize + dir * (0.3 * squareSize),
            },
            {
              x: x * squareSize + 0.3 * squareSize,
              y: (y + 1) * squareSize + dir * (0.3 * squareSize),
            },
            {
              x: x * squareSize + 0.4 * squareSize,
              y: (y + 1) * squareSize + dir * (0.1 * squareSize),
            },
            {
              x: x * squareSize + 0.5 * squareSize,
              y: (y + 1) * squareSize + dir * (-0.1 * squareSize),
            },
            {
              x: x * squareSize + 0.2 * squareSize,
              y: (y + 1) * squareSize + dir * (0 * squareSize),
            },
            {
              x: x * squareSize,
              y: (y + 1) * squareSize + dir * (0 * squareSize),
            },
          ];
        }
        //duplicate curve to next or below piece
        if (pieces[ix + 1] && x !== gridSize - 1) {
          //reverse order of points
          pieces[ix + 1].left = [...thisPiece.right].reverse();
          //remove first point
          pieces[ix + 1].left.shift();
          //and add in ending point
          pieces[ix + 1].left.push({
            x: (x + 1) * squareSize,
            y: y * squareSize,
          });
        }
        if (pieces[ix + gridSize] && y !== gridSize - 1) {
          pieces[ix + gridSize].top = [...thisPiece.bottom].reverse();
          pieces[ix + gridSize].top.shift();
          pieces[ix + gridSize].top.push({
            x: (x + 1) * squareSize,
            y: (y + 1) * squareSize,
          });
        }
      }
    }

    //construct SVG path data
    const piecePaths: string[] = [];
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      //move to top right point
      let str = `M ${(i % gridSize) * squareSize} ${
        Math.floor(i / gridSize) * squareSize
      } `;

      const sides = ["top", "right", "bottom", "left"] as const;
      for (let side of sides) {
        //if only two points, denote line
        str += piece[side].length === 2 ? "L " : "";
        str += piece[side]
          .map(
            (coord, ix) =>
              //3 points denotes curve
              `${ix % 3 === 0 && piece[side].length > 2 ? "C " : ""}${
                Math.round(coord.x * 100) / 100
              } ${Math.round(coord.y * 100) / 100} `
          )
          .join("");
      }
      piecePaths[i] = str;
    }
    return piecePaths;
  };

  const [piecePaths, setPiecePaths] = useState(
    generatePiecePaths(gridSize, squareSize)
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
        generatePiecePaths(gridSize + 1, boardSize / (gridSize + 1))
      );
      setRand(shuffle(fillArray(gridSize + 1)));
    }
    if (!up && gridSize > 2) {
      setGridSize(gridSize - 1);
      setPiecePaths(
        generatePiecePaths(gridSize - 1, boardSize / (gridSize - 1))
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
      {/* generate jigsaws*/}
      {rand.map((num: number, ix: number) => {
        const initX = ix % gridSize;
        const initY = Math.floor(ix / gridSize);
        const squareX = num % gridSize;
        const squareY = Math.floor(num / gridSize);
        const startX =
          squareX === 0
            ? squareX * squareSize
            : squareX * squareSize - squareSize * 0.2;
        const startY =
          squareY === 0
            ? squareY * squareSize
            : squareX * squareSize - squareSize * 0.2;
        const widthX =
          squareY === 0 || squareY === gridSize - 1
            ? squareSize * 1.2
            : squareSize * 1.4;
        const widthY =
          squareX === 0 || squareX === gridSize - 1
            ? squareSize * 1.2
            : squareSize * 1.4;
        console.log(startX, startY, widthX, widthY);
        return (
          <Draggable
            // this is cheating to force these to rerender and should be figured out properly later
            key={Math.random() * (1 + ix)}
            x={initX * squareSize}
            y={initY * squareSize}
          >
            <Svg
              height={widthY}
              width={widthX}
              //viewBox = startX startY widthX widthY
              viewBox={`
              ${squareX * squareSize}
              ${squareY * squareSize}
              ${widthX}
              ${widthY}
            `}
              // ${Math.max(0, squareX * squareSize - squareSize * 0)}
              // ${Math.max(0, squareY * squareSize - squareSize * 0)}
              // ${squareSize * 1}
              // ${squareSize * 1}
            >
              <Defs>
                <ClipPath id="clip">
                  <Path d={piecePaths[num]} fill="white" stroke="white" />
                </ClipPath>
              </Defs>
              <Image
                href={image}
                width={boardSize}
                height={boardSize}
                clipPath="url(#clip)"
              />
            </Svg>
          </Draggable>
        );
      })}
      {/* generate jigsaws*/}
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
