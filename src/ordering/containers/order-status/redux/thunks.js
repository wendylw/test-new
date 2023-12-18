import dayjs from 'dayjs';
import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../../../utils/api/api-fetch';
import Constants from '../../../../utils/constants';
import { getReceiptNumber, getOffline, getPayLaterOrderModifiedTime } from './selector';
import {
  API_INFO,
  getPayLaterOrderStatus,
  postPayLaterOrderSubmission,
  getOrderStoreReview,
  postOrderStoreReview,
} from './api-info';
import { fetchOrder } from '../../../../utils/api-request';
import logger from '../../../../utils/monitoring/logger';
import { alert } from '../../../../common/utils/feedback';

const { DELIVERY_METHOD } = Constants;

export const loadOrder = createAsyncThunk('ordering/orderStatus/common/fetchOrder', async orderId => {
  try {
    const result = await post(API_INFO.getOrderDetail().url, { orderId });

    if (result.data) {
      if (result.data.order && result.data.order.shippingType === 'dineIn') {
        result.data.order.shippingType = DELIVERY_METHOD.DINE_IN;
      }

      return result.data;
    }

    return result;
  } catch (e) {
    logger.error('Ordering_OrderStatus_loadOrderFailed', {
      message: e?.message,
    });

    throw e;
  }
});

export const loadOrderStatus = createAsyncThunk('ordering/orderStatus/common/fetchOrderStatus', async orderId =>
  get(API_INFO.getOrderStatus(orderId).url)
);

export const loadPayLaterOrder = createAsyncThunk(
  'ordering/orderStatus/common/loadPayLaterOrder',
  async receiptNumber => {
    try {
      const result = await fetchOrder(receiptNumber);

      return result;
    } catch (error) {
      logger.error('Ordering_OrderStatus_loadPayLaterOrderFailed', { message: error?.message || '' });

      throw error;
    }
  }
);

export const loadPayLaterOrderStatus = createAsyncThunk(
  'ordering/orderStatus/common/loadPayLaterOrderStatus',
  async (receiptNumber, { dispatch, getState }) => {
    try {
      const state = getState();
      const prevModifiedTime = getPayLaterOrderModifiedTime(state);
      const result = await getPayLaterOrderStatus({ receiptNumber });
      const prevModifiedTimeDate = dayjs(prevModifiedTime);
      const modifiedTimeDate = dayjs(result.modifiedTime);

      if (dayjs(modifiedTimeDate).isAfter(prevModifiedTimeDate, 'second')) {
        await dispatch(loadPayLaterOrder(receiptNumber));
      }

      return result;
    } catch (error) {
      logger.error('Ordering_OrderStatus_loadPayLaterOrderStatusFailed', { message: error?.message || '' });

      throw error;
    }
  }
);

export const submitPayLaterOrder = createAsyncThunk(
  'ordering/orderStatus/common/submitPayLaterOrder',
  async ({ receiptNumber, data }) => postPayLaterOrderSubmission(receiptNumber, data)
);
// Store Review
export const showStoreReviewWarningModal = createAsyncThunk(
  'ordering/orderStatus/common/showStoreReviewWarningModal',
  async () => {}
);

export const hideStoreReviewWarningModal = createAsyncThunk(
  'ordering/orderStatus/common/hideStoreReviewWarningModal',
  async () => {}
);

export const showStoreReviewLoadingIndicator = createAsyncThunk(
  'ordering/orderStatus/common/showStoreReviewLoadingIndicator',
  async () => {}
);

export const hideStoreReviewLoadingIndicator = createAsyncThunk(
  'ordering/orderStatus/common/hideStoreReviewLoadingIndicator',
  async () => {}
);

export const loadOrderStoreReview = createAsyncThunk(
  'ordering/orderStatus/common/loadOrderStoreReview',
  async (_, { getState }) => {
    const offline = getOffline(getState());
    const orderId = getReceiptNumber(getState());
    const { data } = await getOrderStoreReview(orderId, offline);

    return data;
  }
);

export const saveOrderStoreReview = createAsyncThunk(
  'ordering/orderStatus/common/saveOrderStoreReview',
  async ({ rating, comments, allowMerchantContact }, { dispatch, getState }) => {
    const state = getState();
    const orderId = getReceiptNumber(state);
    const offline = getOffline(getState());

    try {
      await dispatch(showStoreReviewLoadingIndicator());
      await postOrderStoreReview({ orderId, rating, comments, allowMerchantContact, offline });
      await dispatch(hideStoreReviewLoadingIndicator());

      return { rating, comments, allowMerchantContact };
    } catch (e) {
      await dispatch(hideStoreReviewLoadingIndicator());

      if (e.code === '40028') {
        alert(i18next.t('ApiError:40028Description'), {
          title: i18next.t('ApiError:40028Title'),
        });
      } else {
        alert(i18next.t('OrderingThankYou:SubmissionFailedDescription'), {
          title: i18next.t('OrderingThankYou:SubmissionFailedTitle'),
        });
      }
      throw e;
    }
  }
);
