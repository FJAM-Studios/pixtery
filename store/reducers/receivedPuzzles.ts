import { AnyAction } from "redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Puzzle } from "../../types";

async function saveToLocalStorage(newPuzzles: Puzzle[]){
  await AsyncStorage.setItem("@pixteryPuzzles", JSON.stringify(newPuzzles));
}


// action types

const SET_PUZZLES = "SET_PUZZLES";
const DELETE_RECEIVED_PUZZLE = "DELETE_RECEIVED_PUZZLE";

// action creators

export const setReceivedPuzzles = (receivedPuzzles: Puzzle[]): AnyAction => {
  return {
    type: SET_PUZZLES,
    receivedPuzzles,
  };
};

const _deleteReceivedPuzzle = (receivedPuzzles: Puzzle[]): AnyAction => {
  return {
    type: DELETE_RECEIVED_PUZZLE,
    receivedPuzzles,
  };
};

//thunks
export const deleteReceivedPuzzle = (publicKey: string): Function => {
  return async function (dispatch, getState){
    const newPuzzles = getState().receivedPuzzles.filter((puz) => puz.publicKey !== publicKey);
    await AsyncStorage.setItem("@pixteryPuzzles", JSON.stringify(newPuzzles));
    dispatch(_deleteReceivedPuzzle(newPuzzles));
  };
};


// reducer

const initialState: Puzzle[] = [];

function reducer(state = initialState, action: AnyAction): Puzzle[] {
  switch (action.type) {
    case SET_PUZZLES:
      return action.receivedPuzzles;
    case DELETE_RECEIVED_PUZZLE:
      return action.receivedPuzzles;
    default:
      return state;
  }
}

export default reducer;
