import { PROMO_VOUCHER_DISCOUNT_TYPES } from '../../../../common/utils/constants';
import { getPrice } from '../../../../common/utils';

export const getDiscountValue = (discountType, discountValue, { locale, currency, country }) =>
  discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
    ? `${discountValue}%`
    : getPrice(discountValue, { locale, currency, country });
