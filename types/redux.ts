import { Audio } from "expo-av";
import { Theme } from "react-native-paper/lib/typescript/types";

export interface Profile {
  name: string;
  isGalleryAdmin?: boolean;
  noSound?: boolean;
  noVibration?: boolean;
}

export type PixteryTheme = Theme & { name: string; ID: number };

export interface ScreenHeight {
  width: number;
  height: number;
  boardSize: number;
}

export interface RootState {
  adHeight: number;
  profile: Profile | null;
  receivedPuzzles: Puzzle[];
  sentPuzzles: Puzzle[];
  screenHeight: ScreenHeight;
  theme: PixteryTheme;
  tutorialFinished: boolean;
  sounds: { clickSound: Audio.Sound; winSound: Audio.Sound } | null;
  notificationToken: string;
  dailyStatus: string;
}
