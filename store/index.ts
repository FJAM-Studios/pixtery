import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import adHeight from "./reducers/adHeight";
import message from "./reducers/message";
import profile from "./reducers/profile";
import receivedPuzzles from "./reducers/receivedPuzzles";
import screenHeight from "./reducers/screenHeight";
import sentPuzzles from "./reducers/sentPuzzles";
import theme from "./reducers/theme";
import tutorialFinished from "./reducers/tutorialFinished";

const reducer = combineReducers({
  adHeight,
  message,
  profile,
  receivedPuzzles,
  screenHeight,
  sentPuzzles,
  theme,
  tutorialFinished,
});

export default createStore(reducer, applyMiddleware(thunk));
