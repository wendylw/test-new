import { createSelector } from 'reselect';
import {
  CLAIM_CASHBACK_STATUS_QUERY_NAME,
  CLAIM_CASHBACK_VALUE_QUERY_NAME,
  BECOME_MERCHANT_MEMBER_METHODS,
  PROMO_VOUCHER_DISCOUNT_TYPES,
  PROMO_VOUCHER_STATUS,
  MEMBER_LEVELS,
  MEMBER_CARD_COLOR_PALETTES,
} from '../../../../../../common/utils/constants';
import { getPrice, getQueryString } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  I18N_PARAM_KEYS,
  NEW_MEMBER_TYPES,
  NEW_MEMBER_CASHBACK_STATUS_TYPES,
  NEW_MEMBER_I18N_KEYS,
  RETURNING_MEMBER_TYPES,
  RETURNING_MEMBER_CASHBACK_STATUS_TYPES,
  RETURNING_MEMBER_I18N_KEYS,
} from '../utils/constants';
import { getSource, getIsWebview } from '../../../../../redux/modules/common/selectors';
import {
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
} from '../../../../../../redux/modules/merchant/selectors';
import {
  getCustomerCashback,
  getCustomerTierLevel,
  getIsLoadCustomerRequestCompleted,
} from '../../../../../redux/modules/customer/selectors';

export const getOrderReceiptClaimedCashbackStatus = () => getQueryString(CLAIM_CASHBACK_STATUS_QUERY_NAME);

export const getOrderReceiptClaimedCashbackValue = () => getQueryString(CLAIM_CASHBACK_VALUE_QUERY_NAME);

export const getLoadUniquePromoListData = state =>
  state.business.membershipDetail.loadUniquePromoListRequest.data || [];

export const getLoadUniquePromoListStatus = state => state.business.membershipDetail.loadUniquePromoListRequest.status;

export const getLoadUniquePromoListError = state => state.business.membershipDetail.loadUniquePromoListRequest.error;

/**
 * Derived selectors
 */
export const getCustomerCashbackPrice = createSelector(
  getCustomerCashback,
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
  (cashback, locale, currency, country) => getPrice(cashback, { locale, currency, country })
);

export const getIsFromEarnedCashbackQRScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN
);

export const getIsFromJoinMembershipUrlClick = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK
);

export const getIsFromSeamlessLoyaltyQrScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN
);

export const getIsUserFromOrdering = createSelector(getSource, source =>
  [BECOME_MERCHANT_MEMBER_METHODS.THANK_YOU_CASHBACK_CLICK].includes(source)
);

export const getIsFromEarnedCashbackQrScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN
);

export const getIsOrderAndRedeemButtonDisplay = createSelector(
  getIsMerchantEnabledOROrdering,
  getIsMerchantEnabledDelivery,
  getIsUserFromOrdering,
  (isOROrderingEnabled, isDeliveryEnabled, isUserFromOrdering) =>
    !isUserFromOrdering && isOROrderingEnabled && isDeliveryEnabled
);

export const getUniquePromoList = createSelector(
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  getLoadUniquePromoListData,
  (merchantCurrency, merchantLocale, merchantCountry, uniquePromoList) =>
    uniquePromoList.map(promo => {
      if (!promo) {
        return promo;
      }

      const { id, discountType, discountValue, name, validTo, status, minSpendAmount } = promo;

      return {
        id,
        value:
          discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
            ? `${discountValue}%`
            : getPrice(discountValue, { locale: merchantLocale, currency: merchantCurrency, country: merchantCountry }),
        name,
        status,
        limitations: [
          minSpendAmount && {
            key: `unique-promo-${id}-limitation-0`,
            i18nKey: 'MinConsumption',
            params: {
              amount: getPrice(minSpendAmount, {
                locale: merchantLocale,
                currency: merchantCurrency,
                country: merchantCountry,
              }),
            },
          },
          validTo && {
            key: `unique-promo-${id}-limitation-1`,
            i18nKey: 'ValidUntil',
            params: { date: formatTimeToDateString(merchantCountry, validTo) },
          },
        ].filter(limitation => Boolean(limitation)),
        isUnavailable: [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(status),
      };
    })
);

export const getNewMemberPromptCategory = createSelector(
  getIsLoadCustomerRequestCompleted,
  getIsMerchantEnabledCashback,
  getCustomerCashback,
  getOrderReceiptClaimedCashbackStatus,
  getIsFromSeamlessLoyaltyQrScan,
  getIsFromJoinMembershipUrlClick,
  getIsFromEarnedCashbackQrScan,
  (
    isLoadCustomerRequestCompleted,
    isMerchantEnabledCashback,
    customerCashback,
    claimedCashbackStatus,
    isFromSeamlessLoyaltyQrScan,
    isFromJoinMembershipUrlClick,
    isFromEarnedCashbackQrScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan && isLoadCustomerRequestCompleted) {
      return isMerchantEnabledCashback && customerCashback > 0
        ? NEW_MEMBER_TYPES.REDEEM_CASHBACK
        : NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromEarnedCashbackQrScan) {
      const claimedCashbackTypeKey = NEW_MEMBER_CASHBACK_STATUS_TYPES[claimedCashbackStatus];

      return NEW_MEMBER_TYPES[claimedCashbackTypeKey] || NEW_MEMBER_TYPES.DEFAULT;
    }

    // WB-6499: show default new member prompt.
    return NEW_MEMBER_TYPES.DEFAULT;
  }
);

