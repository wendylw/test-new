import { combineReducers } from 'redux';
import entities from '../../../redux/modules/entities';
import app from './app';
import home from './home';
import tables from './tables';
import address from '../../../redux/modules/address';

const rootReducer = combineReducers({
  entities,
  app,
  home,
  tables,
  address,
});

export default rootReducer;
