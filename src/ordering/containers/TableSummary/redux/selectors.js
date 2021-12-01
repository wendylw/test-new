import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../utils/api/api-utils';
import ORDER_STATUS from '../../../../utils/constants';

export const getOrderReceiptNumber = state => state.tableSummary.receiptNumber;

export const getOrderModifiedTime = state => state.tableSummary.modifiedTime;

export const getTableNumber = state => state.tableSummary.tableNumber;

export const getOrderTax = state => state.tableSummary.tax;

export const getOrderServiceCharge = state => state.tableSummary.serviceCharge;

export const getOrderTotal = state => state.tableSummary.total;

export const getOrderSubtotal = state => state.tableSummary.subtotal;

export const getOrderCashback = state => state.tableSummary.cashback;

export const getOrderShippingFee = state => state.tableSummary.shippingFee;

export const getOrderPlacedStatus = state => state.tableSummary.status === ORDER_STATUS.CREATED;

export const getOrderPendingPaymentStatus = state => state.tableSummary.status === ORDER_STATUS.PENDING_PAYMENT;

export const getSubOrders = state => state.tableSummary.subOrders;

export const getOrderItems = state => state.tableSummary.items;

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
  state.requestStatus.submitSubOrders === API_REQUEST_STATUS.PENDING;

export const getSubmitOrderConfirmDisplayStatus = state =>
  state.tableSummary.status === ORDER_STATUS.CREATED && state.tableSummary.domStates.displaySubmitOrderConfirm;

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
  ].includes(state.tableSummary.status);

export const getThankYouPageUrl = state => state.tableSummary.submission.thankYouPageUrl;
