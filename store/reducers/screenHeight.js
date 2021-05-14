// action types

const SET_HEIGHT = "SET_HEIGHT";

// action creators

export const setDeviceSize = (height, boardSize) => {
  return {
    type: SET_HEIGHT,
    height,
    boardSize,
  };
};

// reducer

const initialState = { boardSize: 0, height: 0 };

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_HEIGHT:
      return { boardSize: action.boardSize, height: action.height };
    default:
      return state;
  }
}

export default reducer;
