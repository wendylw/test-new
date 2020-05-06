import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import home from './home';
import tables from './tables';

const rootReducer = combineReducers({
  entities,
  app,
  home,
  tables,
});

export default rootReducer;
