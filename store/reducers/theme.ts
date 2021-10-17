// the theme never changes so this is a little overkill but theme is getting passed down through multiple levels of components. Plus if we do decide to let the user switch between theme, e.g. day and night, this will make it easier.

import { AnyAction } from "redux";

import { allThemes } from "../../themes";
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

const initialState: PixteryTheme = allThemes[0];

function reducer(state = initialState, action: AnyAction): PixteryTheme {
  switch (action.type) {
    case SET_THEME:
      return action.theme;
    default:
      return state;
  }
}

export default reducer;
