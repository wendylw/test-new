import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../../../utils/api/api-fetch';
import Constants from '../../../../utils/constants';
import { getReceiptNumber, getOffline } from './selector';
import { API_INFO, getOrderStoreReview, postOrderStoreReview } from './api-info';
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

// Store Review
export const showStoreReviewThankYouModal = createAsyncThunk(
  'ordering/orderStatus/common/showStoreReviewThankYouModal',
  async () => {}
);

export const hideStoreReviewThankYouModal = createAsyncThunk(
  'ordering/orderStatus/common/hideStoreReviewThankYouModal',
  async () => {}
);

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
      await dispatch(showStoreReviewThankYouModal());

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
