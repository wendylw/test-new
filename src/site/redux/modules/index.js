import { combineReducers } from 'redux';
import app from './app';
import home from './home';
import entities from './entities';

const rootReducer = combineReducers({
  entities,
  app,
  home,
});

export default rootReducer;