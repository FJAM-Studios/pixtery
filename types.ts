import { ImageSourcePropType } from "react-native";

export class SvgPiece {
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
export interface Puzzle {
  puzzleType: string;
  gridSize: number;
  senderName: string;
  senderPhone: string;
  imageURI: string;
  publicKey?: string;
  message?: string | null;
  dateReceived?: string;
  completed?: boolean;
}

export interface Profile {
  name: string;
  phone: string;
}

export interface Piece {
  href: ImageSourcePropType;
  pieceWidth: number;
  pieceHeight: number;
  piecePath: string;
  initX: number;
  initY: number;
  initialRotation: number;
  solvedIndex: number;
}
