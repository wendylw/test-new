import { createSelector } from 'reselect';
import { PROMO_VOUCHER_STATUS } from '../../../../../../common/utils/constants';
import { getFulfillDate, getPrice } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  getRemainingRewardExpiredDays,
  getFormatDiscountValue,
  getExpiringDaysI18n,
} from '../../../../../../common/utils/rewards';
import { getLoadRewardListRequestData } from '../../../../../../redux/modules/rewards/selectors';
import {
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  getBusinessUTCOffset,
} from '../../../../../redux/modules/app';

export const getApplyRewardFulfillDate = createSelector(getBusinessUTCOffset, businessUTCOffset =>
  getFulfillDate(businessUTCOffset)
);

export const getSelectedRewardId = state => state.rewardList.selectedReward.id;

export const getSelectedRewardUniquePromotionCodeId = state => state.rewardList.selectedReward.uniquePromotionCodeId;

export const getSelectedRewardCode = state => state.rewardList.selectedReward.code;

export const getSelectedRewardType = state => state.rewardList.selectedReward.type;

/*
 * Selectors derived from state
 */
export const getRewardList = createSelector(
  getLoadRewardListRequestData,
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  getSelectedRewardId,
  getSelectedRewardUniquePromotionCodeId,
  getSelectedRewardType,
  (
    loadRewardListRequestData,
    merchantCountry,
    businessCurrency,
    businessLocale,
    selectedRewardId,
    selectedRewardUniquePromotionCodeId,
    selectedRewardType
  ) =>
    loadRewardListRequestData.map(rewardItem => {
      const {
        id,
        uniquePromotionCodeId,
        code,
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
        code,
        type,
        key: `${id}-${uniquePromotionCodeId}-${type}`,
        value,
        name,
        expiringDateI18n,
        expiringDaysI18n,
        status,
        isUnavailable,
        minSpendI18n,
        isSelected:
          id === selectedRewardId &&
          uniquePromotionCodeId === selectedRewardUniquePromotionCodeId &&
          type === selectedRewardType,
      };
    })
);
