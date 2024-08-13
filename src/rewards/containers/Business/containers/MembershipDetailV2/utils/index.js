import { CLAIMED_CASHBACK_STATUS, CLAIMED_POINTS_STATUS, CLAIMED_TRANSACTION_STATUS } from '../../../utils/constants';
import { NEW_MEMBER_TYPES } from './constants';

export const getReceiptOrderRewardsStatusCategories = ({ pointsStatus, cashbackStatus, transactionStatus }) => {
  const transactionStatusCategories = {
    [CLAIMED_TRANSACTION_STATUS.FAILED_CANCELLED_OR_REFUND]:
      NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION,
    [CLAIMED_TRANSACTION_STATUS.FAILED_ORDER_NOTFOUND]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION,
    [CLAIMED_TRANSACTION_STATUS.FAILED_EXPIRED]: NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_EXPIRED,
  };
  const isCashbackEarned = [
    CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME,
    CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME,
  ].includes(cashbackStatus);
  const isPointsEarned = pointsStatus === CLAIMED_POINTS_STATUS.CLAIMED;
  const categories = {
    cashback: null,
    points: null,
  };

  if (transactionStatus !== CLAIMED_TRANSACTION_STATUS.SUCCESS) {
    return transactionStatusCategories[transactionStatus];
  }

  if (isCashbackEarned && isPointsEarned) {
    return NEW_MEMBER_TYPES.RECEIPT_EARNED_POINTS_CASHBACK;
  }

  if (
    pointsStatus === CLAIMED_POINTS_STATUS.CLAIMED_SOMEONE_ELSE &&
    cashbackStatus === CLAIMED_CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE
  ) {
    return NEW_MEMBER_TYPES.RECEIPT_CLAIMED_SOME_ELSE;
  }

  if (
    pointsStatus === CLAIMED_POINTS_STATUS.NOT_CLAIMED_REACH_LIMIT &&
    cashbackStatus === CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_LIMIT
  ) {
    return NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_REACH_LIMIT;
  }

  if (
    pointsStatus === CLAIMED_POINTS_STATUS.CLAIMED_REPEAT &&
    cashbackStatus === CLAIMED_CASHBACK_STATUS.CLAIMED_REPEAT
  ) {
    return NEW_MEMBER_TYPES.RECEIPT_CLAIMED_REPEAT;
  }

  if (pointsStatus === CLAIMED_POINTS_STATUS.NOT_CLAIMED && cashbackStatus === CLAIMED_CASHBACK_STATUS.NOT_CLAIMED) {
    return NEW_MEMBER_TYPES.RECEIPT_NOT_CLAIMED_DEFAULT;
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
