import { combineReducers } from 'redux';
import common from './common';
import customerInfo from '../containers/CustomerInfo/redux';
import contactDetail from '../containers/ContactDetail/redux';

export default combineReducers({
  common,
  customerInfo,
  contactDetail,
});
