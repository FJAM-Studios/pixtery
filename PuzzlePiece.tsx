import React, { useState, useEffect } from "react";
import Draggable from "react-native-draggable";
import { Svg, Image, Defs, ClipPath, Path, Rect } from "react-native-svg";
import * as ImageManipulator from "expo-image-manipulator";

export default ({
  num,
  ix,
  gridSize,
  squareSize,
  puzzleType,
  boardSize,
  piecePath,
  image,
}: {
  num: number;
  ix: number;
  gridSize: number;
  squareSize: number;
  puzzleType: string;
  boardSize: number;
  piecePath: string;
  image: { uri: string };
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

  const [ready, setReady] = useState(false);
  const [croppedImage, setCroppedImage] = useState(image);

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

  const changePosition = (gestureState: { dx: number; dy: number }) => {
    //update the relative _x and _y but leave x and y the same unless snapping
    const newXY = {
      x: currentXY.x,
      y: currentXY.y,
      _x: currentXY._x + gestureState.dx,
      _y: currentXY._y + gestureState.dy,
    };
    //if _x and _y are within some number of the solutionX and Y, then snap!
    //this only snaps to the 'solved' positions, but could do the same for all positions
    if (
      Math.abs(solutionX - newXY._x) < squareSize / 4 &&
      Math.abs(solutionY - newXY._y) < squareSize / 4
    ) {
      //new x and new y (not underscode) are moved to the solutionX and Y,
      //factoring in initial position and _x/_y offset
      newXY.x = initX - newXY._x + solutionX;
      newXY.y = initY - newXY._y + solutionY;
      //here is where you could update the puzzle state to say what has been solved
    }
    setXY(newXY);
  };

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
