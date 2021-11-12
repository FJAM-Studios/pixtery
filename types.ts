import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImageManipulator from "expo-image-manipulator";
import { Theme } from "react-native-paper/lib/typescript/types";

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
  imageURI: string;
  publicKey: string;
  message?: string | null;
  dateReceived?: string;
  completed?: boolean;
}

export interface Profile {
  name: string;
  isGalleryAdmin?: boolean;
  noSound?: boolean;
  noVibration?: boolean;
}

export interface Piece {
  href: ImageManipulator.ImageResult | string;
  pieceDimensions: Dimension;
  piecePath: string;
  initialPlacement: Point;
  initialRotation: number;
  solvedIndex: number;
  snapOffset: Point;
  viewBox?: Viewbox;
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
  Puzzle: { publicKey: string; sourceList: string };
  AddPuzzle: { publicKey: string; sourceList: string };
  Profile: undefined;
  Tutorial: undefined;
  Gallery: undefined;
  AddToGallery: undefined;
  GalleryQueue: undefined | { forceReload: boolean };
  GalleryReview: { puzzle: Puzzle };
};

export type ScreenNavigation = StackNavigationProp<StackScreens>;

export type PuzzleRoute = RouteProp<StackScreens, "Puzzle">;
export type AddPuzzleRoute = RouteProp<StackScreens, "AddPuzzle">;
export type CreateProfileRoute = RouteProp<StackScreens, "CreateProfile">;
export type SplashRoute = RouteProp<StackScreens, "Splash">;
export type GalleryQueueRoute = RouteProp<StackScreens, "GalleryQueue">;
export type GalleryReviewRoute = RouteProp<StackScreens, "GalleryReview">;

//// STORE /////
export interface ScreenHeight {
  width: number;
  height: number;
  boardSize: number;
}

export interface RootState {
  profile: Profile;
  receivedPuzzles: Puzzle[];
  sentPuzzles: Puzzle[];
  screenHeight: ScreenHeight;
  theme: PixteryTheme;
  adHeight: number;
  tutorialFinished: boolean;
}

export type PixteryTheme = Theme & { name: string; ID: number };
