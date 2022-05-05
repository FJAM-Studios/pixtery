import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import adHeight from "./reducers/adHeight";
import dailyStatus from "./reducers/dailyStatus";
import notificationToken from "./reducers/notificationToken";
import profile from "./reducers/profile";
import receivedPuzzles from "./reducers/receivedPuzzles";
import screenHeight from "./reducers/screenHeight";
import sentPuzzles from "./reducers/sentPuzzles";
import sounds from "./reducers/sounds";
import theme from "./reducers/theme";
import tutorialFinished from "./reducers/tutorialFinished";

const reducer = combineReducers({
  adHeight,
  profile,
  notificationToken,
  receivedPuzzles,
  screenHeight,
  sentPuzzles,
  theme,
  tutorialFinished,
  sounds,
  dailyStatus,
});

export default createStore(reducer, applyMiddleware(thunk));
