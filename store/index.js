import { combineReducers, createStore } from "redux";

import receivedPuzzles from "./reducers/receivedPuzzles";
import screenHeight from "./reducers/screenHeight";
import sentPuzzles from "./reducers/sentPuzzles";

const reducer = combineReducers({
  screenHeight,
  receivedPuzzles,
  sentPuzzles,
});

export default createStore(reducer);
