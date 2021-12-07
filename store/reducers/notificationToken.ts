import { AnyAction } from "redux";

// action types

const SET_TOKEN = "SET_TOKEN";

// action creators

export const setNotificationToken = (token: string): AnyAction => {
  return {
    type: SET_TOKEN,
    token,
  };
};

// reducer

const initialState = null;

function reducer(
  state: string | null = initialState,
  action: AnyAction
): string | null {
  switch (action.type) {
    case SET_TOKEN:
      return action.token;
    default:
      return state;
  }
}

export default reducer;
