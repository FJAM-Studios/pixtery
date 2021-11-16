import { Audio } from "expo-av";
import { AnyAction } from "redux";

// action types

const SET_SOUND = "SET_SOUND";

// action creators

export const setSound = (sound: Audio.Sound): AnyAction => {
  return {
    type: SET_SOUND,
    sound,
  };
};

// reducer

const initialState = null;

function reducer(state = initialState, action: AnyAction): Audio.Sound | null {
  switch (action.type) {
    case SET_SOUND:
      return action.sound;
    default:
      return state;
  }
}

export default reducer;
