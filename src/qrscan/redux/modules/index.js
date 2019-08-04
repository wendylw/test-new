import { combineReducers } from "redux";
import app from './app';
import home from './home';

const rootReducer = combineReducers({
  app,
  home,
});

export default rootReducer;
