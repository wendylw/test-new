import _get from 'lodash/get';
import { createSelector } from 'reselect';
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
      promoType: PROMO_TYPE.VOUCHER,
    };
  }

  if (order && order.displayPromotions && order.displayPromotions.length) {
    const appliedPromo = order.displayPromotions[0];
    return {
      promoCode: appliedPromo.promotionCode,
      discount: appliedPromo.displayDiscount,
      promoType: PROMO_TYPE.PROMOTION,
    };
  }

  return null;
});

export const getOrderItems = createSelector(getOrder, order => _get(order, 'items', []));

export const getServiceCharge = createSelector(getOrderItems, items => {
  const serviceChargeItem = items.find(item => item.itemType === 'ServiceCharge');
  return _get(serviceChargeItem, 'displayPrice', 0);
});

export const getDisplayDiscount = createSelector(getOrder, order => {
  const { loyaltyDiscounts } = order || {};
  const { displayDiscount } = loyaltyDiscounts && loyaltyDiscounts.length > 0 ? loyaltyDiscounts[0] : '';

  return displayDiscount;
});