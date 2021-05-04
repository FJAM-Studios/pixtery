import { Share } from "react-native";
import { DEGREE_CONVERSION } from "./constants";

import {
  SvgPiece,
  Puzzle,
  GridSections,
  Point,
  Dimension,
  Viewbox,
  PieceConfiguration,
  BoardSpace,
} from "./types";

export const shuffle = (array: number[], disabledShuffle = true): number[] => {
  if (disabledShuffle) return array;
  let currentIndex = array.length,
    temporaryValue: number,
    randomIndex: number;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  let reshuffle = true;
  for (let i = 0; i < array.length; i++) {
    if (array[i] !== i) {
      reshuffle = false;
      break;
    }
  }
  if (reshuffle) array = shuffle(array);
  return array;
};

export const generateJigsawPiecePaths = (
  gridSize: number,
  squareSize: number,
  disableOffset = false
): string[] => {
  //create empty array for storing Pieces in order
  const pieces: SvgPiece[] = new Array(gridSize * gridSize);
  //fill array with empty pieces
  for (let z = 0; z < pieces.length; z++) pieces[z] = new SvgPiece();
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
    //to deal with iphone SVG difference, these offsets change SVG path to be relative to the piece rather than the overall image
    const oX = disableOffset
      ? 0
      : Math.max(0, (i % gridSize) * squareSize - squareSize * 0.25);
    const oY = disableOffset
      ? 0
      : Math.max(0, Math.floor(i / gridSize) * squareSize - squareSize * 0.25);
    const piece = pieces[i];
    //move to top right point
    let str = `M ${(i % gridSize) * squareSize - oX} ${
      Math.floor(i / gridSize) * squareSize - oY
    } `;
    //idk if this is good typescript
    const sides = ["top", "right", "bottom", "left"] as const;
    for (const side of sides) {
      //if only two points, denote line
      str += piece[side].length === 2 ? "L " : "";
      str += piece[side]
        .map(
          (coord, ix) =>
            //3 points denotes curve
            `${ix % 3 === 0 && piece[side].length > 2 ? "C " : ""}${
              Math.round(coord.x * 100) / 100 - oX
            } ${Math.round(coord.y * 100) / 100 - oY} `
        )
        .join("");
    }
    piecePaths[i] = str;
  }
  return piecePaths;
};

export const generateSquarePiecePaths = (
  gridSize: number,
  squareSize: number
): string[] => {
  const pieces: SvgPiece[] = new Array(gridSize * gridSize);
  //fill array with empty pieces
  for (let z = 0; z < pieces.length; z++) pieces[z] = new SvgPiece();
  //loop through the pieces
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const ix = x + y * gridSize;
      const thisPiece = pieces[ix];
      //set flat top
      thisPiece.top = [
        //goes from left to right
        { x: x * squareSize, y: y * squareSize },
        { x: (x + 1) * squareSize, y: y * squareSize },
      ];
      thisPiece.bottom = [
        //goes from right to left
        { x: (x + 1) * squareSize, y: (y + 1) * squareSize },
        { x: x * squareSize, y: (y + 1) * squareSize },
      ];
      thisPiece.left = [
        //goes from bottom to top
        { x: x * squareSize, y: (y + 1) * squareSize },
        { x: x * squareSize, y: y * squareSize },
      ];
      thisPiece.right = [
        //goes from top to bottom
        { x: (x + 1) * squareSize, y: y * squareSize },
        { x: (x + 1) * squareSize, y: (y + 1) * squareSize },
      ];
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
    //idk if this is good typescript
    const sides = ["top", "right", "bottom", "left"] as const;
    for (const side of sides) {
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

//convert URI into a blob to transmit to server
export const createBlob = (localUri: string): Promise<Blob> => {
  //converts the image URI into a blob. there are references to using fetch online,
  // but it looks like that was broken in the latest version of expo

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", localUri, true);
    xhr.send(null);
  });
};

