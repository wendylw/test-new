import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { createCurrencyFormatter } from '@storehub/frontend-utils';
import Constants, { API_REQUEST_STATUS, REFERRER_SOURCE_TYPES } from '../../../../../../utils/constants';
import {
  CASHBACK_CAN_CLAIM_STATUS_LIST,
  AFTER_PAID_STATUS_LIST,
  CASHBACK_CLAIMED_STATUS_LIST,
  REFERRERS_REQUIRING_PROFILE,
  ORDER_DELAY_REASON_CODES,
  RAINY_IMAGES_MAPPING,
  DELIVERY_STATUS_IMAGES_MAPPING,
  NOT_DELIVERY_STATUS_IMAGES_MAPPING,
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
  getOrderDelayReason,
  getIsPreOrder,
  getOrderCustomerId,
} from '../../../redux/selector';
import {
  getMerchantCountry,
  getBusinessInfo,
  getUserIsLogin,
  getOnlineStoreInfo,
  getIsWebview,
  getIsUserLoginRequestCompleted,
  getHasUserJoinedBusinessMembership,
  getIsFetchLoginStatusComplete,
  getIsLoadCustomerRequestCompleted,
  getUserCustomerId,
  getUserConsumerId,
} from '../../../../../redux/modules/app';
import { getIsMerchantMembershipEnabled } from '../../../../../../redux/modules/merchant/selectors';

const { ORDER_STATUS, DELIVERY_METHOD } = Constants;

export const getStoreHashCode = state => state.orderStatus.thankYou.storeHashCode;

export const getLoadCashbackRequest = state => state.orderStatus.thankYou.loadCashbackRequest;

export const getLoadCashbackRequestData = createSelector(
  getLoadCashbackRequest,
  loadCashbackRequest => loadCashbackRequest.data
);

export const getClaimCashbackRequest = state => state.orderStatus.thankYou.claimCashbackRequest;

export const getClaimCashbackRequestData = createSelector(
  getClaimCashbackRequest,
  claimCashbackRequest => claimCashbackRequest.data
);

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

export const getCashback = createSelector(getLoadCashbackRequestData, loadCashbackRequestData => {
  const cashback = _get(loadCashbackRequestData, 'cashback', 0);

  return Number(cashback) ? Number(cashback) : 0;
});

export const getCashbackCurrency = createSelector(getCashback, getOnlineStoreInfo, (cashback, onlineStoreInfo) => {
  const { currency } = onlineStoreInfo || {};
  const currencyFormatter = createCurrencyFormatter({ currencyCode: currency });
  return currencyFormatter.format(cashback);
});

export const getCashbackStatus = createSelector(getLoadCashbackRequestData, loadCashbackRequestData =>
  _get(loadCashbackRequestData, 'status', null)
);

export const getCashbackCustomerId = createSelector(getClaimCashbackRequestData, claimCashbackRequestData =>
  _get(claimCashbackRequestData, 'customerId', null)
);

export const getCashbackConsumerId = createSelector(getClaimCashbackRequestData, claimCashbackRequestData =>
  _get(claimCashbackRequestData, 'consumerId', null)
);

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
  (isLogin, hasOrderPaid, hasCashbackClaimed, orderShippingType) =>
    hasOrderPaid &&
    !isLogin &&
    !hasCashbackClaimed &&
    // Only Dine In order will display the cashback banner
    orderShippingType === DELIVERY_METHOD.DINE_IN
);

