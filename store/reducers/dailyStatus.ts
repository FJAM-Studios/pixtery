import { AnyAction } from "redux";

// action types

const SET_DAILY_STATUS = "SET_DAILY_STATUS";

// action creators

export const setDailyStatus = (dailyStatus: string): AnyAction => {
  return {
    type: SET_DAILY_STATUS,
    dailyStatus,
  };
};

// reducer

const initialState = "";

function reducer(state = initialState, action: AnyAction): string {
  switch (action.type) {
    case SET_DAILY_STATUS:
      return action.dailyStatus;
    default:
      return state;
  }
}

export default reducer;
