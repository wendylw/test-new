import { CLAIMED_CASHBACK_STATUS, CLAIMED_POINTS_STATUS } from '../../../utils/constants';
import { NEW_MEMBER_TYPES } from './constants';

export const getReceiptOrderRewardsEarnedStatus = ({
  claimOrderRewardsPointsStatus,
  claimOrderRewardsCashbackStatus,
}) => {
  const isCashbackEarned = [
    CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME,
    CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME,
  ].includes(claimOrderRewardsCashbackStatus);
  const isPointsEarned = claimOrderRewardsPointsStatus === CLAIMED_POINTS_STATUS.CLAIMED;

  return {
    isCashbackEarned,
    isPointsEarned,
  };
};

export const getReceiptOrderRewardsStatusCategories = ({
  claimOrderRewardsPointsStatus,
  claimOrderRewardsCashbackStatus,
}) => {
  const pointsStatus = {
    [CLAIMED_POINTS_STATUS.CLAIMED_SOMEONE_ELSE]: NEW_MEMBER_TYPES.CLAIMED_SOMEONE_ELSE,
    [CLAIMED_POINTS_STATUS.NOT_CLAIMED_EXPIRED]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_EXPIRED,
    [CLAIMED_POINTS_STATUS.CLAIMED_REPEAT]: NEW_MEMBER_TYPES.RECEIPT_CLAIMED_REPEAT,
    [CLAIMED_POINTS_STATUS.NOT_CLAIMED_REACH_LIMIT]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_REACH_LIMIT,
    [CLAIMED_POINTS_STATUS.NOT_CLAIMED_CANCELLED]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION,
    [CLAIMED_POINTS_STATUS.NOT_CLAIMED]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT,
  };
  const cashbackStatus = {
    [CLAIMED_CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE]: NEW_MEMBER_TYPES.RECEIPT_CLAIMED_SOME_ELSE,
    [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_EXPIRED]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_EXPIRED,
    [CLAIMED_CASHBACK_STATUS.CLAIMED_REPEAT]: NEW_MEMBER_TYPES.RECEIPT_CLAIMED_REPEAT,
    [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_LIMIT]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_REACH_LIMIT,
    [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_CANCELLED]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION,
    [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_NO_TRANSACTION]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION,
    [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_MERCHANT_LIMIT]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT,
    [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT,
  };
  const { isCashbackEarned, isPointsEarned } = getReceiptOrderRewardsEarnedStatus({
    claimOrderRewardsPointsStatus,
    claimOrderRewardsCashbackStatus,
  });
  const categories = {
    cashback: null,
    points: null,
  };

  if (isCashbackEarned && isPointsEarned) {
    return NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS_CASHBACK;
  }

  categories.cashback = {
    status: isCashbackEarned ? NEW_MEMBER_TYPES.RECEIPT_EARNED_CASHBACK : cashbackStatus[claimOrderRewardsPointsStatus],
    available: isCashbackEarned,
  };

  categories.points = {
    status: isPointsEarned ? NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS : pointsStatus[claimOrderRewardsCashbackStatus],
    available: isPointsEarned,
  };

  return categories;
};
