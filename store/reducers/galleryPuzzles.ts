import { AnyAction } from "redux";

import { Puzzle } from "../../types";

// action types

const SET_GALLERY_PUZZLES = "SET_GALLERY_PUZZLES";

// action creators

export const setGalleryPuzzles = (galleryPuzzles: Puzzle[]): AnyAction => {
  return {
    type: SET_GALLERY_PUZZLES,
    galleryPuzzles,
  };
};

// reducer

const initialState: Puzzle[] = [];

function reducer(state = initialState, action: AnyAction): Puzzle[] {
  switch (action.type) {
    case SET_GALLERY_PUZZLES:
      return action.galleryPuzzles;
    default:
      return state;
  }
}

export default reducer;
