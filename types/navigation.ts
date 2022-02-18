import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { StatusOfDaily } from "./misc";

export type RootStackParamList = {
  TitleScreen: undefined;
  Splash: { url: string | undefined } | undefined;
  CreateProfile: { url: string | undefined };
  EnterName: {
    url?: string;
  };
  TabContainer: NavigatorScreenParams<TabContainerParamsList>;
};

export type RootStackScreenProps<
  T extends keyof RootStackParamList
> = NativeStackScreenProps<RootStackParamList, T>;

///////////

export type TabContainerParamsList = {
  MakeContainer: NavigatorScreenParams<MakeContainerParamsList>;
  DailyContainer: NavigatorScreenParams<DailyContainerParamsList>;
  LibraryContainer: NavigatorScreenParams<LibraryContainerParamsList>;
  SettingsContainer: NavigatorScreenParams<SettingsContainerParamsList>;
  AdminContainer: NavigatorScreenParams<AdminContainerParamsList>;
};

export type TabContainerProps<
  T extends keyof TabContainerParamsList
> = CompositeScreenProps<
  MaterialTopTabScreenProps<TabContainerParamsList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

///////////

export type MakeContainerParamsList = {
  Make: undefined;
  Tutorial: undefined;
};

export type MakeContainerProps<
  T extends keyof MakeContainerParamsList
> = CompositeScreenProps<
  NativeStackScreenProps<MakeContainerParamsList, T>,
  TabContainerProps<keyof TabContainerParamsList>
>;

/////////////

export type DailyContainerParamsList = {
  Gallery: undefined;
  AddToGallery: undefined;
};

export type DailyContainerProps<
  T extends keyof DailyContainerParamsList
> = CompositeScreenProps<
  NativeStackScreenProps<DailyContainerParamsList, T>,
  TabContainerProps<keyof TabContainerParamsList>
>;

////////////

export type LibraryContainerParamsList = {
  PuzzleListContainer: NavigatorScreenParams<PuzzleListContainerParamsList>;
  AddPuzzle: { publicKey: string; sourceList: string };
  Puzzle: { publicKey: string; sourceList: string };
};

export type LibraryContainerProps<
  T extends keyof LibraryContainerParamsList
> = CompositeScreenProps<
  NativeStackScreenProps<LibraryContainerParamsList, T>,
  TabContainerProps<keyof TabContainerParamsList>
>;

///////////////

export type PuzzleListContainerParamsList = {
  PuzzleList: undefined;
  SentPuzzleList: undefined;
};

export type PuzzleListContainerProps<
  T extends keyof PuzzleListContainerParamsList
> = CompositeScreenProps<
  MaterialTopTabScreenProps<PuzzleListContainerParamsList, T>,
  TabContainerProps<keyof TabContainerParamsList>
>;

///////////

export type SettingsContainerParamsList = {
  Settings: undefined;
  Profile: undefined;
  ManagePuzzles: undefined;
  ContactUs: undefined;
};

export type SettingsContainerProps<
  T extends keyof SettingsContainerParamsList
> = CompositeScreenProps<
  MaterialTopTabScreenProps<SettingsContainerParamsList, T>,
  TabContainerProps<keyof TabContainerParamsList>
>;

//////////

export type AdminContainerParamsList = {
  GalleryQueue: undefined | { forceReload: boolean };
  GalleryReview: {
    puzzle: Puzzle;
    statusOfDaily: StatusOfDaily;
    publishedDate?: string;
  };
  DailyCalendar: undefined;
};

export type AdminContainerProps<
  T extends keyof AdminContainerParamsList
> = CompositeScreenProps<
  MaterialTopTabScreenProps<AdminContainerParamsList, T>,
  TabContainerProps<keyof TabContainerParamsList>
>;

//////////////
