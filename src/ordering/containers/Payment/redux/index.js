import { combineReducers } from 'redux';
import common from './common';
import savedCards from '../SavedCards/redux';

export default combineReducers({
  common,
  savedCards,
});
