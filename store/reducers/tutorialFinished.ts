import { AnyAction } from "redux";

// action types

const SET_TUTORIAL_FINISHED = "SET_TUTORIAL_FINISHED";

// action creators

export const setTutorialFinished = (tutorialFinished: boolean): AnyAction => {
  return {
    type: SET_TUTORIAL_FINISHED,
    tutorialFinished,
  };
};

// reducer

const initialState = false;

function reducer(state = initialState, action: AnyAction): boolean {
  switch (action.type) {
    case SET_TUTORIAL_FINISHED:
      return action.tutorialFinished;
    default:
      return state;
  }
}

export default reducer;
