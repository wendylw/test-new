import { combineReducers } from 'redux';
import common from './common';
import membershipForm from '../containers/MembershipForm/redux';
import membershipDetail from '../containers/MembershipDetail/redux';
import claimUniquePromo from '../containers/ClaimUniquePromo/redux';

export default combineReducers({
  common,
  membershipForm,
  membershipDetail,
  claimUniquePromo,
});
