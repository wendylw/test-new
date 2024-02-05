import { createSelector } from 'reselect';
import {
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
} from '../../../../../../redux/modules/merchant/selectors';

export const getIsOrderAndRedeemButtonDisplay = createSelector(
  getIsMerchantEnabledOROrdering,
  getIsMerchantEnabledDelivery,
  (isOROrderingEnabled, isDeliveryEnabled) => isOROrderingEnabled && isDeliveryEnabled
);
