/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { push } from 'connected-react-router';
import { fetchOrderIncludeCashback, fetchOrderSubmissionStatus, submitOrder } from './api-request';
import logger from '../../../../utils/monitoring/logger';
import {
  getOrderModifiedTime,
  getOrderReceiptNumber,
  getSelectedPromoCode,
  getOrderCashback,
  getOrderTotal,
} from './selectors';
import { getUserConsumerId, getLocationSearch } from '../../../redux/modules/app';
import { getPromotionId } from '../../../redux/modules/promotion';
import { PATH_NAME_MAPPING } from '../../../../common/utils/constants';

const ORDER_STATUS_INTERVAL = 2 * 1000;

export const loadOrders = createAsyncThunk('ordering/tableSummary/loadOrders', async receiptNumber => {
  try {
    const result = await fetchOrderIncludeCashback({ receiptNumber });

    return result;
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
  logger.log('table-summary.query-orders-and-status', { action: 'start', receiptNumber });
  try {
    const queryOrderStatus = () => {
      queryOrdersAndStatus.timer = setTimeout(async () => {
        await dispatch(loadOrdersStatus(receiptNumber));
        // Loop has been stopped
        if (!queryOrdersAndStatus.timer) {
          logger.log('table-summary.query-orders-and-status', { action: 'quit-silently', receiptNumber });
          return;
        }

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

export const lockOrder = createAsyncThunk('ordering/tableSummary/lockOrder', async ({ receiptNumber, data }) =>
  submitOrder(receiptNumber, data)
);

export const gotoPayment = createAsyncThunk('ordering/tableSummary/gotoPayment', async (_, { dispatch, getState }) => {
  const state = getState();
  const receiptNumber = getOrderReceiptNumber(state);

  try {
    const total = getOrderTotal(state);
    const cashback = getOrderCashback(state);
    const promotionId = getPromotionId(state);
    const consumerId = getUserConsumerId(state);
    const modifiedTime = getOrderModifiedTime(state);
    const { voucherCode } = getSelectedPromoCode(state) || {};
    const data = {
      consumerId,
      modifiedTime,
      cashback,
      promotionId,
      voucherCode,
    };

    // Special case for free charge
    if (total === 0) {
      await dispatch(lockOrder({ receiptNumber, data })).unwrap();
      return;
    }

    // By default, redirect to payment page
    const search = getLocationSearch(state);
    dispatch(push(`${PATH_NAME_MAPPING.ORDERING_PAYMENT}${search}`));
  } catch (error) {
    logger.error('ordering.table-summary.go-to-payment.error', {
      error: error?.message,
      receiptNumber,
    });

    throw error;
  }
});

export const clearQueryOrdersAndStatus = () => () => {
  clearTimeout(queryOrdersAndStatus.timer);
  logger.log('table-summary.query-orders-and-status', { action: 'stop' });
  queryOrdersAndStatus.timer = null;
};
