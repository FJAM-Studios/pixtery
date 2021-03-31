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

export interface Puzzle {
  puzzleType: string;
  gridSize: number;
  senderName: string;
  senderPhone: string;
  imageURI: string;
  message: string | null;
  dateReceived: string;
  completed: boolean;
}