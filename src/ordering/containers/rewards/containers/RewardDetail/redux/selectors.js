import { createSelector } from 'reselect';
import { getQueryString, getPrice } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  getFormatDiscountValue,
  getRemainingRewardExpiredDays,
  getExpiringDaysI18n,
} from '../../../../../../common/utils/rewards';
import {
  getRewardDetailDiscountValue,
  getRewardDetailDiscountType,
  getRewardDetailValidTo,
  getRewardDetailMinSpendAmount,
  getRewardDetailStatus,
} from '../../../../../../redux/modules/rewards/selectors';
import { getMerchantCountry, getBusinessCurrency, getBusinessLocale } from '../../../../../redux/modules/app';
import { PROMO_VOUCHER_STATUS } from '../../../../../../common/utils/constants';

export const getRewardId = () => getQueryString('id');

export const getRewardUniquePromotionCodeId = () => getQueryString('up_id');

export const getRewardType = () => getQueryString('up_type');

/**
 * Derived selectors
 */
export const getRewardFormatDiscountValue = createSelector(
  getRewardDetailDiscountValue,
  getRewardDetailDiscountType,
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  (rewardDetailDiscountValue, rewardDetailDiscountType, merchantCountry, businessCurrency, businessLocale) =>
    getFormatDiscountValue(rewardDetailDiscountType, rewardDetailDiscountValue, {
      country: merchantCountry,
      currency: businessCurrency,
      locale: businessLocale,
    })
);

export const getRewardLimitations = createSelector(
  getRewardDetailValidTo,
  getRewardDetailMinSpendAmount,
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  (rewardDetailValidTo, rewardDetailMinSpendAmount, merchantCountry, businessCurrency, businessLocale) => {
    const limitations = [];

    if (rewardDetailMinSpendAmount) {
      limitations.push({
        key: 'rewardDetail-minConsumption',
        i18nKey: 'MinConsumption',
        params: {
          amount: getPrice(rewardDetailMinSpendAmount, {
            country: merchantCountry,
            currency: businessCurrency,
            locale: businessLocale,
          }),
        },
      });
    }

    if (rewardDetailValidTo) {
      limitations.push({
        key: 'rewardDetail-expiringDate',
        i18nKey: 'PromoValidUntil',
        params: { date: formatTimeToDateString(merchantCountry, rewardDetailValidTo) },
      });
    }

    return limitations;
  }
);

export const getIsRewardDetailUnAvailable = createSelector(getRewardDetailStatus, rewardDetailStatus =>
  [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(rewardDetailStatus)
);

export const getRewardDetailExpiringDaysI18n = createSelector(getRewardDetailValidTo, rewardDetailValidTo => {
  const remainingRewardExpiredDays = getRemainingRewardExpiredDays(rewardDetailValidTo);

  return getExpiringDaysI18n(remainingRewardExpiredDays);
});
