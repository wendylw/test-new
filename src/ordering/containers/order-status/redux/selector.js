import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import { createSelector } from 'reselect';
import { getUserProfile, getTableId } from '../../../redux/modules/app';
import Constants from '../../../../utils/constants';

const { PROMO_TYPE, DELIVERY_METHOD, ORDER_STATUS } = Constants;

export const getOrder = state => state.orderStatus.common.order;

export const getReceiptNumber = state => state.orderStatus.common.receiptNumber;

export const getOrderStatus = createSelector(getOrder, order => _get(order, 'status', null));

export const getRiderLocations = createSelector(getOrder, order => _get(order, 'riderLocations', null));

export const getOrderDelayReason = createSelector(getOrder, order => _get(order, 'delayReason', null));

export const getOrderShippingType = createSelector(getOrder, order => _get(order, 'shippingType', null));

export const getRefundShippingFee = createSelector(getOrder, order => _get(order, 'refundShippingFee', null));

export const getCancelOperator = createSelector(getOrder, order => _get(order, 'cancelOperator', null));

export const getOrderStoreInfo = createSelector(getOrder, order => _get(order, 'storeInfo', null));

export const getIsPayLater = createSelector(getOrder, order => _get(order, 'isPayLater', false));

export const getOrderOriginalShippingType = createSelector(getOrder, order =>
  _get(order, 'originalShippingType', null)
);

export const getTimeoutLookingForRider = state => _get(state.orderStatus.common.order, 'timeoutLookingForRider', false);

export const getIsUseStorehubLogistics = createSelector(getOrder, order =>
  _get(order, 'deliveryInformation.0.useStorehubLogistics', false)
);

export const getIsShowReorderButton = createSelector(
  getOrderStatus,
  getOrderShippingType,
  (orderStatus, shippingType) =>
    (shippingType === DELIVERY_METHOD.DELIVERY && orderStatus === ORDER_STATUS.DELIVERED) ||
    (shippingType === DELIVERY_METHOD.PICKUP && orderStatus === ORDER_STATUS.PICKED_UP)
);

export const getIsPreOrder = createSelector(getOrder, order => _get(order, 'isPreOrder', false));

export const getIsOnDemandOrder = createSelector(getIsPreOrder, isPreOrder => !isPreOrder);

export const getCancelOrderStatus = state => state.orderStatus.common.cancelOrderStatus;

export const getIsOrderCancellable = createSelector(getOrder, order => _get(order, 'isCancellable', false));

export const getPromotion = createSelector(getOrder, order => {
  if (order && order.appliedVoucher) {
    return {
      promoCode: order.appliedVoucher.voucherCode,
      discount: order.appliedVoucher.value,
      promoType: PROMO_TYPE.VOUCHER_FOR_PAY_LATER,
    };
  }

  if (order && order.displayPromotions && order.displayPromotions.length) {
    const appliedPromo = order.displayPromotions[0];
    return {
      promoCode: appliedPromo.promotionCode,
      discount: appliedPromo.displayDiscount,
      promoType: PROMO_TYPE.PROMOTION_FOR_PAY_LATER,
    };
  }

  return null;
});

export const getOrderItems = createSelector(getOrder, order => _get(order, 'items', []));

export const getServiceCharge = createSelector(getOrder, order => _get(order, 'serviceCharge', null));

export const getProductsManualDiscount = createSelector(getOrder, order => _get(order, 'productsManualDiscount', 0));

export const getDisplayDiscount = createSelector(getOrder, order => {
  const { loyaltyDiscounts } = order || {};
  const { displayDiscount } = loyaltyDiscounts && loyaltyDiscounts.length > 0 ? loyaltyDiscounts[0] : '';

  return displayDiscount;
});

export const getLiveChatUserProfile = createSelector(getUserProfile, profile => ({
  phone: profile.phone || '',
  name: profile.name || '',
  email: profile.email || '',
}));

export const getOrderTableId = createSelector(getOrder, order => _get(order, 'tableId', null));

export const getHasOrderTableIdChanged = createSelector(getTableId, getOrderTableId, (prevTableId, currTableId) => {
  const shouldSkipDiffCheck = !prevTableId || !currTableId;

  return !(shouldSkipDiffCheck || _isEqual(prevTableId, currTableId));
});

// Pay Later Order
export const getPayLaterOrderInfo = state => state.orderStatus.common.payLaterOrderInfo;

export const getPayLaterOrderInfoData = createSelector(
  getPayLaterOrderInfo,
  payLaterOrderInfo => payLaterOrderInfo.data
);

export const getPayLaterOrderStatusInfo = state => state.orderStatus.common.payLaterOrderStatusInfo;

