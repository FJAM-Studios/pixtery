// the theme never changes so this is a little overkill but theme is getting passed down through multiple levels of components. Plus if we do decide to let the user switch between theme, e.g. day and night, this will make it easier.

import { DefaultTheme } from "react-native-paper";

// action types

const SET_THEME = "SET_THEME";

// action creators

export const setTheme = (theme) => {
  return {
    type: SET_THEME,
    theme,
  };
};

// reducer

const theme = {
  ...DefaultTheme,
  roundness: 10,
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

const initialState = theme;

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_THEME:
      return action.theme;
    default:
      return state;
  }
}

export default reducer;