// WB-7414: we need to consider the consumerId from cashbackInfo to make user able to see cashback card immediately.
export const getShouldShowCashbackCard = createSelector(
  getHasCashbackClaimed,
  getUserCustomerId,
  getUserConsumerId,
  getOrderCustomerId,
  getCashbackConsumerId,
  (hasCashbackClaimed, userCustomerId, userConsumerId, orderCustomerId, cashbackConsumerId) =>
    hasCashbackClaimed && (userCustomerId === orderCustomerId || userConsumerId === cashbackConsumerId)
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

export const getStatusDescriptionImage = createSelector(
  getIsWebview,
  getOrderDelayReason,
  getOrderShippingType,
  getIsPreOrder,
  getIsPayLater,
  getOrderStatus,
  (isWebview, orderDelayReason, shippingType, isPreOrder, isPayLater, orderStatus) => {
    const showMapInApp =
      isWebview && orderStatus === ORDER_STATUS.PICKED_UP && shippingType === DELIVERY_METHOD.DELIVERY;
    const delayByBadWeatherImageSource =
      orderDelayReason === ORDER_DELAY_REASON_CODES.BAD_WEATHER ? RAINY_IMAGES_MAPPING[orderStatus] : null;
    const preOrderPendingRiderConfirm =
      shippingType === DELIVERY_METHOD.DELIVERY &&
      isPreOrder &&
      [ORDER_STATUS.PAID, ORDER_STATUS.ACCEPTED].includes(orderStatus);
    let imageSource =
      preOrderPendingRiderConfirm || shippingType !== DELIVERY_METHOD.DELIVERY
        ? NOT_DELIVERY_STATUS_IMAGES_MAPPING[orderStatus]
        : DELIVERY_STATUS_IMAGES_MAPPING[orderStatus];

    if ([ORDER_STATUS.CREATED, ORDER_STATUS.PENDING_PAYMENT].includes(orderStatus) && isPayLater) {
      imageSource = NOT_DELIVERY_STATUS_IMAGES_MAPPING[ORDER_STATUS.PENDING_PAYMENT];
    }

    return showMapInApp ? null : delayByBadWeatherImageSource || imageSource;
  }
);

export const getUpdateRedirectFromStatus = state => state.orderStatus.thankYou.updateRedirectFromStatus;

export const getIsUpdateRedirectFromCompleted = createSelector(getUpdateRedirectFromStatus, updateRedirectFromStatus =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(updateRedirectFromStatus)
);

/* Tiered Membership */
export const getJoinBusinessMembershipRequest = state => state.orderStatus.thankYou.joinBusinessMembershipRequest;

export const getJoinBusinessMembershipRequestStatus = createSelector(
  getJoinBusinessMembershipRequest,
  joinBusinessMembershipRequest => joinBusinessMembershipRequest.status
);

export const getIsJoinBusinessMembershipRequestCompleted = createSelector(
  getJoinBusinessMembershipRequestStatus,
  joinBusinessMembershipRequestStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(joinBusinessMembershipRequestStatus)
);

export const getShouldJoinBusinessMembership = createSelector(
  getUserIsLogin,
  getIsUserLoginRequestCompleted,
  getIsMerchantMembershipEnabled,
  (isLogin, isUserLoginRequestCompleted, isMerchantMembershipEnabled) =>
    isUserLoginRequestCompleted && isLogin && isMerchantMembershipEnabled
);

export const getIsRewardInfoReady = createSelector(
  getUserIsLogin,
  getIsFetchLoginStatusComplete,
  getShouldJoinBusinessMembership,
  getIsLoadCustomerRequestCompleted,
  getIsUpdateRedirectFromCompleted,
  getIsJoinBusinessMembershipRequestCompleted,
  (
    isLogin,
    isFetchLoginStatusComplete,
    shouldJoinBusinessMembership,
    isLoadCustomerRequestCompleted,
    isUpdateRedirectFromStatusCompleted,
    isJoinBusinessMembershipRequestCompleted
  ) => {
    if (!(isFetchLoginStatusComplete && isUpdateRedirectFromStatusCompleted)) {
      return false;
    }

    if (!isLogin) {
      return true;
    }

    if (shouldJoinBusinessMembership) {
      return isJoinBusinessMembershipRequestCompleted;
    }

    return isLoadCustomerRequestCompleted;
  }
);

export const getShouldShowMemberBanner = createSelector(
  getUserIsLogin,
  getIsMerchantMembershipEnabled,
  getHasUserJoinedBusinessMembership,
  (isLogin, isMerchantMembershipEnabled, hasUserJoinedBusinessMembership) =>
    isLogin && isMerchantMembershipEnabled && !hasUserJoinedBusinessMembership
);

export const getShouldShowMemberCard = createSelector(
  getUserIsLogin,
  getIsMerchantMembershipEnabled,
  getHasUserJoinedBusinessMembership,
  (isLogin, isMerchantMembershipEnabled, hasUserJoinedBusinessMembership) =>
    isLogin && isMerchantMembershipEnabled && hasUserJoinedBusinessMembership
);

// WB-7383: we need to consider the consumerId from cashbackInfo to make user able to see cashback card immediately
export const getShouldShowEarnedCashback = createSelector(
  getHasCashback,
  getHasOrderPaid,
  getUserCustomerId,
  getOrderCustomerId,
  getCashbackCustomerId,
  getHasCashbackClaimed,
  (hasCashback, hasOrderPaid, userCustomerId, orderCustomerId, cashbackCustomerId, hasCashbackClaimed) =>
    hasCashback && hasOrderPaid && hasCashbackClaimed && userCustomerId === (orderCustomerId || cashbackCustomerId)
);

export const getShouldProfileModalShow = createSelector(
  getOrderStatus,
  getIsLoadMerchantRequestCompleted,
  getIsMerchantMembershipEnabled,
  (orderStatus, isLoadMerchantRequestCompleted, isMerchantMembershipEnabled) =>
    orderStatus && isLoadMerchantRequestCompleted && !isMerchantMembershipEnabled
);
