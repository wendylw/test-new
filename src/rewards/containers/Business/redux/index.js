import { combineReducers } from 'redux';
import common from './common';
import membershipForm from '../containers/MembershipForm/redux';
import membershipDetailV2 from '../containers/MembershipDetailV2/redux';
import pointsHistory from '../containers/PointsHistory/redux';
import cashbackCreditsHistory from '../containers/CashbackCreditsHistory/redux';
import claimUniquePromo from '../containers/ClaimUniquePromo/redux';
import seamlessLoyalty from '../containers/SeamlessLoyalty/redux';
import uniquePromoDetail from '../containers/UniquePromoDetail/redux';
import pointsRewardDetail from '../containers/PointsRewardDetail/redux';

export default combineReducers({
  common,
  membershipForm,
  membershipDetailV2,
  pointsHistory,
  cashbackCreditsHistory,
  claimUniquePromo,
  seamlessLoyalty,
  uniquePromoDetail,
  pointsRewardDetail,
});
