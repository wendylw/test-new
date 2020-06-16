import { combineReducers } from 'redux';
import places from './places';
import stores from './stores';
import storeCollections from './storeCollections';

const rootReducer = combineReducers({
  places,
  stores,
  storeCollections,
});

export default rootReducer;
