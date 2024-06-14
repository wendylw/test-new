import { combineReducers } from 'redux';
import common from './common';
import membershipForm from '../containers/MembershipForm/redux';
import membershipDetail from '../containers/MembershipDetail/redux';
import membershipDetailV2 from '../containers/MembershipDetailV2/redux';
import pointsHistory from '../containers/PointsHistory/redux';
import cashbackCreditsHistory from '../containers/CashbackCreditsHistory/redux';
import claimUniquePromo from '../containers/ClaimUniquePromo/redux';
import seamlessLoyalty from '../containers/SeamlessLoyalty/redux';
import pointsRewards from '../containers/PointsRewardsPage/redux';

export default combineReducers({
  common,
  membershipForm,
  membershipDetail,
  membershipDetailV2,
  pointsHistory,
  cashbackCreditsHistory,
  claimUniquePromo,
  seamlessLoyalty,
  pointsRewards,
});
