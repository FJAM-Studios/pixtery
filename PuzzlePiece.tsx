import React, { useState, useEffect } from "react";
import Draggable from "react-native-draggable";
import { Svg, Image, Defs, ClipPath, Path, Rect, NumberProp } from "react-native-svg";
import * as ImageManipulator from "expo-image-manipulator";
import { TextComponent } from "react-native";
import { SNAP_MARGIN, TESTING_MODE } from './constants';
import { GridSections } from './types';
  // to do set error emssage when piece cant move
  // figure out if i need to retype props if type is aleady set on parent

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
  currentBoard: (number | null) [];
  setCurrentBoard: Function;
  setErrorMessage: Function;
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
    solutionY: number;

  if (puzzleType === "squares") {
    //for square puzzles, everything is aligned to grid
    widthY = widthX = squareSize;
    initX = (ix % gridSize) * squareSize;
    initY = Math.floor(ix / gridSize) * squareSize;
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
  const [newSnappedIx, setNewSnappedIx] = useState<number | undefined | null>(-1)
  const [prevIx, setPrevIx] = useState<number | undefined | null>(ix)

  //_x and _y are used to keep track of where image is relative to its start positon
  const [currentXY, setXY] = useState({
    x: initX,
    y: initY,
    _x: initX,
    _y: initY,
  });

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
    setErrorMessage('');
    //update the relative _x and _y but leave x and y the same unless snapping
    const newXY = {
      x: currentXY.x,
      y: currentXY.y,
      _x: currentXY._x + gestureState.dx,
      _y: currentXY._y + gestureState.dy,
    };
    // start here, the snappedY is coming up as undefined when it should notbe
    //if _x and _y are within a margin of a point on the grid, then snap!
    let snappedX: number | undefined;
    let snappedY: number | undefined;
    let snappedRow: number | undefined;
    let snappedCol: number | undefined;
    const rowDividers: number[] = gridSections.rowDividers
    for(let i = 0; i < rowDividers.length; i++) {
        const rowDivider = rowDividers[i]
        if(Math.abs(newXY._y - rowDivider) < squareSize * SNAP_MARGIN) {
            snappedY = initY - newXY._y + rowDivider;
            // snappedY = newXY.y - newXY._y + rowDivider;
            snappedRow = i;
            break;
        }
    }
    const colDividers: number[] = gridSections.colDividers
    for(let i = 0; i < colDividers.length; i++) {
        const colDivider = colDividers[i]
        if(Math.abs(newXY._x - colDivider) < squareSize * SNAP_MARGIN) {
            snappedX = initX - newXY._x + colDivider;
            // snappedX = newXY.x - newXY._x + colDivider;
            snappedCol = i;
            break;
        }
    }
    let newIx: number | undefined;
    // if there was a snap i.e. the piece came within the grid snap margin
    console.log('snapx',snappedX, 'snapy', snappedY)
    if(snappedX !== undefined && snappedY !== undefined) {
        // putting ! after a variable is to tell TS that in this case, the variable will not be null or undefined
        newIx = snappedRow! * gridSize + snappedCol!
        console.log('board',currentBoard, newIx)
        if(currentBoard[newIx] === null) {
            console.log('snapping to', newIx)
            newXY.x = snappedX;
            newXY.y = snappedY;
        }
        // if the current board already has another piece in the new index...
        else {
            console.log('cannot move to ', newIx)
            setErrorMessage('There is a piece already in that spot. Please move that piece first!')
            newIx = undefined
            // need to check this - ideally would want to send piece back to original location
            // newXY.x = currentXY.x + currentXY._x - gestureState.dx;
            // newXY.y = currentXY.y + currentXY._y - gestureState.dy;
        }
    }
    updateIx(newIx)
    setXY(newXY)
  };

  // preserve previous Ix, and set the new Ix that it will snap to
  const updateIx = (newIx: number | undefined): void => {
      if (newSnappedIx !== -1) setPrevIx(newSnappedIx)
      setNewSnappedIx(newIx)
  }

  const updateCurrentBoard = (): void => {
    console.log('newsnappedix when board update:', newSnappedIx, 'prevIx', prevIx, 'num', num, 'ix', ix)
    let newBoard = [...currentBoard]
    // putting ! after a variable is to tell TS that in this case, the variable will not be null or undefined
    if (newSnappedIx! >= 0) newBoard[newSnappedIx!] = num
    if(prevIx! >= 0) newBoard[prevIx!] = null
    setCurrentBoard(newBoard)
    }

  useEffect(() => {
    // if the piece has been mounted already (i.e. newSnappedIx is not -1), update board after currentXY changes
    if(newSnappedIx !== -1) {
        console.log('new snapped ix', newSnappedIx)
        updateCurrentBoard()    
    }
  }, [currentXY])


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