export const getPayLaterOrderStatusInfoData = createSelector(
  getPayLaterOrderStatusInfo,
  payLaterOrderStatusInfo => payLaterOrderStatusInfo.data
);

export const getPayLaterOrderModifiedTime = createSelector(
  getPayLaterOrderInfoData,
  payLaterOrderInfoData => payLaterOrderInfoData.modifiedTime
);

export const getPayLaterSubmitOrderRequest = createSelector(
  getPayLaterOrderInfo,
  payLaterOrderInfo => payLaterOrderInfo.submitOrderRequest
);

export const getPayLaterOrderTableId = createSelector(
  getPayLaterOrderInfoData,
  payLaterOrderInfoData => payLaterOrderInfoData.tableId
);

export const getPayLaterOrderStatusTableId = createSelector(
  getPayLaterOrderStatusInfoData,
  payLaterOrderStatusInfoData => payLaterOrderStatusInfoData.tableId
);

export const getHasPayLaterOrderTableIdChanged = createSelector(
  getTableId,
  getPayLaterOrderStatusTableId,
  (prevTableId, currTableId) => {
    const shouldSkipDiffCheck = !prevTableId || !currTableId;

    return !(shouldSkipDiffCheck || _isEqual(prevTableId, currTableId));
  }
);

export const getPayLaterStoreHash = createSelector(
  getPayLaterOrderStatusInfoData,
  payLaterOrderStatusInfoData => payLaterOrderStatusInfoData.storeHash
);

// Store Review
export const getStoreReviewInfo = state => state.orderStatus.common.storeReviewInfo;

export const getIsStoreWarningModalVisible = createSelector(
  getStoreReviewInfo,
  storeReviewInfo => storeReviewInfo.warningModalVisible
);

export const getIsStoreLoadingIndicatorVisible = createSelector(
  getStoreReviewInfo,
  storeReviewInfo => storeReviewInfo.loadingIndicatorVisible
);

export const getStoreReviewInfoData = createSelector(getStoreReviewInfo, storeReviewInfo => storeReviewInfo.data);

export const getStoreReviewLoadDataRequest = createSelector(
  getStoreReviewInfo,
  storeReviewInfo => storeReviewInfo.loadDataRequest
);

export const getStoreReviewSaveDataRequest = createSelector(
  getStoreReviewInfo,
  storeReviewInfo => storeReviewInfo.saveDataRequest
);

export const getIfStoreReviewInfoExists = createSelector(
  getStoreReviewInfoData,
  storeReviewInfoData => !_isEmpty(storeReviewInfoData)
);

export const getStoreRating = createSelector(
  getStoreReviewInfoData,
  storeReviewInfoData => _get(storeReviewInfoData, 'rating', 0) || 0
);

export const getStoreComment = createSelector(
  getStoreReviewInfoData,
  storeReviewInfoData => _get(storeReviewInfoData, 'comments', '') || ''
);

export const getStoreTableId = createSelector(
  getStoreReviewInfoData,
  storeReviewInfoData => storeReviewInfoData.tableId
);

export const getStoreFullDisplayName = createSelector(
  getStoreReviewInfoData,
  storeReviewInfoData => _get(storeReviewInfoData, 'storeDisplayName', '') || _get(storeReviewInfoData, 'storeName', '')
);

export const getStoreShippingType = createSelector(getStoreReviewInfoData, storeReviewInfoData =>
  _get(storeReviewInfoData, 'shippingType', '')
);

export const getIsMerchantContactAllowable = createSelector(getStoreReviewInfoData, storeReviewInfoData =>
  _get(storeReviewInfoData, 'isMerchantContactAllowable', false)
);

export const getHasStoreReviewed = createSelector(getStoreReviewInfoData, storeReviewInfoData =>
  _get(storeReviewInfoData, 'hasReviewed', false)
);

export const getIsStoreReviewable = createSelector(getStoreReviewInfoData, storeReviewInfoData =>
  _get(storeReviewInfoData, 'isReviewable', false)
);

export const getStoreGoogleReviewURL = createSelector(getStoreReviewInfoData, storeReviewInfoData =>
  _get(storeReviewInfoData, 'googleReviewURL', '')
);

export const getIsStoreReviewExpired = createSelector(getStoreReviewInfoData, storeReviewInfoData =>
  _get(storeReviewInfoData, 'isExpired', false)
);

export const getIsStoreReviewSupportable = createSelector(getStoreReviewInfoData, storeReviewInfoData =>
  _get(storeReviewInfoData, 'isSupportable', false)
);

export const getOffline = state => state.orderStatus.storeReview.offline;
