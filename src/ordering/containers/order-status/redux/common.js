import _get from 'lodash/get';
import Utils from '../../../../utils/utils';
import Constants from '../../../../utils/constants';
import { actions as appActions } from '../../../redux/modules/app';
import i18next from 'i18next';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { get, post, put } from '../../../../utils/api/api-fetch';
import { API_INFO } from './api-info';

const { DELIVERY_METHOD } = Constants;

const thunks = {
  cancelOrder: createAsyncThunk('ordering/orderStatus/common/cancelOrder', async (orderId, reason, detail) => {
    return put(API_INFO.cancelOrder(orderId).url, { reason, detail });
  }),
  loadOrder: createAsyncThunk('ordering/orderStatus/common/fetchOrder', async orderId => {
    const result = await post(API_INFO.getOrderDetail().url, { orderId });

    if (result.order && result.order.shippingType === 'dineIn') {
      result.order.shippingType = DELIVERY_METHOD.DINE_IN;
    }

    return result;
  }),
  loadOrderStatus: createAsyncThunk('ordering/orderStatus/common/fetchOrderStatus', async orderId => {
    return get(API_INFO.getOrderStatus(orderId).url);
  }),
  updateOrderShippingType: createAsyncThunk(
    'ordering/orderStatus/common/updateOrderShippingType',
    async (orderId, shippingType) => {
      const updateResult = await post(API_INFO.updateOrderShippingType(orderId).url, { value: shippingType });

      if (updateResult.success) {
        const result = await thunks.loadOrder(orderId);

        if (result.order && result.order.shippingType === 'dineIn') {
          result.order.shippingType = DELIVERY_METHOD.DINE_IN;
        }

        return result;
      }

      return updateResult;
    }
  ),
};

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  order: null,
  updateOrderStatus: null, // pending || fulfilled || rejected
  cancelOrderStatus: null, // pending || fulfilled || rejected
  error: null,
};

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/common',
  initialState,
  reducers: {},
  extraReducers: {
    [thunks.cancelOrder.pending.type]: state => {
      state.cancelOrderStatus = 'pending';
    },
    [thunks.cancelOrder.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.cancelOrderStatus = 'fulfilled';
    },
    [thunks.cancelOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.cancelOrderStatus = 'rejected';
    },
    [thunks.loadOrder.pending.type]: state => {
      state.updateOrderStatus = 'pending';
    },
    [thunks.loadOrder.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.updateOrderStatus = 'fulfilled';
    },
    [thunks.loadOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateOrderStatus = 'rejected';
    },
    [thunks.loadOrderStatus.fulfilled.type]: (state, { payload }) => {
      state.order = {
        ...state.order,
        status: payload.status,
        riderLocations: payload.riderLocations,
      };
    },
    [thunks.loadOrderStatus.rejected.type]: (state, { error }) => {
      state.error = error;
    },
    [thunks.updateOrderShippingType.pending.type]: state => {
      state.updateOrderStatus = 'pending';
    },
    [thunks.updateOrderShippingType.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.updateOrderStatus = 'fulfilled';
    },
    [thunks.updateOrderShippingType.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateOrderStatus = 'rejected';
    },
  },
});

export { actions, thunks };

// export const actions = {
// loadOrder: orderId => ({
//   [FETCH_GRAPHQL]: {
//     types: [types.fetchOrderRequest, types.fetchOrderSuccess, types.fetchOrderFailure],
//     endpoint: Url.apiGql('Order'),
//     variables: { orderId },
//   },
// }),
// loadOrderStatus: orderId => ({
//   [API_REQUEST]: {
//     types: [types.fetchOrderStatusRequest, types.fetchOrderStatusSuccess, types.fetchOrderStatusFailure],
//     ...Url.API_URLS.GET_ORDER_STATUS({ orderId }),
//   },
// }),
//   cancelOrder: ({ orderId, reason, detail }) => async (dispatch, getState) => {
//     try {
//       const { url: endPoint } = Url.API_URLS.CANCEL_ORDER(orderId);

//       dispatch({
//         type: types.cancelOrderRequest,
//       });

//       await ApiFetch.put(endPoint, {
//         reason,
//         detail,
//       });

//       dispatch({
//         type: types.cancelOrderSuccess,
//       });
//     } catch (error) {
//       dispatch({
//         type: types.cancelOrderFailure,
//         error,
//       });

//       if (error.code) {
//         // TODO: This type is actually not used, because apiError does not respect action type,
//         // which is a bad practice, we will fix it in the future, for now we just keep a useless
//         // action type.
//         dispatch({
//           type: 'ordering/app/showApiErrorModal',
//           ...error,
//         });
//       } else {
//         console.error('Cancel order error: ', error);

//         dispatch(
//           appActions.showMessageModal({
//             message: i18next.t('OrderingThankYou:CancellationError'),
//             description: i18next.t('OrderingThankYou:SomethingWentWrongWhenCancelingYourOrder'),
//           })
//         );
//       }
//     }

//     return getCancelOrderStatus(getState());
//   },
// };

export default reducer;
