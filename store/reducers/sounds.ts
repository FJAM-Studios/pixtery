import { Audio } from "expo-av";
import { AnyAction } from "redux";

// action types

const SET_SOUNDS = "SET_SOUNDS";

// action creators

export const setSounds = (
  sounds: { clickSound: Audio.Sound; winSound: Audio.Sound } | null
): AnyAction => {
  return {
    type: SET_SOUNDS,
    sounds,
  };
};

// reducer

const initialState = null;

function reducer(
  state: {
    clickSound: Audio.Sound;
    winSound: Audio.Sound;
  } | null = initialState,
  action: AnyAction
): { clickSound: Audio.Sound; winSound: Audio.Sound } | null {
  switch (action.type) {
    case SET_SOUNDS:
      return action.sounds;
    default:
      return state;
  }
}

export default reducer;
