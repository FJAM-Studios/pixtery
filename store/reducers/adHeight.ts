import { AnyAction } from "redux";

// action types

const SET_AD_HEIGHT = "SET_AD_HEIGHT";

// action creators

export const setAdHeight = (adHeight: number): AnyAction => {
  return {
    type: SET_AD_HEIGHT,
    adHeight,
  };
};

// reducer

const initialState = 0;

function reducer(state = initialState, action: AnyAction): number {
  switch (action.type) {
    case SET_AD_HEIGHT:
      return action.adHeight;
    default:
      return state;
  }
}

export default reducer;
