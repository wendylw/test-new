/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { push } from 'connected-react-router';
import { fetchOrderIncludeCashback, fetchOrderSubmissionStatus, submitOrder } from './api-request';
import logger from '../../../../utils/monitoring/logger';
import {
  getOrderModifiedTime,
  getOrderReceiptNumber,
  getOrderCashback,
  getOrderTotal,
  getOrderPromotionId,
  getOrderVoucherCode,
} from './selectors';
import { getUserConsumerId, getLocationSearch, getIsTNGMiniProgram } from '../../../redux/modules/app';
import { gotoPayment as initPayment, loadBilling } from '../../payments/redux/common/thunks';
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
  async (receiptNumber, { dispatch, getState }) => {
    try {
      const state = getState();
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

export const queryOrdersAndStatus = receiptNumber => async (dispatch, getState) => {
  logger.log('Ordering_TableSummary_QueryOrderStatus', { action: 'start', receiptNumber });
  try {
    const queryOrderStatus = () => {
      queryOrdersAndStatus.timer = setTimeout(async () => {
        await dispatch(loadOrdersStatus(receiptNumber));
        // Loop has been stopped
        if (!queryOrdersAndStatus.timer) {
          logger.log('Ordering_TableSummary_QueryOrderStatus', { action: 'quit-silently', receiptNumber });
          return;
        }

        queryOrderStatus();
      }, ORDER_STATUS_INTERVAL);
    };

    await dispatch(loadOrders(receiptNumber));
    queryOrderStatus();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export const lockOrder = createAsyncThunk('ordering/tableSummary/lockOrder', async ({ receiptNumber, data }) =>
  submitOrder(receiptNumber, data)
);

export const showRedirectLoader = createAsyncThunk('ordering/tableSummary/showRedirectLoader', async () => {});

export const hideRedirectLoader = createAsyncThunk('ordering/tableSummary/hideRedirectLoader', async () => {});

export const clearQueryOrdersAndStatus = () => () => {
  clearTimeout(queryOrdersAndStatus.timer);
  logger.log('Ordering_TableSummary_QueryOrderStatus', { action: 'stop' });
  queryOrdersAndStatus.timer = null;
};

export const payByCoupons = createAsyncThunk(
  'ordering/tableSummary/payByCoupons',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const receiptNumber = getOrderReceiptNumber(state);
    const cashback = getOrderCashback(state);
    const promotionId = getOrderPromotionId(state);
    const consumerId = getUserConsumerId(state);
    const modifiedTime = getOrderModifiedTime(state);
    const voucherCode = getOrderVoucherCode(state);
    const data = {
      consumerId,
      modifiedTime,
      cashback,
      promotionId,
      voucherCode,
    };

    await dispatch(lockOrder({ receiptNumber, data })).unwrap();
  }
);

export const payByTnGMiniProgram = createAsyncThunk(
  'ordering/tableSummary/payByTnGMiniProgram',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const total = getOrderTotal(state);
    const receiptNumber = getOrderReceiptNumber(state);

    try {
      dispatch(showRedirectLoader());
      // We need to stop the polling for 2 reasons:
      // 1. It is unnecessary to poll the status when user is paying by TNG Mini Program.
      // 2. It affects the page redirection and the page will be stook and the TnG app will be crashed at the end.
      dispatch(clearQueryOrdersAndStatus());
      // Load Billing API before calling init with order API, otherwise may be rejected for the required parameter missing
      // TODO: Not a good practice to call the thunk that from totally different module. We definitely need to optimize these codes in the future.
      await dispatch(loadBilling()).unwrap();
      await dispatch(initPayment({ orderId: receiptNumber, total }));
    } catch (error) {
      dispatch(hideRedirectLoader());
      // Resume payment status polling then user can still fetch the latest payment status
      dispatch(queryOrdersAndStatus(receiptNumber));
      throw error;
    }
  }
);

export const gotoPayment = createAsyncThunk('ordering/tableSummary/gotoPayment', async (_, { dispatch, getState }) => {
  const state = getState();
  const total = getOrderTotal(state);
  const receiptNumber = getOrderReceiptNumber(state);

  try {
    // Special case for free charge
    if (total === 0) {
      await dispatch(payByCoupons()).unwrap();
      return;
    }

    // If it comes from TnG mini program, we need to directly init payment
    const isTNGMiniProgram = getIsTNGMiniProgram(state);

    if (isTNGMiniProgram) {
      await dispatch(payByTnGMiniProgram()).unwrap();
      return;
    }

    // By default, redirect to payment page
    const search = getLocationSearch(state);
    dispatch(push(`${PATH_NAME_MAPPING.ORDERING_PAYMENT}${search}`));
  } catch (error) {
    logger.error('Ordering_TableSummary_GoToPaymentFailed', {
      error: error?.message,
      receiptNumber,
    });
    throw error;
  }
});
