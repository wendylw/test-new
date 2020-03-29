import { combineReducers } from 'redux';
import app from './app';
import entities from './entities';

const rootReducer = combineReducers({
  entities,
  app,
});

export default rootReducer;
