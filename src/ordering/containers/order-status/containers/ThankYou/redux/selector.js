import _get from 'lodash/get';
import { createSelector } from 'reselect';
import Constants from '../../../../../../utils/constants';
import { CASHBACK_CAN_CLAIM } from '../constants';
import {
  getOrder,
  getOrderStatus,
  getIsOnDemandOrder,
  getIsUseStorehubLogistics,
  getOrderShippingType,
  getTimeoutLookingForRider,
  getOrderOriginalShippingType,
  getOrderStoreInfo,
} from '../../../redux/selector';
import {
  getIsSafari,
  getMerchantCountry,
  getBusinessInfo,
  getUserIsLogin,
  getIsQROrderingLoginFree,
  getOnlineStoreInfo,
} from '../../../../../redux/modules/app';

const { ORDER_STATUS, DELIVERY_METHOD } = Constants;

export const getStoreHashCode = state => state.orderStatus.thankYou.storeHashCode;

export const getCashbackInfo = state => state.orderStatus.thankYou.cashbackInfo;

export const getOrderCancellationReasonAsideVisible = state =>
  state.orderStatus.thankYou.orderCancellationReasonAsideVisible;

export const getOrderCancellationButtonVisible = createSelector(
  getMerchantCountry,
  getOrderStatus,
  getOrderShippingType,
  getIsOnDemandOrder,
  getIsUseStorehubLogistics,
  (merchantCountry, orderStatus, shippingType, isOnDemandOrder, isUseStorehubLogistics) =>
    // only support MY for now
    merchantCountry === 'MY' &&
    isOnDemandOrder &&
    shippingType === DELIVERY_METHOD.DELIVERY &&
    isUseStorehubLogistics &&
    [
      ORDER_STATUS.PAID,
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.LOGISTICS_CONFIRMED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PICKED_UP,
    ].includes(orderStatus)
);

export const getDeliveryUpdatableToSelfPickupState = createSelector(
  getTimeoutLookingForRider,
  timeoutLookingForRider => timeoutLookingForRider
);

export const getDeliverySwitchedToSelfPickupState = createSelector(
  getOrderShippingType,
  getOrderOriginalShippingType,
  (shippingType, originalShippingType) =>
    originalShippingType && shippingType === DELIVERY_METHOD.PICKUP && originalShippingType === DELIVERY_METHOD.DELIVERY
);

export const getOrderStoreName = createSelector(getOrderStoreInfo, storeInfo => _get(storeInfo, 'name', ''));

export const getOrderPaymentMethod = createSelector(getOrder, order => _get(order, 'paymentMethod', ''));

export const getCancelOrderStatus = state => state.orderStatus.thankYou.cancelOrderStatus;

export const getshowProfileVisibility = state => state.orderStatus.thankYou.profileModalVisibility;

export const getUpdateShippingTypePendingStatus = state =>
  state.orderStatus.thankYou.updateShippingTypeStatus === 'pending';

export const getOrderDeliveryInfo = createSelector(getOrder, order => {
  if (!order) {
    return null;
  }

  const { expectDeliveryDateFrom, expectDeliveryDateTo, deliveryInformation } = order;
  const responseDeliveryInformation = deliveryInformation && deliveryInformation[0] ? deliveryInformation[0] : {};

  return {
    expectDeliveryDateRange: [expectDeliveryDateFrom, expectDeliveryDateTo],
    ...responseDeliveryInformation,
  };
});

export const getCashback = createSelector(getCashbackInfo, ({ cashback }) => (Number(cashback) ? Number(cashback) : 0));

export const getCashbackCurrency = createSelector(
  getCashback,
  getIsSafari,
  getOnlineStoreInfo,
  (cashback, isSafari, onlineStoreInfo) => {
    const { locale, currency, country } = onlineStoreInfo || {};
    if (!(locale && currency)) return `RM ${cashback}`;
    const money = Intl.NumberFormat(locale, { style: 'currency', currency }).format(parseFloat(cashback));
    return country === 'MY' && isSafari ? money.replace(/^(\D+)/, '$1 ') : money;
  }
);

export const getCanCashbackClaim = createSelector(
  getCashbackInfo,
  cashbackInfo => cashbackInfo.status === CASHBACK_CAN_CLAIM
);

export const getIsCashbackAvailable = createSelector(getCashback, getBusinessInfo, (cashback, businessInfo) => {
  const { enableCashback } = businessInfo || {};
  const hasCashback = !!cashback;
  return enableCashback && hasCashback;
});

export const getHasCashbackClaimed = createSelector(
  getCanCashbackClaim,
  getIsCashbackAvailable,
  (canCashbackClaim, isCashbackAvailable) => isCashbackAvailable && !canCashbackClaim
);

export const getIsCashbackClaimable = createSelector(
  getUserIsLogin,
  getCanCashbackClaim,
  (isLogin, canCashbackClaim) => isLogin && canCashbackClaim
);

export const getShouldShowCashbackBanner = createSelector(
  getUserIsLogin,
  getHasCashbackClaimed,
  getIsQROrderingLoginFree,
  (isLogin, hasCashbackClaimed, isQROrderingLoginFree) => !isLogin && isQROrderingLoginFree && !hasCashbackClaimed
);

export const getShouldShowCashbackCard = createSelector(
  getShouldShowCashbackBanner,
  getIsCashbackAvailable,
  (shouldShowCashbackBanner, isCashbackAvailable) => !shouldShowCashbackBanner && isCashbackAvailable
);
