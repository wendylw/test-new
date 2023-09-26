/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { applyCashback, unapplyCashback } from './api-request';
import logger from '../../../../../../utils/monitoring/logger';
import {
  getOrderReceiptNumber,
  getOrderCashback,
  getOrderTotal,
  getOrderPromotionId,
  getOrderVoucherCode,
} from './selectors';
import { getUserConsumerId, getLocationSearch, getIsAlipayMiniProgram } from '../../../../../redux/modules/app';
import {
  loadPayLaterOrderStatus as loadOrderStatus,
  loadPayLaterOrder as loadOrder,
  submitPayLaterOrder as submitOrder,
} from '../../../redux/thunks';
import { getPayLaterOrderModifiedTime as getOrderModifiedTime } from '../../../redux/selector';
import { gotoPayment as initPayment, loadBilling } from '../../../../payments/redux/common/thunks';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../../utils/monitoring/constants';

const ORDER_STATUS_INTERVAL = 2 * 1000;

export const queryOrdersAndStatus = receiptNumber => async dispatch => {
  logger.log('Ordering_TableSummary_QueryOrderStatus', { action: 'start', id: receiptNumber });
  try {
    const queryOrderStatus = () => {
      queryOrdersAndStatus.timer = setTimeout(async () => {
        await dispatch(loadOrderStatus(receiptNumber));
        // Loop has been stopped
        if (!queryOrdersAndStatus.timer) {
          logger.log('Ordering_TableSummary_QueryOrderStatus', { action: 'quit-silently', id: receiptNumber });
          return;
        }

        queryOrderStatus();
      }, ORDER_STATUS_INTERVAL);
    };

    await dispatch(loadOrder(receiptNumber));
    queryOrderStatus();
  } catch (error) {
    logger.error('Ordering_OrderStatus_QueryOrdersAndStatusFailed', { message: error?.message || '' });

    throw error;
  }
};

export const showRedirectLoader = createAsyncThunk(
  'ordering/orderStatus/tableSummary/showRedirectLoader',
  async () => {}
);

export const hideRedirectLoader = createAsyncThunk(
  'ordering/orderStatus/tableSummary/hideRedirectLoader',
  async () => {}
);

export const showProcessingLoader = createAsyncThunk(
  'ordering/orderStatus/tableSummary/showProcessingLoader',
  async () => {}
);

export const hideProcessingLoader = createAsyncThunk(
  'ordering/orderStatus/tableSummary/hideProcessingLoader',
  async () => {}
);

export const clearQueryOrdersAndStatus = () => () => {
  clearTimeout(queryOrdersAndStatus.timer);
  logger.log('Ordering_TableSummary_QueryOrderStatus', { action: 'stop' });
  queryOrdersAndStatus.timer = null;
};

export const payByCoupons = createAsyncThunk(
  'ordering/orderStatus/tableSummary/payByCoupons',
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

    try {
      await dispatch(showProcessingLoader());
      await dispatch(submitOrder({ receiptNumber, data })).unwrap();
    } catch (error) {
      await dispatch(hideProcessingLoader());
      throw error;
    }
  }
);

export const payByAlipayMiniProgram = createAsyncThunk(
  'ordering/orderStatus/tableSummary/payByAlipayMiniProgram',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const total = getOrderTotal(state);
    const receiptNumber = getOrderReceiptNumber(state);

    try {
      dispatch(showRedirectLoader());
      // We need to stop the polling for 2 reasons:
      // 1. It is unnecessary to poll the status when user is paying by TNG or GCash Mini Program.
      // 2. It affects the page redirection and the page will be stook and the TnG or GCash app will be crashed at the end.
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

export const gotoPayment = createAsyncThunk(
  'ordering/orderStatus/tableSummary/gotoPayment',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const total = getOrderTotal(state);
    const receiptNumber = getOrderReceiptNumber(state);

    try {
      // Special case for free charge
      if (total === 0) {
        await dispatch(payByCoupons()).unwrap();
        return;
      }

      // If it comes from TnG or GCash mini program, we need to directly init payment
      const isAlipayMiniProgram = getIsAlipayMiniProgram(state);

      if (isAlipayMiniProgram) {
        await dispatch(payByAlipayMiniProgram()).unwrap();
        return;
      }

      // By default, redirect to payment page
      const search = getLocationSearch(state);
      dispatch(push(`${PATH_NAME_MAPPING.ORDERING_PAYMENT}${search}`));
    } catch (error) {
      logger.error(
        'Ordering_TableSummary_GoToPaymentFailed',
        {
          message: error?.message,
          id: receiptNumber,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.PAYMENT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.PAYMENT].SUBMIT_ORDER,
          },
          errorCategory: error?.name,
        }
      );
      throw error;
    }
  }
);

export const reloadBillingByCashback = createAsyncThunk(
  'ordering/orderStatus/tableSummary/reloadBillingByCashback',
  async (applyStatus, { dispatch, getState }) => {
    try {
      await dispatch(showProcessingLoader());

      const receiptNumber = getOrderReceiptNumber(getState());

      applyStatus ? await applyCashback(receiptNumber) : await unapplyCashback(receiptNumber);

      await dispatch(loadOrder(receiptNumber)).unwrap();
      await dispatch(hideProcessingLoader());
    } catch (e) {
      logger.error('Ordering_TableSummary_ReloadBillingByCashbackFailed', { message: e?.message });

      await dispatch(hideProcessingLoader());

      throw e;
    }
  }
);
