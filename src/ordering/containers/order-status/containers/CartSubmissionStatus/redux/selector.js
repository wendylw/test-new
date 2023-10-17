import { createSelector } from 'reselect';
import { getBusinessInfo } from '../../../../../redux/modules/app';
import Utils from '../../../../../../utils/utils';

export const getCleverTapAttributes = createSelector(getBusinessInfo, businessInfo => {
  const { defaultLoyaltyRatio, enableCashback, stores, country } = businessInfo || {};
  const { id, name } = (stores && stores[0]) || {};

  const cashbackRate = defaultLoyaltyRatio ? Math.floor((1 / defaultLoyaltyRatio) * 100) / 100 : 0;
  const shippingType = Utils.getOrderTypeFromUrl() || 'unknown';

  const res = {
    'store name': name,
    'store id': id,
    'shipping type': shippingType,
    country,
  };

  if (enableCashback) {
    res.cashback = cashbackRate;
  }

  return res;
});
