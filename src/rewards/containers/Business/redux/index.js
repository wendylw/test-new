import { combineReducers } from 'redux';
import common from './common';
import membershipForm from '../containers/MembershipForm/redux';

export default combineReducers({
  common,
  membershipForm,
});
