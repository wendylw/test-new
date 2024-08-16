import { CLAIMED_CASHBACK_STATUS, CLAIMED_POINTS_STATUS, CLAIMED_TRANSACTION_STATUS } from '../../../utils/constants';
import { NEW_MEMBER_TYPES, RETURNING_MEMBER_TYPES, CLAIMED_ORDER_REWARD_NAMES } from './constants';

export const getReceiptOrderRewardsStatusCategories = ({
  pointsStatus,
  cashbackStatus,
  transactionStatus,
  isNewMember,
}) => {
  try {
    const types = isNewMember ? NEW_MEMBER_TYPES : RETURNING_MEMBER_TYPES;
    const transactionStatusCategories = {
      [CLAIMED_TRANSACTION_STATUS.FAILED_CANCELLED_OR_REFUND]: types.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION,
      [CLAIMED_TRANSACTION_STATUS.FAILED_ORDER_NOTFOUND]: types.RECEIPT_NOT_CLAIMED_CANCELLED_NO_TRANSACTION,
      [CLAIMED_TRANSACTION_STATUS.FAILED_EXPIRED]: types.RECEIPT_NOT_CLAIMED_EXPIRED,
      [CLAIMED_TRANSACTION_STATUS.FAILED_CUSTOMER_NOT_MATCH]: types.RECEIPT_CLAIMED_SOME_ELSE,
      [CLAIMED_TRANSACTION_STATUS.FAILED_BIND_CUSTOMER_FAILED]: types.RECEIPT_BIND_CUSTOMER_FAILED,
    };
    const pointsStatusCategories = {
      [CLAIMED_POINTS_STATUS.CLAIMED_SOMEONE_ELSE]: types.RECEIPT_CLAIMED_SOME_ELSE,
      [CLAIMED_POINTS_STATUS.NOT_CLAIMED_REACH_LIMIT]: types.RECEIPT_NOT_CLAIMED_REACH_LIMIT,
      [CLAIMED_POINTS_STATUS.CLAIMED_REPEAT]: types.RECEIPT_CLAIMED_REPEAT,
      [CLAIMED_POINTS_STATUS.FAILED]: types.RECEIPT_NOT_CLAIMED_DEFAULT,
    };
    const cashbackStatusCategories = {
      [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_LIMIT]: types.RECEIPT_NOT_CLAIMED_REACH_LIMIT,
      [CLAIMED_CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE]: types.RECEIPT_CLAIMED_SOME_ELSE,
      [CLAIMED_CASHBACK_STATUS.CLAIMED_REPEAT]: types.RECEIPT_CLAIMED_REPEAT,
      [CLAIMED_CASHBACK_STATUS.NOT_CLAIMED]: types.RECEIPT_NOT_CLAIMED_DEFAULT,
    };
    const isCashbackEarned = [
      CLAIMED_CASHBACK_STATUS.CLAIMED_FIRST_TIME,
      CLAIMED_CASHBACK_STATUS.CLAIMED_NOT_FIRST_TIME,
    ].includes(cashbackStatus);
    const isPointsEarned = pointsStatus === CLAIMED_POINTS_STATUS.SUCCESS;

    if (transactionStatus !== CLAIMED_TRANSACTION_STATUS.SUCCESS) {
      return transactionStatus && transactionStatusCategories[transactionStatus]
        ? [{ status: transactionStatusCategories[transactionStatus] }]
        : [];
    }

    if (isCashbackEarned && isPointsEarned) {
      return [{ status: types.RECEIPT_EARNED_POINTS_CASHBACK }];
    }

    if (
      pointsStatus === CLAIMED_POINTS_STATUS.CLAIMED_SOMEONE_ELSE &&
      cashbackStatus === CLAIMED_CASHBACK_STATUS.CLAIMED_SOMEONE_ELSE
    ) {
      return [{ status: types.RECEIPT_CLAIMED_SOME_ELSE }];
    }

    if (
      pointsStatus === CLAIMED_POINTS_STATUS.NOT_CLAIMED_REACH_LIMIT &&
      cashbackStatus === CLAIMED_CASHBACK_STATUS.NOT_CLAIMED_REACH_LIMIT
    ) {
      return [{ status: types.RECEIPT_NOT_CLAIMED_REACH_LIMIT }];
    }

    if (
      pointsStatus === CLAIMED_POINTS_STATUS.CLAIMED_REPEAT &&
      cashbackStatus === CLAIMED_CASHBACK_STATUS.CLAIMED_REPEAT
    ) {
      return [{ status: types.RECEIPT_CLAIMED_REPEAT }];
    }

    if (pointsStatus === CLAIMED_POINTS_STATUS.FAILED && cashbackStatus === CLAIMED_CASHBACK_STATUS.NOT_CLAIMED) {
      return [{ status: types.RECEIPT_NOT_CLAIMED_DEFAULT }];
    }

    const categories = [];

    categories.push({
      key: CLAIMED_ORDER_REWARD_NAMES.CASHBACK,
      status: isCashbackEarned ? types.RECEIPT_EARNED_CASHBACK : cashbackStatusCategories[cashbackStatus],
    });

    categories.push({
      key: CLAIMED_ORDER_REWARD_NAMES.POINTS,
      status: isPointsEarned ? types.RECEIPT_EARNED_POINTS : pointsStatusCategories[pointsStatus],
    });

    return categories;
  } catch (error) {
    return [];
  }
};
