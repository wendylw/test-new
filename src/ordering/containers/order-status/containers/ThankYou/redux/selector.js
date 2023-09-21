import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { createCurrencyFormatter } from '@storehub/frontend-utils';
import Constants, { API_REQUEST_STATUS, REFERRER_SOURCE_TYPES } from '../../../../../../utils/constants';
import {
  CASHBACK_CAN_CLAIM_STATUS_LIST,
  AFTER_PAID_STATUS_LIST,
  CASHBACK_CLAIMED_STATUS_LIST,
  REFERRERS_REQUIRING_PROFILE,
} from '../constants';
import {
  getOrder,
  getOrderStatus,
  getIsOnDemandOrder,
  getIsUseStorehubLogistics,
  getOrderShippingType,
  getTimeoutLookingForRider,
  getOrderOriginalShippingType,
  getOrderStoreInfo,
  getHasStoreReviewed,
  getIsStoreReviewable,
} from '../../../redux/selector';
import {
  getMerchantCountry,
  getBusinessInfo,
  getUserIsLogin,
  getOnlineStoreInfo,
  getAllowAnonymousQROrdering,
} from '../../../../../redux/modules/app';

const { ORDER_STATUS, DELIVERY_METHOD } = Constants;

export const getStoreHashCode = state => state.orderStatus.thankYou.storeHashCode;

export const getCashbackInfo = state => state.orderStatus.thankYou.cashbackInfo;

export const getRedirectFrom = state => state.orderStatus.thankYou.redirectFrom;

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

export const getCancelOrderError = state => state.orderStatus.thankYou.cancelOrderError;

export const getIsCancelOrderRequestRejected = createSelector(
  getCancelOrderStatus,
  cancelOrderStatus => cancelOrderStatus === API_REQUEST_STATUS.REJECTED
);

export const getCancelOrderRequestErrorMessage = createSelector(getCancelOrderError, cancelOrderError =>
  _get(cancelOrderError, 'message', '')
);

export const getShowProfileVisibility = state => state.orderStatus.thankYou.profileModalVisibility;

export const getUpdateShippingTypeStatus = state => state.orderStatus.thankYou.updateShippingTypeStatus;

export const getUpdateShippingTypeError = state => state.orderStatus.thankYou.updateShippingTypeError;

export const getUpdateShippingTypePendingStatus = createSelector(
  getUpdateShippingTypeStatus,
  updateShippingTypeStatus => updateShippingTypeStatus === API_REQUEST_STATUS.PENDING
);

export const getIsUpdateShippingTypeRequestRejected = createSelector(
  getUpdateShippingTypeStatus,
  updateShippingTypeStatus => updateShippingTypeStatus === API_REQUEST_STATUS.REJECTED
);

export const getUpdateShippingTypeRequestErrorMessage = createSelector(
  getUpdateShippingTypeError,
  updateShippingTypeError => _get(updateShippingTypeError, 'message', '')
);

export const getUpdateShippingTypeRequestErrorCategory = createSelector(
  getUpdateShippingTypeError,
  updateShippingTypeError => _get(updateShippingTypeError, 'name', '')
);

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

export const getIsPayLater = createSelector(getOrder, order => _get(order, 'isPayLater', false));

export const getHasOrderPaid = createSelector(getOrderStatus, orderStatus =>
  AFTER_PAID_STATUS_LIST.includes(orderStatus)
);

export const getCashback = createSelector(getCashbackInfo, ({ cashback }) => (Number(cashback) ? Number(cashback) : 0));

export const getCashbackCurrency = createSelector(getCashback, getOnlineStoreInfo, (cashback, onlineStoreInfo) => {
  const { currency } = onlineStoreInfo || {};
  const currencyFormatter = createCurrencyFormatter({ currencyCode: currency });
  return currencyFormatter.format(cashback);
});

export const getCashbackStatus = createSelector(getCashbackInfo, cashbackInfo => _get(cashbackInfo, 'status', null));

export const getCanCashbackClaim = createSelector(getCashbackStatus, cashbackStatus =>
  CASHBACK_CAN_CLAIM_STATUS_LIST.includes(cashbackStatus)
);

export const getHasCashback = createSelector(getCashback, cashback => cashback > 0);

export const getIsCashbackAvailable = createSelector(getHasCashback, getBusinessInfo, (hasCashback, businessInfo) => {
  const { enableCashback } = businessInfo || {};
  return enableCashback && hasCashback;
});

export const getHasCashbackClaimed = createSelector(
  getCashbackStatus,
  getHasCashback,
  (cashbackStatus, hasCashback) => CASHBACK_CLAIMED_STATUS_LIST.includes(cashbackStatus) && hasCashback
);

export const getIsCashbackClaimable = createSelector(
  getHasOrderPaid,
  getUserIsLogin,
  getCanCashbackClaim,
  (hasOrderPaid, isLogin, canCashbackClaim) => hasOrderPaid && isLogin && canCashbackClaim
);

export const getShouldShowCashbackBanner = createSelector(
  getUserIsLogin,
  getHasOrderPaid,
  getHasCashbackClaimed,
  getOrderShippingType,
  getAllowAnonymousQROrdering,
  getIsPayLater,
  (isLogin, hasOrderPaid, hasCashbackClaimed, orderShippingType, allowAnonymousQROrdering, isPayLater) =>
    hasOrderPaid &&
    !isLogin &&
    !hasCashbackClaimed &&
    // Only Dine In order will display the cashback banner
    orderShippingType === DELIVERY_METHOD.DINE_IN &&
    // Only the store support allowAnonymousQROrdering will display the cashback banner
    // The pay later order support allow Anonymous QR Ordering on default
    (allowAnonymousQROrdering || isPayLater)
);

export const getShouldShowCashbackCard = createSelector(
  getIsCashbackClaimable,
  getHasCashbackClaimed,
  (isCashbackClaimable, hasCashbackClaimed) => isCashbackClaimable || hasCashbackClaimed
);

export const getFoodCourtId = createSelector(getOrder, order => _get(order, 'foodCourtId', null));

export const getFoodCourtMerchantName = createSelector(getOrder, order => _get(order, 'foodCourtMerchantName', null));

export const getFoodCourtHashCode = state => state.orderStatus.thankYou.foodCourtInfo.hashCode;

export const getShouldShowStoreReviewCard = createSelector(
  getHasOrderPaid,
  getHasStoreReviewed,
  getIsStoreReviewable,
  (hasOrderPaid, hasReviewed, isReviewable) => hasOrderPaid && isReviewable && !hasReviewed
);

export const getIsInitProfilePageEnabled = createSelector(
  getRedirectFrom,
  getUserIsLogin,
  getHasOrderPaid,
  (redirectFrom, isLogin, hasOrderPaid) => {
    if (!isLogin) {
      return false;
    }

    if (REFERRERS_REQUIRING_PROFILE.includes(redirectFrom) && redirectFrom !== REFERRER_SOURCE_TYPES.PAY_AT_COUNTER) {
      return true;
    }

    if (hasOrderPaid && redirectFrom === REFERRER_SOURCE_TYPES.PAY_AT_COUNTER) {
      return true;
    }

    return false;
  }
);
