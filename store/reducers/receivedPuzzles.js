// action types

const SET_PUZZLES = "SET_PUZZLES";

// action creators

export const setReceivedPuzzles = (receivedPuzzles) => {
  return {
    type: SET_PUZZLES,
    receivedPuzzles,
  };
};

// reducer

const initialState = [];

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_PUZZLES:
      return action.receivedPuzzles;
    default:
      return state;
  }
}

export default reducer;
