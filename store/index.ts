import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import adHeight from "./reducers/adHeight";
import profile from "./reducers/profile";
import receivedPuzzles from "./reducers/receivedPuzzles";
import screenHeight from "./reducers/screenHeight";
import sentPuzzles from "./reducers/sentPuzzles";
import sound from "./reducers/sound";
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
  sound,
});

export default createStore(reducer, applyMiddleware(thunk));
