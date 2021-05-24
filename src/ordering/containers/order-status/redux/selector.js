import _get from 'lodash/get';
import { createSelector } from 'reselect';
import Constants from '../../../../utils/constants';

const { PROMO_TYPE } = Constants;

export const getUpdateOrderPendingState = state => state.orderStatus.common.updateOrderStatus === 'pending';

export const getOrder = state => state.orderStatus.common.order;

export const getReceiptNumber = state => state.orderStatus.common.receiptNumber;

export const getOrderStatus = createSelector(getOrder, order => _get(order, 'status', null));

export const getLoadOrderStatus = createSelector(getOrder, order => _get(order, 'status', null));

export const getRiderLocations = createSelector(getOrder, order => _get(order, 'riderLocations', null));

export const getOrderDelayReason = createSelector(getOrder, order => _get(order, 'delayReason', null));

export const getOrderShippingType = createSelector(getOrder, order => _get(order, 'shippingType', null));

export const getIsUseStorehubLogistics = createSelector(getOrder, order =>
  _get(order, 'deliveryInformation.0.useStorehubLogistics', false)
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
  } else if (order && order.displayPromotions && order.displayPromotions.length) {
    const appliedPromo = order.displayPromotions[0];
    return {
      promoCode: appliedPromo.promotionCode,
      discount: appliedPromo.displayDiscount,
      promoType: PROMO_TYPE.PROMOTION,
    };
  } else {
    return null;
  }
});

export const getOrderItems = createSelector(getOrder, order => _get(order, 'items', []));

export const getServiceCharge = createSelector(getOrderItems, items => {
  const serviceChargeItem = items.find(item => item.itemType === 'ServiceCharge');
  return _get(serviceChargeItem, 'displayPrice', 0);
});
