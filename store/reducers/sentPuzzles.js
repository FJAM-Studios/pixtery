// action types

const SET_SENT_PUZZLES = "SET_SENT_PUZZLES";

// action creators

export const setSentPuzzles = (sentPuzzles) => {
  return {
    type: SET_SENT_PUZZLES,
    sentPuzzles,
  };
};

// reducer

const initialState = [];

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_SENT_PUZZLES:
      return action.sentPuzzles;
    default:
      return state;
  }
}

export default reducer;
