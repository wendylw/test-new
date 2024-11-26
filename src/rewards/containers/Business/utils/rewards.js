import _isInteger from 'lodash/isInteger';
import { PROMO_VOUCHER_DISCOUNT_TYPES } from '../../../../common/utils/constants';
import { getPrice } from '../../../../common/utils';
import { DEFAULT_NEAR_EXPIRY_DAYS } from './constants';
import { getDifferenceTodayInDays } from '../../../../utils/datetime-lib';

export const getFormatDiscountValue = (discountType, discountValue, { locale, currency, country }) =>
  discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
    ? `${discountValue}%`
    : getPrice(discountValue, { locale, currency, country });

export const getRemainingRewardExpiredDays = (validTo, nearExpiryDays = DEFAULT_NEAR_EXPIRY_DAYS) => {
  if (!validTo) {
    return {};
  }

  const diffDays = getDifferenceTodayInDays(new Date(validTo));
  const remainingExpiredDays = diffDays > -nearExpiryDays && diffDays <= 0 ? Math.floor(Math.abs(diffDays)) : null;

  return remainingExpiredDays;
};

export const getExpiringDaysI18n = remainingExpiredDays => {
  const isTodayExpired = remainingExpiredDays === 0;

  return _isInteger(remainingExpiredDays)
    ? {
        value: remainingExpiredDays,
        i18nKey: isTodayExpired ? 'ExpiringToday' : 'ExpiringInDays',
        params: !isTodayExpired && { remainingExpiredDays },
      }
    : null;
};
