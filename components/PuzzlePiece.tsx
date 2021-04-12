import React, { useState, useEffect } from "react";
import Draggable from "react-native-draggable";
import { Svg, Image, Defs, ClipPath, Path, Rect } from "react-native-svg";
import * as ImageManipulator from "expo-image-manipulator";
import { SNAP_MARGIN } from "../constants";
import { GridSections } from "../types";
import { getInitialDimensions } from "../util";

// to do -
// z index of piece moving
// add snap sound
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
  puzzleAreaDimensions: { puzzleAreaWidth: number, puzzleAreaHeight: number }
}) => {  
  const { puzzleAreaWidth, puzzleAreaHeight } = puzzleAreaDimensions;
  const minSandboxY = boardSize * 1.05;
  const maxSandboxY = puzzleAreaHeight - squareSize;
  
  //squareX and squareY represent the row and col of the square in the solved puzzle
  //widthX and widthY are the size of the pieces (larger for jigsaw);
  //initX and initY are starting position for pieces (not aligned w grid for jigsaw)
  //viewBoxX and viewBoxY are 'panned' for selecting correct portion of image for piece
  //solutionX and solutionY are the top left coords for where the piece belongs in solution
  const [
    squareX,
    squareY,
    widthY,
    widthX,
    initX,
    initY,
    viewBoxX,
    viewBoxY,
    solutionX,
    solutionY
  ] = getInitialDimensions(puzzleType, minSandboxY, maxSandboxY, num, ix, gridSize, squareSize)

  const [ready, setReady] = useState<boolean>(false);
  const [croppedImage, setCroppedImage] = useState(image);
  const [currentSnappedIx, setCurrentSnappedIx] = useState<number | undefined | null>(-1);
  // previous index is needed to know where the piece moved from, to update to null on current board
  const [prevIx, setPrevIx] = useState<number | undefined | null>(null);

  //_x and _y are used to keep track of where image is relative to its start positon
  const [currentXY, setXY] = useState({
    x: initX,
    y: initY,
    _x: initX, // to track cumulative X distance traveled from original position
    _y: initY,  // to track cumulative Y distance traveled from original position
    // snapAdjusted_x: initX,
    // snapAdjusted_y: initY,
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
    setErrorMessage("");
    //update the relative _x and _y but leave x and y the same unless snapping
    const newXY = {
      x: currentXY.x,
      y: currentXY.y,
      _x: currentXY._x + gestureState.dx,
      _y: currentXY._y + gestureState.dy,
      // snapAdjusted_x: currentXY.snapAdjusted_x + gestureState.dx,
      // snapAdjusted_y: currentXY.snapAdjusted_y + gestureState.dy
    };

    // snappedX: top left X position of snap grid
    // snappedY: top left Y position of snap grid
    // snappedRow: row index where it snaps
    // snappedCol: col index where it snaps
    const [snappedX, snappedY, snappedRow, snappedCol] = determineSnap(newXY)

    let newIx: number | undefined;
    // if both snappedX and snapped Y are defined, there was a snap i.e. the piece came within the grid snap margin
    if (snappedX !== undefined && snappedY !== undefined) {
      // putting ! after a variable is to tell TS that in this case, the variable will not be null or undefined
      newIx = snappedRow! * gridSize + snappedCol!;
      if (currentBoard[newIx] === null || newIx === currentSnappedIx) {
        newXY.x = snappedX;
        newXY.y = snappedY;
        // need to adjust accumulated distance if theres a snap - leave for later
        // newXY.snapAdjusted_y += newXY._y - colDividers[snappedCol!] - (squareSize * SNAP_MARGIN - gestureState.dy)
        // newXY.snapAdjusted_x += newXY._x - rowDividers[snappedRow!] - (squareSize * SNAP_MARGIN - gestureState.dx)
      }
      // but if the current board already has another piece in the new index, do not let user move piece there
      else {
        setErrorMessage(
          "There is a piece already in that spot. Please move that piece first!"
        );
        newIx = undefined;
        // this is where overlap result would be defined. maybe send piece back to original location, or push other piece out
        // newXY.x = currentXY.x + currentXY._x - gestureState.dx;
        // newXY.y = currentXY.y + currentXY._y - gestureState.dy;
      }
    }
    if(newIx !== currentSnappedIx) updateIx(newIx);
    setXY(newXY);
  };

  const determineSnap = (newXY: {x: number, y: number, _x: number, _y: number}) => {
    let snappedX: number | undefined; // top left X position of snap grid
    let snappedY: number | undefined; // top left Y position of snap grid
    let snappedRow: number | undefined; // row index where it snaps
    let snappedCol: number | undefined; // col index where it snaps
    const rowDividers: number[] = gridSections.rowDividers;
    const colDividers: number[] = gridSections.colDividers;

    //if _x and _y are within a margin of a point on the grid, then snap!
    for (let i = 0; i < rowDividers.length; i++) {
      const rowDivider = rowDividers[i];
      if (Math.abs(newXY._y - rowDivider) < squareSize * SNAP_MARGIN) {
        snappedY = initY - newXY._y + rowDivider;
        snappedRow = i;
        break;
      }
    }
    for (let i = 0; i < colDividers.length; i++) {
      const colDivider = colDividers[i];
      if (Math.abs(newXY._x - colDivider) < squareSize * SNAP_MARGIN) {
        snappedX = initX - newXY._x + colDivider;
        snappedCol = i;
        break;
      }
    }
    return [snappedX, snappedY, snappedRow, snappedCol]
  }

  // preserve previous Ix, and set the new Ix that it will snap to
  const updateIx = (newIx: number | undefined): void => {
    // if currentSnappedIx has been already set once before, save that index as the previous index
    if (currentSnappedIx !== -1) setPrevIx(currentSnappedIx);
    setCurrentSnappedIx(newIx);
  };

  const updateCurrentBoard = (): void => {
    let newBoard = [...currentBoard];
    // putting ! after a variable is to tell TS that in this case, the variable will not be null or undefined
    if (currentSnappedIx! >= 0) newBoard[currentSnappedIx!] = num;
    if (prevIx! >= 0 && prevIx !== currentSnappedIx) newBoard[prevIx!] = null;
    console.log('board after', newBoard)
    setCurrentBoard(newBoard);
  };

  useEffect(() => {
    // if the piece has been mounted already (i.e. currentSnappedIx is not -1), update current board after currentXY changes
    if (currentSnappedIx !== -1) updateCurrentBoard();
  }, [currentSnappedIx]);

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
