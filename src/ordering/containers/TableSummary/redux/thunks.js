/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrder, fetchOrderSubmissionStatus, postOrderSubmitted } from './api-request';
import { getOrderReceiptNumber, getOrderModifiedTime } from './selectors';

const ORDER_STATUS_INTERVAL = 2 * 1000;

export const loadSubOrders = createAsyncThunk('ordering/tableSummary/loadSubOrders', async (_, { getState }) => {
  try {
    const receiptNumber = getOrderReceiptNumber(getState());
    const result = await fetchOrder({ receiptNumber });

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const loadSubOrdersStatus = createAsyncThunk('ordering/tableSummary/loadSubOrdersStatus', async () => {
  try {
    const result = await fetchOrderSubmissionStatus();

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const queryOrderAndStatus = () => async dispatch => {
  try {
    const queryOrderStatus = () => {
      queryOrderAndStatus.timer = setTimeout(async () => {
        await dispatch(loadSubOrdersStatus());

        queryOrderStatus();
      }, ORDER_STATUS_INTERVAL);
    };

    dispatch(loadSubOrders());
    queryOrderStatus();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export const clearQueryOrderStatus = () => () => {
  if (queryOrderAndStatus.timer) {
    clearTimeout(queryOrderAndStatus.timer);
  }
};

export const submitSubOrders = createAsyncThunk('ordering/tableSummary/submitSubOrders', async (_, { getState }) => {
  const receiptNumber = getOrderReceiptNumber(getState());
  const modifiedTime = getOrderModifiedTime(getState());

  try {
    const result = await postOrderSubmitted({ receiptNumber, modifiedTime });

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});
