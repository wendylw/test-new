import _get from 'lodash/get';
import { createSelector } from 'reselect';
import Constants, { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import {
  getUserIsLogin,
  getBusinessInfo,
  getCashbackRate,
  getEnableCashback,
  getMerchantCountry,
  getShippingType,
  getIsAlipayMiniProgram,
} from '../../../../../redux/modules/app';
import { getIsLoadUniquePromosAvailableCountCompleted } from '../../../../../redux/modules/common/selectors';
import {
  getPayLaterOrderInfoData as getOrder,
  getPayLaterSubmitOrderRequest as getSubmitOrderRequest,
} from '../../../redux/selector';

const { ORDER_STATUS } = Constants;

export const getOrderReceiptNumber = createSelector(getOrder, order => order.receiptNumber);

export const getOrderPickUpCode = createSelector(getOrder, order => order.pickUpCode);

export const getOrderTax = createSelector(getOrder, order => order.tax);

export const getOrderServiceCharge = createSelector(getOrder, order => order.serviceCharge);

export const getIsStorePayByCashOnly = createSelector(getOrder, order => order.isStorePayByCashOnly);

export const getOrderServiceChargeRate = createSelector(getOrder, order =>
  _get(order.serviceChargeInfo, 'serviceChargeRate', 0)
);

export const getOrderTotal = createSelector(getOrder, order => order.total);

export const getOrderSubtotal = createSelector(getOrder, order => order.subtotal);

export const getOrderCashback = createSelector(
  getOrder,
  order => Number(order.loyaltyDiscounts.map(item => item.displayDiscount)) || 0
);

export const getOrderShippingFee = createSelector(getOrder, order => order.shippingFee);

export const getOrderStatus = createSelector(getOrder, order => order.orderStatus);

export const getIsOrderPlaced = createSelector(getOrderStatus, orderStatus => orderStatus === ORDER_STATUS.CREATED);

export const getIsOrderPendingPayment = createSelector(
  getOrderStatus,
  orderStatus => orderStatus === ORDER_STATUS.PENDING_PAYMENT
);

export const getSubOrders = createSelector(getOrder, order => order.subOrders);

export const getOrderItems = createSelector(getOrder, order => order.items);

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

export const getOrderSubmissionRequestingStatus = createSelector(
  getSubmitOrderRequest,
  request => request.status === API_REQUEST_STATUS.PENDING
);

export const getOrderCompletedStatus = createSelector(getOrderStatus, orderStatus =>
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
  ].includes(orderStatus)
);

export const getThankYouPageUrl = createSelector(getOrder, order => order.redirectUrl);

export const getOrderDisplayPromotions = createSelector(getOrder, order => order.displayPromotions);

export const getOrderBillingPromoIfExist = createSelector(
  getOrderDisplayPromotions,
  displayPromotions => displayPromotions?.length || ''
);

export const getOrderPromoDiscountType = createSelector(
  getOrderDisplayPromotions,
  displayPromotions => displayPromotions[0]?.discountType
);

export const getOrderPromoDiscount = createSelector(
  getOrderDisplayPromotions,
  displayPromotions => displayPromotions[0]?.discount
);

export const getOrderPromotionCode = createSelector(
  getOrderDisplayPromotions,
  displayPromotions => displayPromotions[0]?.promotionCode
);

export const getOrderPromotionId = createSelector(
  getOrderDisplayPromotions,
  displayPromotions => displayPromotions[0]?.promotionId
);

export const getVoucherBilling = createSelector(getOrder, order => order.appliedVoucher);

export const getVoucherBillingIfExist = createSelector(
  getVoucherBilling,
  appliedVoucher => appliedVoucher?.voucherId || ''
);

export const getOrderVoucherCode = createSelector(getVoucherBilling, appliedVoucher => appliedVoucher?.voucherCode);

export const getOrderVoucherDiscount = createSelector(getVoucherBilling, appliedVoucher => appliedVoucher?.value);

