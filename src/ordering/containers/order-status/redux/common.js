import _get from 'lodash/get';
import Url from '../../../../utils/url';
import Utils from '../../../../utils/utils';
import Constants from '../../../../utils/constants';
import { API_REQUEST } from '../../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../../redux/middlewares/apiGql';
import { createSelector } from 'reselect';
import * as ApiFetch from '../../../../utils/api/api-fetch';
import { actions as appActions } from '../../../redux/modules/app';
import i18next from 'i18next';

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
  // cancel order
  cancelOrderRequest: 'ordering/orderStatus/cancelOrderRequest',
  cancelOrderSuccess: 'ordering/orderStatus/cancelOrderSuccess',
  cancelOrderFailure: 'ordering/orderStatus/cancelOrderFailure',
};

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  order: null,
  cancelOrderStatus: null, // pending || fulfilled || rejected
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
  cancelOrder: ({ orderId, reason, detail }) => async (dispatch, getState) => {
    try {
      const { url: endPoint } = Url.API_URLS.CANCEL_ORDER(orderId);

      dispatch({
        type: types.cancelOrderRequest,
      });

      await ApiFetch.put(endPoint, {
        reason,
        detail,
      });

      dispatch({
        type: types.cancelOrderSuccess,
      });
    } catch (error) {
      dispatch({
        type: types.cancelOrderFailure,
        error,
      });

      if (error.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        dispatch({
          type: 'ordering/app/showApiErrorModal',
          ...error,
        });
      } else {
        console.error('Cancel order error: ', error);

        dispatch(
          appActions.showMessageModal({
            message: i18next.t('OrderingThankYou:CancellationError'),
            description: i18next.t('OrderingThankYou:SomethingWentWrongWhenCancelingYourOrder'),
          })
        );
      }
    }

    return getState().cancelOrderStatus;
  },
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
    case types.cancelOrderRequest:
      return {
        ...state,
        cancelOrderStatus: 'pending',
      };
    case types.cancelOrderSuccess:
      return {
        ...state,
        cancelOrderStatus: 'fulfilled',
      };
    case types.cancelOrderFailure:
      return {
        ...state,
        cancelOrderStatus: 'rejected',
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
