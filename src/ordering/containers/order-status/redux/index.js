import { combineReducers } from 'redux';
import common from './common';
import thankYou from '../containers/ThankYou/redux';
import reportDriver from '../containers/reportDriver/redux';

export default combineReducers({
  common,
  thankYou,
  reportDriver,
});
