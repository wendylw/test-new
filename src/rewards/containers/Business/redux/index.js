import { combineReducers } from 'redux';
import common from './common';
import membershipForm from '../containers/MembershipForm/redux';
import membershipDetail from '../containers/MembershipDetail/redux';
import pointsHistory from '../containers/PointsHistory/redux';
import cashbackHistory from '../containers/CashbackHistory/redux';
import claimUniquePromo from '../containers/ClaimUniquePromo/redux';
import seamlessLoyalty from '../containers/SeamlessLoyalty/redux';

export default combineReducers({
  common,
  membershipForm,
  membershipDetail,
  pointsHistory,
  cashbackHistory,
  claimUniquePromo,
  seamlessLoyalty,
});
