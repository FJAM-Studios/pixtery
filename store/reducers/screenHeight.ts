import { AnyAction } from "redux";

import { ScreenHeight } from "../../types";

// action types

const SET_HEIGHT = "SET_HEIGHT";
const SET_AD_HEIGHT = "SET_AD_HEIGHT";

// action creators

export const setDeviceSize = (height: number, boardSize: number): AnyAction => {
  return {
    type: SET_HEIGHT,
    height,
    boardSize,
  };
};

export const setAdHeight = (adHeight: number): AnyAction => {
  return {
    type: SET_AD_HEIGHT,
    adHeight,
  };
};

// reducer

const initialState: ScreenHeight = { boardSize: 0, height: 0, adHeight: 0 };

function reducer(state = initialState, action: AnyAction): ScreenHeight {
  switch (action.type) {
    case SET_HEIGHT:
      return {
        boardSize: action.boardSize,
        height: action.height,
        adHeight: state.adHeight,
      };
    case SET_AD_HEIGHT:
      return {
        boardSize: state.boardSize,
        height: state.height,
        adHeight: action.adHeight,
      };
    default:
      return state;
  }
}

export default reducer;
