import { PROMO_VOUCHER_DISCOUNT_TYPES } from '../constants';
import { DEFAULT_NEAR_EXPIRY_DAYS } from './constants';
import { getPrice } from '..';
import { getDifferenceTodayInDays } from '../../../utils/datetime-lib';

export const getRemainingRewardExpiredDays = (validTo, nearExpiryDays = DEFAULT_NEAR_EXPIRY_DAYS) => {
  if (!validTo) {
    return {};
  }

  const diffDays = getDifferenceTodayInDays(new Date(validTo));
  const remainingExpiredDays = diffDays > -nearExpiryDays && diffDays <= 0 ? Math.floor(Math.abs(diffDays)) : null;

  return remainingExpiredDays;
};

export const getFormatDiscountValue = (discountType, discountValue, { locale, currency, country }) =>
  discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
    ? `${discountValue}%`
    : getPrice(discountValue, { locale, currency, country });
