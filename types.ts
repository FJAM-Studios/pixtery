import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Audio } from "expo-av";
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
  dailyDate?: string;
  notificationToken?: string;
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
  Register: undefined;
  ContactUs: undefined;
  Tutorial: undefined;
  Help: undefined;
  Gallery: undefined;
  AddToGallery: undefined;
  GalleryQueue: undefined | { forceReload: boolean };
  GalleryReview: {
    puzzle: Puzzle;
    statusOfDaily: StatusOfDaily;
    publishedDate?: string;
  };
  DailyCalendar: undefined;
  EnterName: {
    url?: string;
  };
};

export type ScreenNavigation = StackNavigationProp<StackScreens>;

export type PuzzleRoute = RouteProp<StackScreens, "Puzzle">;
export type AddPuzzleRoute = RouteProp<StackScreens, "AddPuzzle">;
export type CreateProfileRoute = RouteProp<StackScreens, "CreateProfile">;
export type SplashRoute = RouteProp<StackScreens, "Splash">;
export type RegisterRoute = RouteProp<StackScreens, "Register">;
export type GalleryQueueRoute = RouteProp<StackScreens, "GalleryQueue">;
export type GalleryReviewRoute = RouteProp<StackScreens, "GalleryReview">;
export type EnterNameRoute = RouteProp<StackScreens, "EnterName">;

//// STORE /////
export interface ScreenHeight {
  width: number;
  height: number;
  boardSize: number;
}

export interface RootState {
  adHeight: number;
  profile: Profile;
  receivedPuzzles: Puzzle[];
  sentPuzzles: Puzzle[];
  screenHeight: ScreenHeight;
  theme: PixteryTheme;
  tutorialFinished: boolean;
  sound: Audio.Sound | null;
  notificationToken: string;
}

export type PixteryTheme = Theme & { name: string; ID: number };

export interface DailyDate {
  [key: string]: { selected: boolean; puzzle: Puzzle };
}

export enum StatusOfDaily {
  UNDER_REVIEW,
  PUBLISHED,
}

export interface DateObjString {
  year: string;
  month: string;
  day: string;
}

export enum SignInOptions {
  ANON,
  PHONE,
  EMAIL,
}
