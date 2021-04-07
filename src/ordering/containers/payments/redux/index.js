import { combineReducers } from 'redux';
import common from './common';
import savedCards from '../containers/SavedCards/redux';

export default combineReducers({
  common,
  savedCards,
});
