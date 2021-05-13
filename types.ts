import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImageManipulator from "expo-image-manipulator";

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

export interface Dimension {
  width: number;
  height: number;
}

export interface Viewbox {
  originX: number;
  originY: number;
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
  href: ImageManipulator.ImageResult;
  pieceDimensions: Dimension;
  piecePath: string;
  initialPlacement: Point;
  initialRotation: number;
  solvedIndex: number;
  snapOffset: Point;
}

export interface PieceConfiguration {
  pieceDimensions: Dimension;
  initialPlacement: Point;
  viewBox: Viewbox;
  snapOffset: Point;
}

export interface BoardSpace {
  pointIndex: number;
  solvedIndex: number;
  rotation: number;
}

export type StackScreens = {
  TitleScreen: undefined;
  Splash: { url: string | undefined } | undefined;
  CreateProfile: { url: string | undefined };
  Home: undefined;
  PuzzleList: undefined;
  SentPuzzleList: undefined;
  Puzzle: { publicKey: string | undefined };
  AddPuzzle: { url: string };
  Profile: undefined;
};

export type ScreenNavigation = StackNavigationProp<StackScreens>;

export type PuzzleRoute = RouteProp<StackScreens, "Puzzle">;
export type AddPuzzleRoute = RouteProp<StackScreens, "AddPuzzle">;
export type CreateProfileRoute = RouteProp<StackScreens, "CreateProfile">;
export type SplashRoute = RouteProp<StackScreens, "Splash">;
