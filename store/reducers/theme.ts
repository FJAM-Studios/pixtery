// the theme never changes so this is a little overkill but theme is getting passed down through multiple levels of components. Plus if we do decide to let the user switch between theme, e.g. day and night, this will make it easier.

import { DefaultTheme } from "react-native-paper";
import { AnyAction } from "redux";

import { PixteryTheme } from "../../types";

// action types

const SET_THEME = "SET_THEME";

// action creators

export const setTheme = (theme: PixteryTheme): AnyAction => {
  return {
    type: SET_THEME,
    theme,
  };
};

// reducer

const defaultTheme: PixteryTheme = {
  ...DefaultTheme,
  roundness: 10,
  name: "Pastel",
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
    backdrop: "#191102",
  },
};

const lightTheme: PixteryTheme = {
  ...DefaultTheme,
  roundness: 10,
  name: "Sunlight",
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: "#EFD9CE",
    accent: "#CACACA",
    background: "#F9F1D5",
    surface: "#FFB868",
    text: "#2f2f2f",
    disabled: "#808080",
    placeholder: "#FFE787",
    backdrop: "#FFE787",
  },
};

export const allThemes = [defaultTheme, darkTheme, lightTheme];

const initialState: PixteryTheme = defaultTheme;

function reducer(state = initialState, action: AnyAction): PixteryTheme {
  switch (action.type) {
    case SET_THEME:
      return action.theme;
    default:
      return state;
  }
}

export default reducer;
