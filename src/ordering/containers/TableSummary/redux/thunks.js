/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrder, fetchOrderSubmissionStatus, postOrderSubmitted } from './api-request';
import { getOrderModifiedTime } from './selectors';
import { getCartSubmissionReceiptNumber } from '../../../redux/cart/selectors';

const ORDER_STATUS_INTERVAL = 2 * 1000;

export const loadOrders = createAsyncThunk('ordering/tableSummary/loadOrders', async (_, { getState }) => {
  try {
    const receiptNumber = getCartSubmissionReceiptNumber(getState());
    const result = await fetchOrder({ receiptNumber });

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const loadOrdersStatus = createAsyncThunk('ordering/tableSummary/loadOrdersStatus', async () => {
  try {
    const result = await fetchOrderSubmissionStatus();

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const queryOrdersAndStatus = () => async dispatch => {
  try {
    const queryOrderStatus = () => {
      queryOrdersAndStatus.timer = setTimeout(async () => {
        await dispatch(loadOrdersStatus());

        queryOrderStatus();
      }, ORDER_STATUS_INTERVAL);
    };

    dispatch(loadOrders());
    queryOrderStatus();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export const clearQueryOrdersAndStatus = () => () => {
  if (queryOrdersAndStatus.timer) {
    clearTimeout(queryOrdersAndStatus.timer);
  }
};

export const submitOrders = createAsyncThunk('ordering/tableSummary/submitOrders', async (_, { getState }) => {
  const receiptNumber = getCartSubmissionReceiptNumber(getState());
  const modifiedTime = getOrderModifiedTime(getState());

  try {
    const result = await postOrderSubmitted({ receiptNumber, modifiedTime });

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});
