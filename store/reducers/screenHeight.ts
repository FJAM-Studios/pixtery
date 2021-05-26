import { AnyAction } from "redux";

import { ScreenHeight } from "../../types";

// action types

const SET_HEIGHT = "SET_HEIGHT";

// action creators

export const setDeviceSize = (height: number, boardSize: number): AnyAction => {
  return {
    type: SET_HEIGHT,
    height,
    boardSize,
  };
};

// reducer

const initialState: ScreenHeight = { boardSize: 0, height: 0 };

function reducer(state = initialState, action: AnyAction): ScreenHeight {
  switch (action.type) {
    case SET_HEIGHT:
      return {
        boardSize: action.boardSize,
        height: action.height,
      };
    default:
      return state;
  }
}

export default reducer;
