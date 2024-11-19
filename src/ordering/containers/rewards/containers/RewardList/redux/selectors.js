import { createSelector } from 'reselect';
import { PROMO_VOUCHER_STATUS } from '../../../../../../common/utils/constants';
import { getPrice } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  getRemainingRewardExpiredDays,
  getFormatDiscountValue,
  getExpiringDaysI18n,
} from '../../../../../../common/utils/rewards';
import { getLoadRewardListRequestData } from '../../../../../../redux/modules/rewards/selectors';
import { getMerchantCountry, getBusinessCurrency, getBusinessLocale } from '../../../../../redux/modules/app';

export const getSearchKeyword = state => state.rewardList.searchKeyword;

export const getRewardList = createSelector(
  getLoadRewardListRequestData,
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  (loadRewardListRequestData, merchantCountry, businessCurrency, businessLocale) =>
    loadRewardListRequestData.map(rewardItem => {
      const {
        id,
        uniquePromotionCodeId,
        type,
        discountType,
        discountValue,
        name,
        validTo,
        status,
        minSpendAmount,
      } = rewardItem;
      const value = getFormatDiscountValue(discountType, discountValue, {
        locale: businessLocale,
        currency: businessCurrency,
        country: merchantCountry,
      });
      const remainingExpiredDays = getRemainingRewardExpiredDays(validTo);
      const isUnavailable = [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(status);
      const expiringDateI18n = validTo
        ? {
            i18nKey: 'PromoValidUntil',
            params: { date: formatTimeToDateString(merchantCountry, validTo) },
          }
        : null;
      const expiringDaysI18n = getExpiringDaysI18n(remainingExpiredDays);
      const minSpendI18n = minSpendAmount
        ? {
            i18nKey: 'MinConsumption',
            params: {
              amount: getPrice(minSpendAmount, {
                locale: businessLocale,
                currency: businessCurrency,
                country: merchantCountry,
              }),
            },
          }
        : null;

      return {
        id,
        uniquePromotionCodeId,
        key: `${id}-${uniquePromotionCodeId}-${type}`,
        value,
        name,
        expiringDateI18n,
        expiringDaysI18n,
        status,
        isUnavailable,
        minSpendI18n,
      };
    })
);
