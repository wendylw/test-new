/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { fetchOrderIncludeCashback, fetchOrderSubmissionStatus, postOrderSubmitted } from './api-request';
import { getOrderModifiedTime, getOrderReceiptNumber } from './selectors';

const ORDER_STATUS_INTERVAL = 2 * 1000;

export const loadOrders = createAsyncThunk('ordering/tableSummary/loadOrders', async receiptNumber => {
  try {
    const result = await fetchOrderIncludeCashback({ receiptNumber });

    return result.order;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const loadOrdersStatus = createAsyncThunk(
  'ordering/tableSummary/loadOrdersStatus',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const receiptNumber = getOrderReceiptNumber(state);
      const prevModifiedTime = getOrderModifiedTime(state);
      const result = await fetchOrderSubmissionStatus({ receiptNumber });
      const prevModifiedTimeDate = dayjs(prevModifiedTime);
      const modifiedTimeDate = dayjs(result.modifiedTime);

      if (dayjs(modifiedTimeDate).isAfter(prevModifiedTimeDate, 'second')) {
        await dispatch(loadOrders(receiptNumber));
      }

      return result;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

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
