import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../utils/api/api-utils';
import Constants from '../../../../utils/constants';
import { getPromotionId, getSelectedPromo } from '../../../redux/modules/promotion';

const { ORDER_STATUS } = Constants;

export const getOrderReceiptNumber = state => state.tableSummary.order.receiptNumber;

export const getOrderPickUpCode = state => state.tableSummary.order.pickUpCode;

export const getOrderModifiedTime = state => state.tableSummary.order.modifiedTime;

export const getTableNumber = state => state.tableSummary.order.tableId;

export const getOrderTax = state => state.tableSummary.order.tax;

export const getOrderServiceCharge = state => state.tableSummary.order.serviceCharge;

export const getOrderServiceChargeRate = state =>
  _get(state.tableSummary.order.serviceChargeInfo, 'serviceChargeRate', 0);

export const getOrderTotal = state => state.tableSummary.order.total;

export const getOrderSubtotal = state => state.tableSummary.order.subtotal;

export const getOrderCashback = state =>
  Number(state.tableSummary.order.loyaltyDiscounts.map(item => item.displayDiscount)) || 0;

export const getOrderShippingFee = state => state.tableSummary.order.shippingFee;

export const getOrderPlacedStatus = state =>
  state.tableSummary.requestStatus.loadOrders !== API_REQUEST_STATUS.PENDING &&
  state.tableSummary.order.orderStatus === ORDER_STATUS.CREATED;

export const getOrderPendingPaymentStatus = state =>
  state.tableSummary.order.orderStatus === ORDER_STATUS.PENDING_PAYMENT;

export const getSubOrders = state => state.tableSummary.order.subOrders;

export const getOrderItems = state => state.tableSummary.order.items;

export const getSubOrdersMapping = createSelector([getSubOrders, getOrderItems], (subOrders, items) => {
  const subOrdersMapping = {};
  items.forEach(item => {
    const { submitId } = item;
    if (subOrdersMapping[submitId]) {
      subOrdersMapping[submitId].items.push(item);
    } else {
      const { submittedTime, comments } = subOrders.find(subOrder => subOrder.submitId === submitId) || {};
      const subOrder = {
        submitId,
        submittedTime,
        comments,
        items: [item],
      };

      subOrdersMapping[submitId] = subOrder;
    }
  });
  return subOrdersMapping;
});

export const getOrderSubmissionRequestingStatus = state =>
  state.tableSummary.requestStatus.submitOrders === API_REQUEST_STATUS.PENDING;

export const getOrderCompletedStatus = state =>
  [
    ORDER_STATUS.PAID,
    ORDER_STATUS.READY_FOR_DELIVERY,
    ORDER_STATUS.READY_FOR_PICKUP,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.LOGISTICS_CONFIRMED,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.PICKED_UP,
  ].includes(state.tableSummary.order.orderStatus);

export const getThankYouPageUrl = state => state.tableSummary.submission.thankYouPageUrl;

export const getOrderBillingPromoIfExist = state => state.tableSummary.order.displayPromotions?.length || '';

export const getOrderPromoDiscountType = state => state.tableSummary.order.displayPromotions[0]?.discountType;

export const getOrderPromoDiscount = state => state.tableSummary.order.displayPromotions[0]?.discount;

export const getOrderPromotionCode = state => state.tableSummary.order.displayPromotions[0]?.promotionCode;

export const getVoucherBillingIfExist = state => state.tableSummary.order.appliedVoucher?.voucherId || '';

export const getOrderVoucherCode = state => state.tableSummary.order.appliedVoucher?.voucherCode;

export const getOrderVoucherDiscount = state => state.tableSummary.order.appliedVoucher?.value;

export const getPromoOrVoucherExist = createSelector(
  getOrderBillingPromoIfExist,
  getVoucherBillingIfExist,
  (orderBillingPromoIfExist, voucherBillingIfExist) => !!(orderBillingPromoIfExist || voucherBillingIfExist)
);
export const getVoucherBilling = state => state.tableSummary.order.appliedVoucher;

export const getSelectedPromoCode = createSelector(getSelectedPromo, selectedPromo => selectedPromo.code);

export const getShouldShowRedirectLoader = state => state.tableSummary.redirectLoaderVisible;
