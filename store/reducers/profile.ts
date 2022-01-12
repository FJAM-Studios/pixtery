import { AnyAction } from "redux";

import { Profile } from "../../types";

// action types

const SET_PROFILE = "SET_PROFILE";

// action creators

export const setProfile = (profile: Profile | null): AnyAction => {
  return {
    type: SET_PROFILE,
    profile,
  };
};

// reducer

const initialState = null;

function reducer(
  state: Profile | null = initialState,
  action: AnyAction
): Profile | null {
  switch (action.type) {
    case SET_PROFILE:
      if (!action.profile) return initialState;
      else return { ...state, ...action.profile };
    default:
      return state;
  }
}

export default reducer;
