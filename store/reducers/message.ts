import { AnyAction } from "redux";

// action types

const SET_MESSAGE = "SET_MESSAGE";

// action creators

export function setMessage(message: string): AnyAction {
  return {
    type: SET_MESSAGE,
    message,
  };
}

// reducer

const initialState = "";

function reducer(state = initialState, action: AnyAction): string {
  switch (action.type) {
    case SET_MESSAGE:
      return action.message;
    default:
      return state;
  }
}

export default reducer;
