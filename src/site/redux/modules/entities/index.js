import { combineReducers } from 'redux';
import stores from './stores';
import storeCollections from './storeCollections';

const rootReducer = combineReducers({
  stores,
  storeCollections,
});

export default rootReducer;