export const getRandomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const getInitialDimensions = (
  puzzleType: string,
  minSandboxY: number,
  maxSandboxY: number,
  solvedIndex: number,
  shuffledIndex: number,
  gridSize: number,
  squareSize: number
): PieceConfiguration => {
  const randomFactor = shuffledIndex % 2 ? squareSize * 0.1 : 0;
  const scaleSquaresToSandbox = (maxSandboxY - minSandboxY) / minSandboxY;

  const pieceDimensions: Dimension = { width: squareSize, height: squareSize };
  const initialPlacement: Point = {
    x: (shuffledIndex % gridSize) * squareSize - randomFactor,
    y:
      minSandboxY +
      Math.floor(shuffledIndex / gridSize) *
        squareSize *
        scaleSquaresToSandbox +
      randomFactor,
  };
  const square: Point = {
    x: solvedIndex % gridSize,
    y: Math.floor(solvedIndex / gridSize),
  };
  const viewBox: Viewbox = {
    originX: square.x * squareSize,
    originY: square.y * squareSize,
  };

  // create offset so that pieces can snap on center
  const snapOffset: Point = { x: squareSize * 0.5, y: squareSize * 0.5 };

  if (puzzleType === "jigsaw") {
    //for jigsaw puzzles, some pieces must be offset or larger viewbox to account for jigsaw "tabs"
    pieceDimensions.height =
      square.y === 0 || square.y === gridSize - 1
        ? squareSize * 1.25
        : squareSize * 1.5;
    pieceDimensions.width =
      square.x === 0 || square.x === gridSize - 1
        ? squareSize * 1.25
        : squareSize * 1.5;
    const scaleJigsawToSandbox =
      (maxSandboxY - squareSize * 0.25 - minSandboxY) / minSandboxY;
    initialPlacement.x = Math.max(
      0,
      (shuffledIndex % gridSize) * squareSize - squareSize * 0.25
    );
    initialPlacement.y =
      minSandboxY +
      Math.max(
        0,
        Math.floor(shuffledIndex / gridSize) * squareSize - squareSize * 0.25
      ) *
        scaleJigsawToSandbox;
    viewBox.originX = Math.max(0, square.x * squareSize - squareSize * 0.25);
    viewBox.originY = Math.max(0, square.y * squareSize - squareSize * 0.25);

    //for pieces not in the first row or column, offset is increased to account for jigsaw tabs
    if (square.y > 0) snapOffset.y += squareSize * 0.25;
    if (square.x > 0) snapOffset.x += squareSize * 0.25;
  }
  return { pieceDimensions, initialPlacement, viewBox, snapOffset };
};

export const shareMessage = async (pixUrl: string): Promise<void> => {
  try {
    const content = {
      message:
        "Can you solve this Pixtery?" +
        String.fromCharCode(0xd83d, 0xdcf7) +
        String.fromCharCode(0xd83d, 0xdd75) +
        "\r\n" +
        pixUrl,
    };
    const options = {
      subject: "Someone sent you a Pixtery to solve!",
    };
    const result = await Share.share(content, options);

    // All of these conditionals are empty. What is supposed to be happening here?
    // if (result.action === Share.sharedAction) {
    //   if (result.activityType) {
    //   } else {
    //   }
    // } else if (result.action === Share.dismissedAction) {
    // }
  } catch (error) {
    alert(error.message);
  }
};

// populates X Y coordinates for upper left corner of each grid section
export const getGridSections = (
  gridSize: number,
  squareSize: number
): Point[] => {
  const snapPoints: Point[] = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      snapPoints.push({
        x: (j + 0.5) * squareSize,
        y: (i + 0.5) * squareSize,
      });
    }
  }
  return snapPoints;
};

export const fillArray = (gridSize: number): number[] => {
  const numberArray = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    numberArray.push(i);
  }
  return numberArray;
};

export const getPointsDistance = (
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
) => {
  const a = pointA.x - pointB.x;
  const b = pointA.y - pointB.y;
  return Math.sqrt(a * a + b * b);
};

export const snapAngle = (angle: number) => {
  // convert rotation to between 0 and 2 * pi
  angle = angle % (Math.PI * 2);
  angle += 2 * Math.PI;
  angle = angle % (Math.PI * 2);
  // 'snap' rotation to whichever angle it's closest to
  if (angle >= 315 * DEGREE_CONVERSION || angle < 45 * DEGREE_CONVERSION) {
    angle = 0;
  } else if (
    angle >= 45 * DEGREE_CONVERSION &&
    angle < 135 * DEGREE_CONVERSION
  ) {
    angle = 90 * DEGREE_CONVERSION;
  } else if (
    angle >= 135 * DEGREE_CONVERSION &&
    angle < 225 * DEGREE_CONVERSION
  ) {
    angle = 180 * DEGREE_CONVERSION;
  } else {
    angle = 270 * DEGREE_CONVERSION;
  }
  return angle;
};

export const validateBoard = (currentBoard: BoardSpace[], gridSize: number) => {
  if (currentBoard.length === gridSize * gridSize) {
    let valid = true;
    for (let i = 0; i < currentBoard.length; i++) {
      const { pointIndex, solvedIndex, rotation } = currentBoard[i];
      if (pointIndex !== solvedIndex || rotation !== 0) {
        valid = false;
        break;
      }
    }
    return valid;
  } else return false;
};