export const getNewMemberTitleIn18nParams = createSelector(
  getOrderReceiptClaimedCashbackValue,
  getNewMemberPromptCategory,
  (claimedCashbackValue, newMemberPromptCategory) => {
    const { titleI18nParamsKeys } = NEW_MEMBER_I18N_KEYS[newMemberPromptCategory];
    const newMemberTitleI18nParams = {};

    if (!titleI18nParamsKeys) {
      return null;
    }

    titleI18nParamsKeys.forEach(paramKey => {
      if (paramKey === I18N_PARAM_KEYS.CASHBACK_VALUE) {
        newMemberTitleI18nParams[paramKey] = claimedCashbackValue;
      }
    });

    return newMemberTitleI18nParams;
  }
);

export const getReturningMemberPromptCategory = createSelector(
  getIsLoadCustomerRequestCompleted,
  getIsMerchantEnabledCashback,
  getCustomerCashback,
  getOrderReceiptClaimedCashbackStatus,
  getIsFromJoinMembershipUrlClick,
  getIsFromSeamlessLoyaltyQrScan,
  getIsFromEarnedCashbackQrScan,
  (
    isLoadCustomerRequestCompleted,
    isMerchantEnabledCashback,
    customerCashback,
    claimedCashbackStatus,
    isFromJoinMembershipUrlClick,
    isFromSeamlessLoyaltyQrScan,
    isFromEarnedCashbackQrScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return RETURNING_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan && isLoadCustomerRequestCompleted) {
      return isMerchantEnabledCashback && customerCashback > 0
        ? RETURNING_MEMBER_TYPES.REDEEM_CASHBACK
        : RETURNING_MEMBER_TYPES.THANKS_COMING_BACK;
    }

    if (isFromEarnedCashbackQrScan) {
      const claimedCashbackTypeKey = RETURNING_MEMBER_CASHBACK_STATUS_TYPES[claimedCashbackStatus];

      return RETURNING_MEMBER_TYPES[claimedCashbackTypeKey] || RETURNING_MEMBER_TYPES.DEFAULT;
    }

    return null;
  }
);

export const getReturningMemberTitleIn18nParams = createSelector(
  getOrderReceiptClaimedCashbackValue,
  getReturningMemberPromptCategory,
  (claimedCashbackValue, returningMemberPromptCategory) => {
    const { titleI18nParamsKeys } = RETURNING_MEMBER_I18N_KEYS[returningMemberPromptCategory];
    const returningMemberTitleI18nParams = {};

    if (!titleI18nParamsKeys) {
      return null;
    }

    titleI18nParamsKeys.forEach(paramKey => {
      if (paramKey === I18N_PARAM_KEYS.CASHBACK_VALUE) {
        returningMemberTitleI18nParams[paramKey] = claimedCashbackValue;
      }
    });

    return returningMemberTitleI18nParams;
  }
);

export const getShouldShowBackButton = createSelector(
  getIsWebview,
  getIsUserFromOrdering,
  (isInWebview, isUserFromOrdering) => isInWebview || isUserFromOrdering
);

// If the level is not by design, use member style by default.
export const getMemberColorPalettes = createSelector(
  getCustomerTierLevel,
  customerTierLevel => MEMBER_CARD_COLOR_PALETTES[customerTierLevel] || MEMBER_CARD_COLOR_PALETTES[MEMBER_LEVELS.MEMBER]
);

export const getMemberCardStyles = createSelector(getMemberColorPalettes, memberCardColorPalettes => ({
  color: memberCardColorPalettes.font,
  background: `linear-gradient(105deg, ${memberCardColorPalettes.background.startColor} 0%, ${memberCardColorPalettes.background.midColor} 50%,${memberCardColorPalettes.background.endColor} 100%)`,
}));

export const getMemberCardIconColors = createSelector(getMemberColorPalettes, memberCardColorPalettes => ({
  crownStartColor: memberCardColorPalettes.icon.crown.startColor,
  crownEndColor: memberCardColorPalettes.icon.crown.endColor,
  backgroundStartColor: memberCardColorPalettes.icon.background.startColor,
  backgroundEndColor: memberCardColorPalettes.icon.background.endColor,
}));
