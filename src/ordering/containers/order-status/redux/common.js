import _get from 'lodash/get';
import Url from '../../../../utils/url';
import Utils from '../../../../utils/utils';
import Constants from '../../../../utils/constants';
import { API_REQUEST } from '../../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../../redux/middlewares/apiGql';
import { createSelector } from 'reselect';

const { PROMO_TYPE } = Constants;

const types = {
  // fetch order
  fetchOrderRequest: 'ordering/orderStatus/fetchOrderRequest',
  fetchOrderSuccess: 'ordering/orderStatus/fetchOrderSuccess',
  fetchOrderFailure: 'ordering/orderStatus/fetchOrderFailure',
  // fetch order status
  fetchOrderStatusRequest: 'ordering/orderStatus/fetchOrderStatusRequest',
  fetchOrderStatusSuccess: 'ordering/orderStatus/fetchOrderStatusSuccess',
  fetchOrderStatusFailure: 'ordering/orderStatus/fetchOrderStatusFailure',
};

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  order: null,
};

export const actions = {
  loadOrder: orderId => ({
    [FETCH_GRAPHQL]: {
      types: [types.fetchOrderRequest, types.fetchOrderSuccess, types.fetchOrderFailure],
      endpoint: Url.apiGql('Order'),
      variables: { orderId },
    },
  }),
  loadOrderStatus: orderId => ({
    [API_REQUEST]: {
      types: [types.fetchOrderStatusRequest, types.fetchOrderStatusSuccess, types.fetchOrderStatusFailure],
      ...Url.API_URLS.GET_ORDER_STATUS({ orderId }),
    },
  }),
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.fetchOrderSuccess:
      const order = _get(action, 'responseGql.data.order', null);

      return { ...state, order };
    case types.fetchOrderStatusSuccess:
      const { status, riderLocations } = action.response;

      return {
        ...state,
        order: {
          ...state.order,
          status,
          riderLocations,
        },
      };
    default:
      return state;
  }
};

export default reducer;

// selectors
export const getOrder = state => state.orderStatus.common.order;

export const getReceiptNumber = state => state.orderStatus.common.receiptNumber;

export const getOrderStatus = createSelector(getOrder, order => _get(order, 'status', null));

export const getLoadOrderStatus = createSelector(getOrder, order => _get(order, 'status', null));

export const getRiderLocations = createSelector(getOrder, order => _get(order, 'riderLocations', null));

export const getIsUseStorehubLogistics = createSelector(getOrder, order =>
  _get(order, 'deliveryInformation.0.useStorehubLogistics', false)
);

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
