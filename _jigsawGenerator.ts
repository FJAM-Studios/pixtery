export interface JigsawFactors {
  seed: number;
  tabSize: number;
  jitter: number;
  dimensions: {
    x: number;
    y: number;
  };
  tiles: {
    x: number;
    y: number;
  };
}

export class JigsawPiecePoints {
  top: Point[] = [];
  bottom: Point[] = [];
  left: Point[] = [];
  right: Point[] = [];
}

export interface Point {
  x: number;
  y: number;
}

export const jigsawGenerator = ({
  seed,
  tabSize,
  jitter,
  dimensions,
  tiles,
}: JigsawFactors): JigsawPiecePoints[] => {
  const pieceArray: JigsawPiecePoints[] = new Array(tiles.x * tiles.y);
  const pieceWidth = dimensions.x / tiles.x;
  const pieceHeight = dimensions.y / tiles.y;
  for (let z = 0; z < pieceArray.length; z++)
    pieceArray[z] = new JigsawPiecePoints();
  for (let i = 1; i <= tiles.y; i++) {
    for (let j = 1; j <= tiles.x; j++) {
      const ix = j - 1 + (i - 1) * tiles.x;
      const piece = pieceArray[ix];
      //set borders
      if (i === 1)
        piece.top = [
          {
            x: pieceWidth * (j - 1),
            y: pieceHeight * (i - 1),
          },
          {
            x: pieceWidth * j,
            y: pieceHeight * (i - 1),
          },
        ];
      if (i === tiles.y)
        piece.bottom = [
          {
            x: pieceWidth * j,
            y: pieceHeight * i,
          },
          {
            x: pieceWidth * (j - 1),
            y: pieceHeight * i,
          },
        ];
      if (j === 1)
        piece.left = [
          {
            x: pieceWidth * (j - 1),
            y: pieceHeight * i,
          },
          {
            x: pieceWidth * (j - 1),
            y: pieceHeight * (i - 1),
          },
        ];
      if (j === tiles.x)
        piece.right = [
          {
            x: pieceWidth * j,
            y: pieceHeight * (i - 1),
          },
          {
            x: pieceWidth * j,
            y: pieceHeight * i,
          },
        ];
      //build curved sides
      //TODO - actual puzzle shaped curves plus random rotations
      if (piece.right.length === 0) {
        const topRight: Point = { x: pieceWidth * j, y: pieceHeight * (i - 1) };
        const bottomRight: Point = { x: pieceWidth * j, y: pieceHeight * i };
        piece.right = [];
      }
      if (piece.bottom.length === 0)
        piece.bottom = [
          {
            x: pieceWidth * j,
            y: pieceHeight * i,
          },
          {
            x: pieceWidth * (j - 0.5),
            y: 15 + pieceHeight * i,
          },
          {
            x: pieceWidth * (j - 1),
            y: pieceHeight * i,
          },
        ];
      //duplicate curve to next or below piece, reversing order for SVG path drawing
      if (pieceArray[ix + 1] && j !== tiles.x) {
        pieceArray[ix + 1].left = [...piece.right].reverse();
      }
      if (pieceArray[ix + tiles.x] && i !== tiles.y) {
        pieceArray[ix + tiles.x].top = [...piece.bottom].reverse();
      }
    }
  }
  return pieceArray;
};
