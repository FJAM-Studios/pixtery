import { AnyAction } from "redux";

import { Puzzle } from "../../types";

// action types

const SET_PUZZLES = "SET_PUZZLES";

// action creators

export const setReceivedPuzzles = (receivedPuzzles: Puzzle[]): AnyAction => {
  return {
    type: SET_PUZZLES,
    receivedPuzzles,
  };
};

// reducer

const initialState: Puzzle[] = [];

function reducer(state = initialState, action: AnyAction): Puzzle[] {
  switch (action.type) {
    case SET_PUZZLES:
      return action.receivedPuzzles;
    default:
      return state;
  }
}

export default reducer;
