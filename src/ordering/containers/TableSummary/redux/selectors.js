import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../utils/api/api-utils';
import ORDER_STATUS from '../../../../utils/constants';

export const getOrderReceiptNumber = state => state.tableSummary.order.receiptNumber;

export const getOrderModifiedTime = state => state.tableSummary.order.modifiedTime;

export const getTableNumber = state => state.tableSummary.order.tableNumber;

export const getOrderTax = state => state.tableSummary.order.tax;

export const getOrderServiceCharge = state => state.tableSummary.order.serviceCharge;

export const getOrderTotal = state => state.tableSummary.order.total;

export const getOrderSubtotal = state => state.tableSummary.order.subtotal;

export const getOrderCashback = state => state.tableSummary.order.cashback;

export const getOrderShippingFee = state => state.tableSummary.order.shippingFee;

export const getOrderPlacedStatus = state => state.tableSummary.order.status === ORDER_STATUS.CREATED;

export const getOrderPendingPaymentStatus = state => state.tableSummary.order.status === ORDER_STATUS.PENDING_PAYMENT;

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
  state.tableSummary.requestStatus.submitSubOrders === API_REQUEST_STATUS.PENDING;

export const getSubmitOrderConfirmDisplayStatus = state =>
  state.tableSummary.order.status === ORDER_STATUS.CREATED && state.tableSummary.uiStates.displaySubmitOrderConfirm;

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
  ].includes(state.tableSummary.order.status);

export const getThankYouPageUrl = state => state.tableSummary.submission.thankYouPageUrl;
