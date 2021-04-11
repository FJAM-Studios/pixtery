import React, { useState, useEffect } from "react";
import Draggable from "react-native-draggable";
import { Svg, Image, Defs, ClipPath, Path, Rect } from "react-native-svg";
import * as ImageManipulator from "expo-image-manipulator";
import { SNAP_MARGIN } from "../constants";
import { GridSections } from "../types";
import { getRandomInRange } from '../util'
import { View, useWindowDimensions } from "react-native";

// to do -
// outline of grid
// jigsaw
// randomizer with even / odd indices?
// z index of piece moving
// add snap sound
// change name of newsnappedix
// see if i acgtually need prev IX - maybe i can update the current board and set snappedIx in one go
// return full image when solved

export default ({
  num,
  ix,
  gridSize,
  squareSize,
  puzzleType,
  boardSize,
  piecePath,
  image,
  gridSections,
  currentBoard,
  setCurrentBoard,
  setErrorMessage,
  sandBoxHeight,
  sandBoxWidth,
  puzzleAreaDimensions
}: {
  num: number;
  ix: number;
  gridSize: number;
  squareSize: number;
  puzzleType: string;
  boardSize: number;
  piecePath: string;
  image: { uri: string };
  gridSections: GridSections;
  currentBoard: (number | null)[];
  setCurrentBoard: Function;
  setErrorMessage: Function;
  sandBoxHeight: number;
  sandBoxWidth: number;
  puzzleAreaDimensions: any // change later
}) => {
  //squareX and squareY represent the row and col of the square in the solved puzzle
  const squareX = num % gridSize;
  const squareY = Math.floor(num / gridSize);

  //widthX and widthY are the size of the pieces (larger for jigsaw);
  //initX and initY are starting position for pieces (not aligned w grid for jigsaw)
  //viewBoxX and viewBoxY are 'panned' for selecting correct portion of image for piece
  //solutionX and solutionY are the top left coords for where the piece belongs in solution

  let widthY: number,
    widthX: number,
    initX: number,
    initY: number,
    viewBoxX: number,
    viewBoxY: number,
    solutionX: number,
    solutionY: number
  
  const { puzzleAreaWidth, puzzleAreaHeight } = puzzleAreaDimensions;
  // console.log('puzzleAreaheight',puzzleAreaHeight)  
  const minSandboxY = boardSize * 1.1;
  const maxSandboxY = puzzleAreaHeight * 0.95 - squareSize;

  if (puzzleType === "squares") {
    //for square puzzles, everything is aligned to grid
    widthY = widthX = squareSize;
    // initX = getRandomInRange(0, sandBoxWidth) / gridSize * (ix % gridSize + 1);
    // initY = Math.floor(ix / gridSize) * squareSize;
    initX = Math.max((ix % gridSize) * squareSize - squareSize * 0.5, 0);
    // start here - need a way for Y to spread out inside sandbox
    // initY = Math.min(minSandboxY + getRandomInRange(0, sandBoxHeight) * (ix % gridSize), 600);
    initY = Math.min(minSandboxY + Math.floor(ix / gridSize) * squareSize * ((maxSandboxY - minSandboxY) / puzzleAreaHeight) - squareSize * 0.25, maxSandboxY);

    // console.log('sandboxheight', sandBoxHeight, 'sandboxwidth', sandBoxWidth, 'min', minSandboxY, 'max', maxSandboxY, 'inity', initY, 'initx', initX)
    solutionX = (num % gridSize) * squareSize;
    solutionY = Math.floor(num / gridSize) * squareSize;
    viewBoxX = squareX * squareSize;
    viewBoxY = squareY * squareSize;
  } else {
    //for jigsaw puzzles, some pieces must be offset or larger viewbox to account for jigsaw "tabs"
    widthY =
      squareY === 0 || squareY === gridSize - 1
        ? squareSize * 1.25
        : squareSize * 1.5;
    widthX =
      squareX === 0 || squareX === gridSize - 1
        ? squareSize * 1.25
        : squareSize * 1.5;
    initX = Math.max(0, (ix % gridSize) * squareSize - squareSize * 0.25);
    initY = Math.max(
      0,
      Math.floor(ix / gridSize) * squareSize - squareSize * 0.25
    );
    solutionX = Math.max(0, (num % gridSize) * squareSize - squareSize * 0.25);
    solutionY = Math.max(
      0,
      Math.floor(num / gridSize) * squareSize - squareSize * 0.25
    );
    viewBoxX = Math.max(0, squareX * squareSize - squareSize * 0.25);
    viewBoxY = Math.max(0, squareY * squareSize - squareSize * 0.25);
  }

  const [ready, setReady] = useState<boolean>(false);
  const [croppedImage, setCroppedImage] = useState(image);
  const [newSnappedIx, setNewSnappedIx] = useState<number | undefined | null>(-1);
  // previous index is needed to know where the piece moved from, to update to null on current board
  const [prevIx, setPrevIx] = useState<number | undefined | null>(null);

  //_x and _y are used to keep track of where image is relative to its start positon
  const [currentXY, setXY] = useState({
    x: initX,
    y: initY,
    _x: initX,
    _y: initY,
  });
  // console.log('before x', currentXY.x, 'y', currentXY.y)

  useEffect(() => {
    const manipulateImage = async () => {
      setReady(false);
      const croppedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [
          {
            resize: {
              width: boardSize,
              height: boardSize,
            },
          },
          {
            crop: {
              originX: viewBoxX,
              originY: viewBoxY,
              width: widthX,
              height: widthY,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCroppedImage(croppedImage);
      setReady(true);
    };

    manipulateImage();
  }, []);

  const changePosition = (gestureState: { dx: number; dy: number }): void => {
    // start here - does new snap ix reset?
    console.log('num',num, 'previx', prevIx, 'newsnapix', newSnappedIx, 'board before', currentBoard)
    setErrorMessage("");
    //update the relative _x and _y but leave x and y the same unless snapping
    const newXY = {
      x: currentXY.x,
      y: currentXY.y,
      _x: currentXY._x + gestureState.dx,
      _y: currentXY._y + gestureState.dy,
    };
    const originIx = newSnappedIx;
    //if _x and _y are within a margin of a point on the grid, then snap!
    let snappedX: number | undefined; // top left X position of snap grid
    let snappedY: number | undefined; // top left Y position of snap grid
    let snappedRow: number | undefined; // row index where it snaps
    let snappedCol: number | undefined; // col index where it snaps
    const rowDividers: number[] = gridSections.rowDividers;
    for (let i = 0; i < rowDividers.length; i++) {
      const rowDivider = rowDividers[i];
      if (Math.abs(newXY._y - rowDivider) < squareSize * SNAP_MARGIN) {
        snappedY = initY - newXY._y + rowDivider;
        snappedRow = i;
        break;
      }
    }
    const colDividers: number[] = gridSections.colDividers;
    for (let i = 0; i < colDividers.length; i++) {
      const colDivider = colDividers[i];
      if (Math.abs(newXY._x - colDivider) < squareSize * SNAP_MARGIN) {
        snappedX = initX - newXY._x + colDivider;
        snappedCol = i;
        break;
      }
    }
    let newIx: number | undefined;
    // if both snappedX and snapped Y are defined, there was a snap i.e. the piece came within the grid snap margin
    if (snappedX !== undefined && snappedY !== undefined) {
      // putting ! after a variable is to tell TS that in this case, the variable will not be null or undefined
      newIx = snappedRow! * gridSize + snappedCol!;
      if (currentBoard[newIx] === null || newIx === newSnappedIx) {
        // console.log('snappedx', snappedX, 'snapy', snappedY)
        newXY.x = snappedX;
        newXY.y = snappedY;
      }
      // but if the current board already has another piece in the new index, do not let user move piece there
      else {
        // console.log('newix', newIx, 'prevIx', prevIx)
        setErrorMessage(
          "There is a piece already in that spot. Please move that piece first!"
        );
        newIx = undefined;
        // need to check this - ideally would want to send piece back to original location
        // newXY.x = currentXY.x + currentXY._x - gestureState.dx;
        // newXY.y = currentXY.y + currentXY._y - gestureState.dy;
      }
    }
    if(newIx !== newSnappedIx) updateIx(newIx);
    setXY(newXY);
  };

  // preserve previous Ix, and set the new Ix that it will snap to
  const updateIx = (newIx: number | undefined): void => {
    // if newSpannedIx has been already set once before, save that index as the previous index
    if (newSnappedIx !== -1) setPrevIx(newSnappedIx);
    setNewSnappedIx(newIx);
  };

  const updateCurrentBoard = (): void => {
    let newBoard = [...currentBoard];
    // putting ! after a variable is to tell TS that in this case, the variable will not be null or undefined
    if (newSnappedIx! >= 0) newBoard[newSnappedIx!] = num;
    if (prevIx! >= 0 && prevIx !== newSnappedIx) newBoard[prevIx!] = null;
    console.log('board after', newBoard)
    setCurrentBoard(newBoard);
  };

  useEffect(() => {
    // if the piece has been mounted already (i.e. newSnappedIx is not -1), update current board after currentXY changes
    if (newSnappedIx !== -1) updateCurrentBoard();
  }, [newSnappedIx]);

  if (!ready) return null;

  return (
    <Draggable
      //draggable SVG needs to be placed where cropped image starts. jigsaw shape extends beyond square
      x={currentXY.x}
      y={currentXY.y}
      //on release of a piece, update the state and check for snapping
      onDragRelease={(ev, gestureState) => changePosition(gestureState)}
    >
      <Svg
        //height and width are size of jigsaw piece
        height={widthY}
        width={widthX}
      >
        <Defs>
          {/* for jigsaws, clip using piecePaths */}
          <ClipPath id="jigsaw">
            <Path d={piecePath} fill="white" stroke="white" />
          </ClipPath>
          {/* for squares, clipping is done by viewbox, rectangle = whole board */}
          <ClipPath id="squares">
            <Rect
              fill="white"
              stroke="white"
              x={0}
              y={0}
              width={widthX}
              height={widthY}
            />
          </ClipPath>
        </Defs>
        {/* <Path d={piecePath} stroke="white" /> */}

        <Image
          href={croppedImage}
          width={widthX}
          height={widthY}
          clipPath={`url(#${puzzleType})`}
        />
      </Svg>
    </Draggable>
  );
};
