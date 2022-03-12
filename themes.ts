import { DefaultTheme } from "react-native-paper";

import { PixteryTheme } from "./types";

const defaultTheme: PixteryTheme = {
  ...DefaultTheme,
  roundness: 10,
  name: "Pastel",
  ID: 0,
  colors: {
    ...DefaultTheme.colors,
    primary: "#7D8CC4",
    accent: "#B8336A",
    background: "#C490D1",
    surface: "#A0D2DB",
    text: "#f8f8ff",
    disabled: "#808080",
    placeholder: "#726DA8",
    backdrop: "#726DA8",
  },
};

const darkTheme: PixteryTheme = {
  ...DefaultTheme,
  roundness: 10,
  name: "Midnight",
  ID: 1,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: "#808080",
    accent: "#5C5C5C",
    background: "#222222",
    surface: "#808080",
    text: "#f8f8ff",
    disabled: "#808080",
    placeholder: "#191102",
    backdrop: "#ACACAC",
  },
};

const lightTheme: PixteryTheme = {
  ...DefaultTheme,
  roundness: 10,
  name: "Sunlight",
  ID: 2,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: "#E6C3B2",
    accent: "#CACACA",
    background: "#F9F1D5",
    surface: "#FFB868",
    text: "#2f2f2f",
    disabled: "#808080",
    placeholder: "#FFE787",
    backdrop: "#FFE787",
  },
};

const oceanTheme: PixteryTheme = {
  ...DefaultTheme,
  roundness: 10,
  name: "Submarine",
  ID: 3,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: "#90C2E7",
    accent: "#4E8098",
    background: "#008DA9",
    surface: "#4C576B",
    text: "#f8f8ff",
    disabled: "#808080",
    placeholder: "#004452",
    backdrop: "#004452",
  },
};

const forestTheme: PixteryTheme = {
  ...DefaultTheme,
  roundness: 10,
  name: "Conifer",
  ID: 4,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: "#B4E6B1",
    accent: "#C9C9C9",
    background: "#214A1E",
    surface: "#259112",
    text: "#f8f8ff",
    disabled: "#808080",
    placeholder: "#8BFF87",
    backdrop: "#2B5729",
  },
};

const neonTheme: PixteryTheme = {
  ...DefaultTheme,
  roundness: 10,
  name: "Nightlife",
  ID: 5,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: "#00D90E",
    accent: "#FF00BF",
    background: "#222222",
    surface: "#00E3DF",
    text: "#f8f8ff",
    disabled: "#808080",
    placeholder: "#191102",
    backdrop: "#191102",
  },
};

export const allThemes = [
  defaultTheme,
  darkTheme,
  lightTheme,
  oceanTheme,
  forestTheme,
  neonTheme,
];
