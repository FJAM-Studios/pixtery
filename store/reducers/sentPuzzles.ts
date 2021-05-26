import { AnyAction } from "redux";

import { Puzzle } from "../../types";

// action types

const SET_SENT_PUZZLES = "SET_SENT_PUZZLES";

// action creators

export const setSentPuzzles = (sentPuzzles: Puzzle[]): AnyAction => {
  return {
    type: SET_SENT_PUZZLES,
    sentPuzzles,
  };
};

// reducer

const initialState: Puzzle[] = [];

function reducer(state = initialState, action: AnyAction): Puzzle[] {
  switch (action.type) {
    case SET_SENT_PUZZLES:
      return action.sentPuzzles;
    default:
      return state;
  }
}

export default reducer;
