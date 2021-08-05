import { combineReducers } from 'redux';
import common from './common';
import customerInfo from '../containers/CustomerInfo/redux';

export default combineReducers({
  common,
  customerInfo,
});
