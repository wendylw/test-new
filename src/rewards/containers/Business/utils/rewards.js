import { PROMO_VOUCHER_DISCOUNT_TYPES } from '../../../../common/utils/constants';
import { getPrice } from '../../../../common/utils';
import { getDifferenceTodayInDays } from '../../../../utils/datetime-lib';

export const getFormatDiscountValue = (discountType, discountValue, { locale, currency, country }) =>
  discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
    ? `${discountValue}%`
    : getPrice(discountValue, { locale, currency, country });

export const getRemainingRewardExpiredDaysInfo = validTo => {
  if (!validTo) {
    return {};
  }

  const diffDays = getDifferenceTodayInDays(new Date(validTo));
  const remainingExpiredDays = diffDays > -8 && diffDays <= 0 ? Math.floor(Math.abs(diffDays)) : null;
  const isTodayExpired = remainingExpiredDays === 0;

  return { remainingExpiredDays, isTodayExpired };
};
