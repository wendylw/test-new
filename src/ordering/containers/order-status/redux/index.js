import { combineReducers } from 'redux';
import common from './common';
import thankYou from '../containers/ThankYou/redux';
import reportDriver from '../containers/ReportDriver/redux';

export default combineReducers({
  common,
  thankYou,
  reportDriver,
});