import React, { useState, useEffect } from "react";
import Draggable from "react-native-draggable";
import { Svg, Image, Defs, ClipPath, Path, Rect } from "react-native-svg";
import * as ImageManipulator from "expo-image-manipulator";
import { TextComponent } from "react-native";
// to do
// redo convertix rules of touch from just larger or smaller than grid divider
  // TO DO update type for gridsections, rand, setRand

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
  rand,
  setRand
}: {
  num: number;
  ix: number;
  gridSize: number;
  squareSize: number;
  puzzleType: string;
  boardSize: number;
  piecePath: string;
  image: { uri: string };
  gridSections: any;
  rand: any;
  setRand: any;
}) => {
  //squareX and squareY represent the row and col of the square in the solved puzzle
  const squareX = num % gridSize;
  const squareY = Math.floor(num / gridSize);

  //widthX and widthY are the size of the pieces (larger for jigsaw);
  //initX and initY are starting position for pieces (not aligned w grid for jigsaw)
  //viewBoxX and viewBoxY are 'panned' for selecting correct portion of image for piece

  let widthY: number,
    widthX: number,
    initX,
    initY,
    viewBoxX: number,
    viewBoxY: number;

  if (puzzleType === "squares") {
    //for square puzzles, everything is aligned to grid
    widthY = widthX = squareSize;
    initX = (ix % gridSize) * squareSize;
    initY = Math.floor(ix / gridSize) * squareSize;
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
    viewBoxX = Math.max(0, squareX * squareSize - squareSize * 0.25);
    viewBoxY = Math.max(0, squareY * squareSize - squareSize * 0.25);
  }

  const [ready, setReady] = useState(false);
  const [croppedImage, setCroppedImage] = useState(image);
  const [currentX, setCurrentX] = useState(initX)
  const [currentY, setCurrentY] = useState(initY)
  const [touchX, setTouchX] = useState(initX)
  const [touchY, setTouchY] = useState(initY)

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

  const convertNewPosToIx = (ev) => {
    ev.preventDefault();
    const touchCol = ev.nativeEvent.pageX;
    const touchRow = ev.nativeEvent.pageY;
    let snappedRow;
    let snappedCol;
    const rowDividers = gridSections.rowDividers
    // start here - need to make sure rows / cols dont go beyond 2
    for(let i = 0; i <= rowDividers.length - 2; i++) {
        const rowDivider = rowDividers[i]
        const nextRowDivider = i < rowDividers.length-2 ? rowDividers[i+1] : rowDivider + squareSize
        if(touchRow > rowDivider && touchRow <= nextRowDivider) {
            snappedRow = i;
            break;
        }
    }
    const colDividers = gridSections.colDividers
    for(let i = 0; i <= colDividers.length - 2; i++) {
        const colDivider = colDividers[i]
        const nextColDivider = i < colDividers.length-2 ? colDividers[i+1] : colDivider + squareSize
        if(touchCol > colDivider && touchCol <= nextColDivider) {
            snappedCol = i;
            break;
        }
    }
    if(snappedRow === undefined || snappedCol === undefined) {
        console.log('undefined', 'touchCol', touchCol, 'touchRow', touchRow, 'row', snappedRow, 'col', snappedCol)
        return;
    }
    let newIx = snappedRow * gridSize + snappedCol
    console.log('touchCol', touchCol, 'touchRow', touchRow, 'row', snappedRow, 'col', snappedCol, 'newix', newIx)
    sendUpdatedOrderToPuzzle(newIx)

  }
  
  const sendUpdatedOrderToPuzzle = (newIx) => {
    // swap
    let newRand = [...rand]
    const temp = newRand[newIx]
    newRand[newIx] = num
    newRand[ix] = temp
    console.log('newIx', newIx, 'oldrand', rand, 'newrand', newRand)
    setRand(newRand)
  }

//   console.log(
//       'num',num,
//       'ix',ix,
//       'squareX',squareX,
//       'squareY',squareY,
//     'initx',initX,
//     'inity',initY,
//     'viewboxX',viewBoxX,
//     'viewboxY',viewBoxY,
//   )
  if (!ready) return null;

  return (
    <Draggable
      //draggable SVG needs to be placed where cropped image starts. jigsaw shape extends beyond square
      x={initX}
      y={initY}
      onRelease={convertNewPosToIx}
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
//square X and Y, viewboxX/Y
// what needs to align on this piece so that we know its in teh correct spot? 
// how do we get the position of where this has been dragged?