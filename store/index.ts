import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import profile from "./reducers/profile";
import receivedPuzzles from "./reducers/receivedPuzzles";
import screenHeight from "./reducers/screenHeight";
import sentPuzzles from "./reducers/sentPuzzles";
import theme from "./reducers/theme";

const reducer = combineReducers({
  screenHeight,
  receivedPuzzles,
  sentPuzzles,
  profile,
  theme,
});

export default createStore(reducer, applyMiddleware(thunk));
