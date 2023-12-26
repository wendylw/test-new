import { combineReducers } from 'redux';
import common from './common';
import membershipForm from '../containers/MembershipForm/redux';
import membershipDetail from '../containers/MembershipDetail/redux';
import seamlessLoyalty from '../containers/SeamlessLoyalty/redux';

export default combineReducers({
  common,
  membershipForm,
  membershipDetail,
  seamlessLoyalty,
});
