import { combineReducers } from 'redux';
import places from './places';
import stores from './stores';

const rootReducer = combineReducers({
  places,
  stores,
});

export default rootReducer;
