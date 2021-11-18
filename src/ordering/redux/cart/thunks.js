/* eslint-disable import/no-cycle */
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import Utils from '../../../utils/utils';
import { getBusinessUTCOffset } from '../modules/app';
import { getCartVersion, getCartSource, getCartSubmission } from './selectors';
import { actions as cartActionCreators } from '.';
import {
  postCartItems,
  deleteCartItemsById,
  deleteCart,
  postCartSubmission,
  fetchCartSubmissionStatus,
} from './api-request';

const TIMEOUT_CART_SUBMISSION_TIME = 30 * 1000;
const CART_SUBMISSION_INTERVAL = 2 * 1000;

export const queryCartAndStatus = createAsyncThunk('ordering/app/cart/queryCartAndStatus', () => {});

export const updateCartItems = createAsyncThunk(
  'ordering/app/cart/updateCartItems',
  async ({ productId, quantityChange, variations = [] }, { dispatch, getState }) => {
    const state = getState();
    const businessUTCOffset = getBusinessUTCOffset(state);
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const shippingType = Utils.getApiRequestShippingType();
    const options = { productId, quantityChange, variations: variations || [], shippingType };

    if (fulfillDate) {
      options.fulfillDate = fulfillDate;
    }

    try {
      const result = await postCartItems(options);

      return dispatch(cartActionCreators.updateCart(result));
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

export const removeCartItemsById = createAsyncThunk(
  'ordering/app/cart/removeCartItemsById',
  async (id, { dispatch, getState }) => {
    const state = getState();
    const businessUTCOffset = getBusinessUTCOffset(state);
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const shippingType = Utils.getApiRequestShippingType();
    const options = { id, shippingType };

    if (fulfillDate) {
      options.fulfillDate = fulfillDate;
    }

    try {
      const result = await deleteCartItemsById(options);

      return dispatch(cartActionCreators.updateCart(result));
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

export const clearCart = createAsyncThunk('ordering/app/cart/clearCart', async (_, { getState }) => {
  const state = getState();
  const businessUTCOffset = getBusinessUTCOffset(state);
  const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
  const shippingType = Utils.getApiRequestShippingType();
  const options = { shippingType };

  if (fulfillDate) {
    options.fulfillDate = fulfillDate;
  }

  try {
    await deleteCart(options);
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const submitCart = createAsyncThunk('ordering/app/cart/submitCart', async (_, { dispatch, getState }) => {
  const state = getState();
  const businessUTCOffset = getBusinessUTCOffset(state);
  const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
  const version = getCartVersion(state);
  const source = getCartSource(state);
  const shippingType = Utils.getApiRequestShippingType();
  const options = { version, source, shippingType };

  if (fulfillDate) {
    options.fulfillDate = fulfillDate;
  }

  try {
    const result = await postCartSubmission(options);

    return dispatch(cartActionCreators.updateCartSubmission(result));
  } catch (error) {
    console.error(error);

    throw error;
  }
});

const pollingCartSubmissionStatus = (callback, { submissionId, status, internal, initialTimestamp, timeout }) => {
  if (timeout <= 0) {
    callback({ status: 'failed' });
    return;
  }

  fetchCartSubmissionStatus({ submissionId }).then(
    submission => {
      if (status !== submission.status) {
        callback(submission);
      }

      if (submission.status !== 'completed') {
        return;
      }

      pollingCartSubmissionStatus.timer = setTimeout(
        () =>
          pollingCartSubmissionStatus(callback, {
            submissionId,
            timeout: timeout + initialTimestamp - Date.parse(new Date()),
          }),
        internal
      );
    },
    error => callback(error)
  );
};

export const queryCartSubmissionStatus = createAsyncThunk(
  'ordering/app/cart/queryCartSubmissionStatus',
  async (submissionId, { dispatch, getState }) => {
    const submission = getCartSubmission(getState());

    try {
      if (!submission.submissionId) {
        dispatch(cartActionCreators.updateCartSubmission({ submissionId }));
      }

      const result = await new Promise((resolve, reject) => {
        pollingCartSubmissionStatus((error, submissionStatus) => (error ? reject(error) : resolve(submissionStatus)), {
          submissionId,
          internal: CART_SUBMISSION_INTERVAL,
          initialTimestamp: Date.parse(new Date()),
          timeout: TIMEOUT_CART_SUBMISSION_TIME,
        });
      });

      dispatch(cartActionCreators.updateCartSubmission(result));

      return result;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

export const clearQueryCartSubmissionStatus = createAction('ordering/app/cart/clearQueryCartSubmissionStatus', () => {
  if (pollingCartSubmissionStatus.timer) {
    clearTimeout(pollingCartSubmissionStatus.timer);
  }
});
