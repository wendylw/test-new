/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrder, fetchOrderSubmissionStatus, postOrderSubmitted } from './api-request';
import { getOrderModifiedTime, getOrderReceiptNumber } from './selectors';

const ORDER_STATUS_INTERVAL = 2 * 1000;

export const loadOrders = createAsyncThunk('ordering/tableSummary/loadOrders', async receiptNumber => {
  try {
    const result = await fetchOrder({ receiptNumber });

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const loadOrdersStatus = createAsyncThunk('ordering/tableSummary/loadOrdersStatus', async receiptNumber => {
  try {
    const result = await fetchOrderSubmissionStatus({ receiptNumber });

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const queryOrdersAndStatus = receiptNumber => async dispatch => {
  try {
    const queryOrderStatus = () => {
      queryOrdersAndStatus.timer = setTimeout(async () => {
        await dispatch(loadOrdersStatus(receiptNumber));

        queryOrderStatus();
      }, ORDER_STATUS_INTERVAL);
    };

    dispatch(loadOrders(receiptNumber));
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
