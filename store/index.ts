import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import adHeight from "./reducers/adHeight";
import profile from "./reducers/profile";
import receivedPuzzles from "./reducers/receivedPuzzles";
import screenHeight from "./reducers/screenHeight";
import sentPuzzles from "./reducers/sentPuzzles";
import theme from "./reducers/theme";
import tutorialFinished from "./reducers/tutorialFinished";

const reducer = combineReducers({
  screenHeight,
  receivedPuzzles,
  sentPuzzles,
  profile,
  theme,
  adHeight,
  tutorialFinished,
});

export default createStore(reducer, applyMiddleware(thunk));
