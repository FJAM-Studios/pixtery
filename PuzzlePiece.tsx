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
  gridSections
}: {
  num: number;
  ix: number;
  gridSize: number;
  squareSize: number;
  puzzleType: string;
  boardSize: number;
  piecePath: string;
  image: { uri: string };
  // TO DO include type for gridsections
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


  const getTouchXY = (ev) => {
    // ev.preventDefault();
    const x = ev.nativeEvent.pageX;
    const y = ev.nativeEvent.pageY;
    console.log('touch', x, y)
    setTouchX(x)
    setTouchY(y)
  }

  useEffect(() => {
    const snap = () => {
        const x = touchX;
        const y = touchY;
        // console.log(x, y)
        let snappedX;
        let snappedY;
        const rowDividers = gridSections.rowDividers
        for(let i = 0; i <= rowDividers.length - 1; i++) {
            const rowDivider = rowDividers[i]
            const nextRowDivider = (rowDividers[i+1] || rowDivider + squareSize)
            if(x > rowDivider && x <= nextRowDivider) {
                snappedX = rowDivider;
                break;
            }
        }
        const colDividers = gridSections.colDividers
        for(let i = 0; i <= colDividers.length - 1; i++) {
            const colDivider = colDividers[i]
            const nextColDivider = (colDividers[i+1] || colDivider + squareSize)
            if(y > colDivider && y <= nextColDivider) {
                snappedY = colDivider;
                break;
            }
        }
        // console.log('x', x, 'y', y,'snapx', snappedX, 'snapy', snappedY)
    
        // if either of them are undefined, it means piece was moved to outside the grid, so use the raw location that piece was dragged to
        if(!snappedX || !snappedY) {
            snappedX = 0
            snappedY = 0
        }
        console.log('after','x', x, 'y', y,'snapx', snappedX, 'snapy', snappedY)
    
        // start here - it is not snappeing to where it needs to. i think it is because i need to return a new draggable - the xy coordinate updates are not working
        // might be an xy update on svg?
        // try updating state for pageX pageY values, and then running onEffect
        setCurrentX(snappedX)
        setCurrentY(snappedY)
        // console.log('pagex',pageX, 'pagey',pageY)
        // console.log('then gridsections', gridSections)
      };
      snap()
  }, [touchX])

  
  console.log(
      'num',num,
      'ix',ix,
      'squareX',squareX,
      'squareY',squareY,
    'initx',initX,
    'inity',initY,
    'viewboxX',viewBoxX,
    'viewboxY',viewBoxY,
    'squaresize', squareSize
  )
// console.log('idx', ix, 'initx', initX, 'inity', initY)
  if (!ready) return null;

  return (
    <Draggable
      //draggable SVG needs to be placed where cropped image starts. jigsaw shape extends beyond square
      x={currentX}
      y={currentY}
      onDragRelease={(ev) => getTouchXY(ev)}
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