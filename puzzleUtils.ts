/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AnyIfEmpty } from "react-redux";
import { DEGREE_CONVERSION } from "./constants";
import {
  SvgPiece,
  Point,
  Dimension,
  Viewbox,
  PieceConfiguration,
  BoardSpace,
  Puzzle,
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

export const getInitialDimensions = (
  puzzleType: string,
  minSandboxY: number,
  maxSandboxY: number,
  solvedIndex: number,
  shuffledIndex: number,
  gridSize: number,
  squareSize: number,
  boardSize: number
): PieceConfiguration => {
  const randomFactor = shuffledIndex % 2 ? squareSize * 0.1 : 0;
  const scaleSquaresToSandbox = (maxSandboxY - minSandboxY) / minSandboxY;

  const pieceDimensions: Dimension = { width: squareSize, height: squareSize };
  const initialPlacement: Point = {
    x: (shuffledIndex % gridSize) * squareSize - randomFactor,
    // take min of min Y of sandbox + adjustment based on index, or the maximum Y of sandbox
    y: Math.min(
      minSandboxY +
        Math.floor(shuffledIndex / gridSize) *
          squareSize *
          scaleSquaresToSandbox +
        randomFactor,
      maxSandboxY
    ),
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
      Math.max(0, maxSandboxY - squareSize * 0.25 - minSandboxY) / minSandboxY;
    initialPlacement.x = Math.max(
      0,
      (shuffledIndex % gridSize) * squareSize - squareSize * 0.25
    );
    const sandboxCenterY = (minSandboxY + maxSandboxY + squareSize) / 2;
    // anchors on horiontal center of sandbox, and extrapolates Y by subtracting 1/2 of piece height
    initialPlacement.y = Math.max(
      sandboxCenterY +
        Math.max(
          0,
          Math.floor(shuffledIndex / gridSize) * squareSize - squareSize * 0.25
        ) *
          scaleJigsawToSandbox -
        randomFactor -
        pieceDimensions.height * 0.5,
      // limit upper bound of sandbox to half of the jigsaw "tab"
      boardSize - (squareSize * 0.25) / 2
    );

    viewBox.originX = Math.max(0, square.x * squareSize - squareSize * 0.25);
    viewBox.originY = Math.max(0, square.y * squareSize - squareSize * 0.25);

    //for pieces not in the first row or column, offset is increased to account for jigsaw tabs
    if (square.y > 0) snapOffset.y += squareSize * 0.25;
    if (square.x > 0) snapOffset.x += squareSize * 0.25;
  }
  return { pieceDimensions, initialPlacement, viewBox, snapOffset };
};

// populates X Y coordinates for upper left corner of each grid section
export const getSnapPoints = (
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
): number => {
  const a = pointA.x - pointB.x;
  const b = pointA.y - pointB.y;
  return Math.sqrt(a * a + b * b);
};

export const snapAngle = (angle: number): number => {
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

// takes an index, grid size, and rotation and returns the rotated index on grid
const rotateIndex = (ix: number, size: number, rotation: number): number => {
  for (let i = 0; i < (2 * rotation) / Math.PI; i++) {
    const y = Math.floor(ix / size);
    const x = ix % size;
    ix = (size - x - 1) * size + y;
  }
  return ix;
};

export const validateBoard = (
  currentBoard: BoardSpace[],
  gridSize: number
): boolean => {
  if (currentBoard.length === gridSize * gridSize) {
    // set orientation as top left corner piece rotation
    const orientation = currentBoard.filter(
      (piece) => piece.pointIndex === 0
    )[0].rotation;
    for (let i = 0; i < currentBoard.length; i++) {
      const { pointIndex, solvedIndex, rotation } = currentBoard[i];
      if (
        // rotated location of piece must match solution location
        rotateIndex(pointIndex, gridSize, rotation) !== solvedIndex ||
        // ensure all pieces oriented same direction
        orientation !== rotation
      ) {
        return false;
      }
    }
    return true;
  } else return false;
};

// used insertion sort, which is efficient for almost sorted lists, assuming that for now it's more likely that users will reload a nearly sorted list based on default sort of dateReceived
// could potentially use a different sorting algo for specific user-selected sorting
export const sortPuzzles = (
  sortBy: keyof Puzzle,
  order: string,
  puzzleList: Puzzle[]
): Puzzle[] => {
  let currPuzzle: Puzzle;
  let i = 1;
  while (i < puzzleList.length) {
    currPuzzle = puzzleList[i];
    const currValToSortBy = currPuzzle[sortBy];
    let j = i - 1;
    if (order === "desc") {
      // assert here that the val to sort by is non null for now (given based on dateReceived); may need to be updated if we sort on optional fields
      while (j >= 0 && puzzleList[j][sortBy]! < currValToSortBy!) {
        puzzleList[j + 1] = puzzleList[j];
        j--;
      }
    }
    if (order === "asc") {
      while (j >= 0 && puzzleList[j][sortBy]! > currValToSortBy!) {
        puzzleList[j + 1] = puzzleList[j];
        j--;
      }
    }
    puzzleList[j + 1] = currPuzzle;
    i++;
  }
  return puzzleList;
};
