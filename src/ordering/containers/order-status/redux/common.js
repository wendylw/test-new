import Utils from '../../../../utils/utils';
import { createSlice } from '@reduxjs/toolkit';
import { cancelOrder, loadOrder, loadOrderStatus, updateOrderShippingType } from './thunks';

const initialState = {
  receiptNumber: Utils.getQueryString('receiptNumber'),
  order: null,
  updateOrderStatus: null, // pending || fulfilled || rejected
  cancelOrderStatus: null, // pending || fulfilled || rejected
  error: null,
};

export const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/common',
  initialState,
  reducers: {},
  extraReducers: {
    [cancelOrder.pending.type]: state => {
      state.cancelOrderStatus = 'pending';
    },
    [cancelOrder.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.cancelOrderStatus = 'fulfilled';
    },
    [cancelOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.cancelOrderStatus = 'rejected';
    },
    [loadOrder.pending.type]: state => {
      state.updateOrderStatus = 'pending';
    },
    [loadOrder.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.updateOrderStatus = 'fulfilled';
    },
    [loadOrder.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateOrderStatus = 'rejected';
    },
    [loadOrderStatus.fulfilled.type]: (state, { payload }) => {
      state.order = {
        ...state.order,
        status: payload.status,
        riderLocations: payload.riderLocations,
      };
    },
    [loadOrderStatus.rejected.type]: (state, { error }) => {
      state.error = error;
    },
    [updateOrderShippingType.pending.type]: state => {
      state.updateOrderStatus = 'pending';
    },
    [updateOrderShippingType.fulfilled.type]: (state, { payload }) => {
      state.order = payload.order;
      state.updateOrderStatus = 'fulfilled';
    },
    [updateOrderShippingType.rejected.type]: (state, { error }) => {
      state.error = error;
      state.updateOrderStatus = 'rejected';
    },
  },
});

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
