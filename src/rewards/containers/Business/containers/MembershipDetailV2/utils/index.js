import { CLAIMED_CASHBACK_STATUS, CLAIMED_POINTS_STATUS } from '../../../utils/constants';
import { NEW_MEMBER_TYPES } from './constants';

export const getReceiptOrderRewardsStatus = ({ claimOrderRewardsPointsStatus, claimOrderRewardsCashbackStatus }) => {
  const isCashbackEarned = [
    CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME,
    CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME,
  ].includes(claimOrderRewardsCashbackStatus);
  const isPointsEarned = claimOrderRewardsPointsStatus === CLAIMED_POINTS_STATUS.CLAIMED;

  if (isCashbackEarned && isPointsEarned) {
    return NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS_CASHBACK;
  }

  if (isCashbackEarned) {
    return NEW_MEMBER_TYPES.RECEIPT_EARNED_CASHBACK;
  }

  if (isPointsEarned) {
    return NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS;
  }

  return null;
};
