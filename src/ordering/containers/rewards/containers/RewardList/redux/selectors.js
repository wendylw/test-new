import { createSelector } from 'reselect';
import i18next from 'i18next';
import { PROMO_VOUCHER_STATUS, REWARDS_TYPE } from '../../../../../../common/utils/constants';
import {
  REWARD_APPLIED_CODE_ERRORS_I18N_KEYS,
  REWARD_APPLIED_ERROR_I8NS,
  REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS,
  WEEK_DAYS_MAPPING,
} from '../../../../../../common/utils/rewards/constants';
import { getPrice } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  getRemainingRewardExpiredDays,
  getFormatDiscountValue,
  getExpiringDaysI18n,
} from '../../../../../../common/utils/rewards';
import {
  getLoadRewardListRequestData,
  getApplyPromoRequestError,
  getApplyVoucherRequestError,
  getApplyPayLaterPromoRequestError,
  getApplyPayLaterVoucherRequestError,
  getIsLoadRewardListRequestCompleted,
  getIsLoadRewardListRequestPending,
} from '../../../../../../redux/modules/rewards/selectors';
import {
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  getEnablePayLater,
} from '../../../../../redux/modules/app';
import { getIsApplyRewardPending } from '../../../redux/selectors';

export const getIsSearchBoxEmpty = state => state.rewardList.searchBox.isEmpty;

export const getSearchBoxError = state => state.rewardList.searchBox.error;

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

export const getIsApplyButtonDisabled = createSelector(
  getSelectedRewardId,
  getSelectedRewardUniquePromotionCodeId,
  getSelectedRewardCode,
  getIsApplyRewardPending,
  (selectedRewardId, selectedRewardUniquePromotionCodeId, selectedRewardCode, isApplyRewardPending) =>
    !selectedRewardId || !selectedRewardUniquePromotionCodeId || !selectedRewardCode || isApplyRewardPending
);

export const getIsSelectedVoucher = createSelector(
  getSelectedRewardType,
  selectedRewardType => selectedRewardType === REWARDS_TYPE.VOUCHER
);

export const getApplyRewardError = createSelector(
  getEnablePayLater,
  getSearchBoxError,
  getApplyPromoRequestError,
  getApplyVoucherRequestError,
  getApplyPayLaterPromoRequestError,
  getApplyPayLaterVoucherRequestError,
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  (
    enablePayLater,
    searchBoxError,
    applyPromoRequestError,
    applyVoucherRequestError,
    applyPayLaterPromoRequestError,
    applyPayLaterVoucherRequestError,
    merchantCountry,
    businessCurrency,
    businessLocale
  ) => {
    if (searchBoxError) {
      return i18next.t(`OrderingPromotion:${REWARD_APPLIED_CODE_ERRORS_I18N_KEYS[searchBoxError]}`);
    }

    if (
      !applyPromoRequestError &&
      !applyVoucherRequestError &&
      !applyPayLaterPromoRequestError &&
      !applyPayLaterVoucherRequestError
    ) {
      return null;
    }

    const { code, extraInfo } = enablePayLater
      ? applyPayLaterPromoRequestError || applyPayLaterVoucherRequestError
      : applyPromoRequestError || applyVoucherRequestError;
    const {
      validDays = [],
      validTimeFrom = '',
      validTimeTo = '',
      supportedChannel,
      minSubtotalConsumingPromo,
      appliedClientTypes,
    } = extraInfo || {};

    if (REWARD_APPLIED_ERROR_I8NS[code]) {
      const { i18nKey, i18nParamKeys } = REWARD_APPLIED_ERROR_I8NS[code];
      let params = null;

      if (i18nParamKeys) {
        params = {};
        i18nParamKeys.forEach(key => {
          switch (key) {
            case REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.VALID_DAYS_STRING:
              params[REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.VALID_DAYS_STRING] = validDays
                .map(weekDay => i18next.t(WEEK_DAYS_MAPPING[weekDay]))
                .join(',');
              break;
            case REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.VALID_TIME_FROM:
              params[REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.VALID_TIME_FROM] = validTimeFrom;
              break;
            case REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.VALID_TIME_TO:
              params[REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.VALID_TIME_TO] = validTimeTo;
              break;
            case REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.SUPPORTED_CHANNEL:
              params[REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.SUPPORTED_CHANNEL] = supportedChannel;
              break;
            case REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.MIN_SUBTOTAL_CONSUMING_PROMO:
              params[REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.MIN_SUBTOTAL_CONSUMING_PROMO] = getPrice(
                minSubtotalConsumingPromo,
                {
                  country: merchantCountry,
                  currency: businessCurrency,
                  locale: businessLocale,
                }
              );
              break;
            case REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.SUPPORT_CLIENT:
              params[REWARD_APPLIED_ERROR_I8NS_PARAMS_KEYS.SUPPORT_CLIENT] = (appliedClientTypes || [])
                .map(type => i18next.t(type))
                .join('/');
              break;
            default:
              break;
          }
        });
      }

      return params
        ? i18next.t(`OrderingPromotion:${i18nKey}`)
        : i18next.t(`OrderingPromotion:${i18nKey}`, i18nParamKeys);
    }

    return i18next.t('OrderingPromotion:PromoInvalid');
  }
);

export const getIsCustomerEmptyReward = createSelector(
  getIsSearchBoxEmpty,
  getRewardList,
  getIsLoadRewardListRequestCompleted,
  (isSearchBoxEmpty, rewardList, isLoadRewardListRequestCompleted) =>
    isSearchBoxEmpty && rewardList.length === 0 && isLoadRewardListRequestCompleted
);

export const getIsSearchEmptyReward = createSelector(
  getIsSearchBoxEmpty,
  getRewardList,
  getIsLoadRewardListRequestCompleted,
  (isSearchBoxEmpty, rewardList, isLoadRewardListRequestCompleted) =>
    !isSearchBoxEmpty && rewardList.length === 0 && isLoadRewardListRequestCompleted
);

export const getIsRewardListSearching = createSelector(
  getIsSearchBoxEmpty,
  getIsLoadRewardListRequestPending,
  (isSearchBoxEmpty, isLoadRewardListRequestPending) => !isSearchBoxEmpty && isLoadRewardListRequestPending
);
