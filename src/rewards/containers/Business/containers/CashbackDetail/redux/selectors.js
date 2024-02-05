import { createSelector } from 'reselect';
import { I18N_PARAM_KEYS, CLAIMED_CASHBACK_I18N_KEYS } from '../utils/constants';
import {
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
} from '../../../../../../redux/modules/merchant/selectors';
import { getOrderReceiptClaimedCashbackStatus, getOrderReceiptClaimedCashback } from '../../../redux/common/selectors';

export const getIsOrderAndRedeemButtonDisplay = createSelector(
  getIsMerchantEnabledOROrdering,
  getIsMerchantEnabledDelivery,
  (isOROrderingEnabled, isDeliveryEnabled) => isOROrderingEnabled && isDeliveryEnabled
);

export const getClaimedCashbackStatusTitleIn18nParams = createSelector(
  getOrderReceiptClaimedCashback,
  getOrderReceiptClaimedCashbackStatus,
  (claimedCashback, claimedCashbackStatus) => {
    const { titleI18nParamsKeys } = CLAIMED_CASHBACK_I18N_KEYS[claimedCashbackStatus] || {};
    const titleI18nParams = {};

    if (!titleI18nParamsKeys) {
      return null;
    }

    titleI18nParamsKeys.forEach(paramKey => {
      if (paramKey === I18N_PARAM_KEYS.CASHBACK_VALUE) {
        titleI18nParams[paramKey] = claimedCashback;
      }
    });

    return titleI18nParams;
  }
);
