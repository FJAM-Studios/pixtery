import { Piece } from "./types";

export const shuffle = (
  array: number[],
  dontShuffle: boolean = false
): number[] => {
  if (dontShuffle) return array;
  let currentIndex = array.length,
    temporaryValue: number,
    randomIndex: number;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

//this function can be moved to its own module or utility file

export const generateJigsawPiecePaths = (
  gridSize: number,
  squareSize: number,
  disableOffset: boolean = false
): string[] => {
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
    for (let side of sides) {
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
    const pieces: Piece[] = new Array(gridSize * gridSize);
    //fill array with empty pieces
    for (let z = 0; z < pieces.length; z++) pieces[z] = new Piece();
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
  
