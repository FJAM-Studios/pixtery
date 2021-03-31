export class Piece {
  top: Point[] = [];
  bottom: Point[] = [];
  left: Point[] = [];
  right: Point[] = [];
}

export interface Point {
  x: number;
  y: number;
}

export interface GridSections {
    rowDividers: number[];
    colDividers: number[];
}