export const getProductsManualDiscount = createSelector(getOrder, order => _get(order, 'productsManualDiscount', 0));

export const getPromoOrVoucherExist = createSelector(
  getOrderBillingPromoIfExist,
  getVoucherBillingIfExist,
  (orderBillingPromoIfExist, voucherBillingIfExist) => !!(orderBillingPromoIfExist || voucherBillingIfExist)
);

export const getOrderApplyCashback = createSelector(getOrder, order => order.applyCashback);

export const getShouldShowRedirectLoader = state => state.orderStatus.tableSummary.redirectLoaderVisible;

export const getShouldShowProcessingLoader = state => state.orderStatus.tableSummary.processingLoaderVisible;

export const getShouldShowPayNowButton = createSelector(
  getIsAlipayMiniProgram,
  getIsOrderPendingPayment,
  (isAlipayMiniProgram, isOrderPendingPayment) => isAlipayMiniProgram || !isOrderPendingPayment
);

export const getShouldShowSwitchButton = createSelector(
  getOrderCashback,
  getIsOrderPendingPayment,
  (cashback, isOrderPendingPayment) => !isOrderPendingPayment && cashback > 0
);

export const getReloadBillingByCashbackRequest = state => state.orderStatus.tableSummary.reloadBillingByCashbackRequest;

export const getIsReloadBillingByCashbackRequestPending = createSelector(
  getReloadBillingByCashbackRequest,
  request => request.status === API_REQUEST_STATUS.PENDING
);

export const getIsReloadBillingByCashbackRequestRejected = createSelector(
  getReloadBillingByCashbackRequest,
  request => request.status === API_REQUEST_STATUS.REJECTED
);

export const getPayByCouponsRequest = state => state.orderStatus.tableSummary.payByCouponsRequest;

export const getIsPayByCouponsRequestPending = createSelector(
  getPayByCouponsRequest,
  request => request.status === API_REQUEST_STATUS.PENDING
);

export const getIsPayByCouponsRequestFulfilled = createSelector(
  getPayByCouponsRequest,
  request => request.status === API_REQUEST_STATUS.FULFILLED
);

export const getShouldRemoveFooter = createSelector(
  getIsAlipayMiniProgram,
  getIsStorePayByCashOnly,
  (isAlipayMiniProgram, isStorePayByCashOnly) => isAlipayMiniProgram && isStorePayByCashOnly
);

export const getShouldDisablePayButton = createSelector(
  getIsPayByCouponsRequestPending,
  getIsPayByCouponsRequestFulfilled,
  getUserIsLogin,
  getIsLoadUniquePromosAvailableCountCompleted,
  (isRequestPending, isRequestFulfilled, isLogin, isLoadUniquePromosAvailableCountCompleted) =>
    // WB-4761: window location redirection will take some time, if we only consider pending status then the button will be activated accidentally.
    // Therefore, we should also need to take fulfilled status into consideration.
    isRequestPending || isRequestFulfilled || (isLogin && !isLoadUniquePromosAvailableCountCompleted)
);

export const getCartItemsQuantityCleverTap = createSelector(getOrderItems, orderItems => {
  let count = 0;

  (orderItems || []).forEach(item => {
    const { quantity } = item || {};
    count += quantity;
  });
  return count;
});

export const getCleverTapAttributes = createSelector(
  getBusinessInfo,
  getShippingType,
  getMerchantCountry,
  getEnableCashback,
  getCashbackRate,
  getCartItemsQuantityCleverTap,
  getOrderSubtotal,
  (businessInfo, shippingType, country, enableCashback, cashbackRate, cartItemsQuantity, orderSubtotal) => ({
    'store name': _get(businessInfo, 'stores.0.name', ''),
    'store id': _get(businessInfo, 'stores.0.id', ''),
    'shipping type': shippingType,
    country,
    cashback: enableCashback ? cashbackRate : undefined,
    'cart items quantity': cartItemsQuantity,
    'cart amount': orderSubtotal,
  })
);
