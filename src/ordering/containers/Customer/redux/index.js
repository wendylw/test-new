import { combineReducers } from 'redux';
import customerInfo from '../containers/CustomerInfo/redux';
import contactDetail from '../containers/ContactDetail/redux';
import addressDetail from '../containers/AddressDetail/redux';

export default combineReducers({
  customerInfo,
  contactDetail,
  addressDetail,
});
