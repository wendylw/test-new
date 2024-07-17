import { combineReducers } from 'redux';
import malaysian from './malaysian';
import nonMalaysian from './nonMalaysian';

export default combineReducers({
  malaysian,
  nonMalaysian,
});
