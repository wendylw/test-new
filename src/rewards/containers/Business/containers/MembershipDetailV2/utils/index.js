import { CLAIMED_CASHBACK_STATUS, CLAIMED_POINTS_STATUS } from '../../../utils/constants';
import { NEW_MEMBER_TYPES } from './constants';

export const getReceiptOrderRewardsStatusCategories = ({
  claimOrderRewardsPointsStatus,
  claimOrderRewardsCashbackStatus,
}) => {
  const isCashbackEarned = [
    CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME,
    CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME,
  ].includes(claimOrderRewardsCashbackStatus);
  const isPointsEarned = claimOrderRewardsPointsStatus === CLAIMED_POINTS_STATUS.CLAIMED;
  const categories = [];

  if (isCashbackEarned && isPointsEarned) {
    return [NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS_CASHBACK];
  }

  if (isCashbackEarned) {
    categories.push(NEW_MEMBER_TYPES.RECEIPT_EARNED_CASHBACK);
  }

  if (isPointsEarned) {
    categories.push(NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS);
  }

  switch (claimOrderRewardsPointsStatus) {
    case value:
      break;

    default:
      break;
  }

  switch (claimOrderRewardsCashbackStatus) {
    case CLAIMED_POINTS_STATUS.CLAIMED_SOMEONE_ELSE:
      categories.push(NEW_MEMBER_TYPES.RECEIPT_CLAIMED_SOME_ELSE);
      break;
    case CLAIMED_POINTS_STATUS.NOT_CLAIMED_EXPIRED:
      categories.push(NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_EXPIRED);
      break;
    case CLAIMED_POINTS_STATUS.CLAIMED_REPEAT:
      categories.push(NEW_MEMBER_TYPES.RECEIPT_CLAIMED_REPEAT);
      break;
    case CLAIMED_POINTS_STATUS.NOT_CLAIMED_REACH_LIMIT:
      categories.push(NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_REACH_LIMIT);
      break;
    case CLAIMED_POINTS_STATUS.NOT_CLAIMED_CANCELLED:
      categories.push(NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION);
    case CLAIMED_POINTS_STATUS.NOT_CLAIMED:
      categories.push(NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT);
    default:
      break;
  }

  return categories;
};
