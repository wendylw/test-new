/* eslint-disable import/no-cycle */
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import Utils from '../../../utils/utils';
import { getBusinessUTCOffset } from '../modules/app';
import { CART_SUBMISSION_STATUS } from './constants';
import { getCartVersion, getCartSource, getCartSubmissionId } from './selectors';
import { actions as cartActionCreators } from '.';
import {
  fetchCart,
  postCartItems,
  deleteCartItemsById,
  deleteCart,
  postCartSubmission,
  fetchCartSubmissionStatus,
  fetchCartStatus,
} from './api-request';

const TIMEOUT_CART_SUBMISSION_TIME = 30 * 1000;
const CART_SUBMISSION_INTERVAL = 2 * 1000;
const CART_VERSION_AND_STATUS_INTERVAL = 2 * 1000;

export const loadCart = createAsyncThunk('ordering/app/cart/loadCart', async (_, { dispatch, getState }) => {
  const state = getState();
  const businessUTCOffset = getBusinessUTCOffset(state);
  const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
  const shippingType = Utils.getApiRequestShippingType();
  const options = { shippingType };

  if (fulfillDate) {
    options.fulfillDate = fulfillDate;
  }

  try {
    const result = await fetchCart(options);

    return dispatch(cartActionCreators.updateCart(result));
  } catch (error) {
    console.error(error);

    throw error;
  }
});

export const loadCartStatus = createAsyncThunk(
  'ordering/app/cart/loadCartStatus',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const prevCartVersion = getCartVersion(state);
    const businessUTCOffset = getBusinessUTCOffset(state);
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const shippingType = Utils.getApiRequestShippingType();
    const options = { shippingType };

    if (fulfillDate) {
      options.fulfillDate = fulfillDate;
    }

    try {
      const result = await fetchCartStatus(options);

      dispatch(cartActionCreators.updateCart(result));

      return { prevCartVersion, ...result };
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

export const queryCartAndStatus = async () => {
  try {
    await loadCart();

    queryCartAndStatus.timer = setTimeout(() => {
      const { prevCartVersion, version, receiptNumber } = loadCartStatus();

      if (receiptNumber) {
        clearTimeout(queryCartAndStatus.timer);

        return;
      }

      if (prevCartVersion !== version) {
        queryCartAndStatus();
      }
    }, CART_VERSION_AND_STATUS_INTERVAL);
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export const clearQueryCartStatus = createAction('ordering/app/cart/clearQueryCartStatus', () => {
  if (queryCartAndStatus.timer) {
    clearTimeout(queryCartAndStatus.timer);
  }
});

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

export const submitCart = createAsyncThunk('ordering/app/cart/submitCart', async (_, { getState }) => {
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

    return result;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

const pollingCartSubmissionStatus = (callback, { submissionId, status, initialTimestamp, timeout }) => {
  if (timeout <= 0) {
    callback({ status: CART_SUBMISSION_STATUS.FAILED });
    return;
  }

  fetchCartSubmissionStatus({ submissionId }).then(
    submission => {
      if (status !== submission.status) {
        callback(submission);
      }

      if (submission.status !== CART_SUBMISSION_STATUS.COMPLETED) {
        return;
      }

      pollingCartSubmissionStatus.timer = setTimeout(
        () =>
          pollingCartSubmissionStatus(callback, {
            submissionId,
            status,
            initialTimestamp,
            timeout: timeout + initialTimestamp - Date.parse(new Date()),
          }),
        CART_SUBMISSION_INTERVAL
      );
    },
    error => callback(error)
  );
};

export const queryCartSubmissionStatus = createAsyncThunk(
  'ordering/app/cart/queryCartSubmissionStatus',
  async (submissionId, { dispatch }) => {
    try {
      const result = await new Promise((resolve, reject) => {
        pollingCartSubmissionStatus(
          submissionStatus =>
            submissionStatus.status === CART_SUBMISSION_STATUS.FAILED
              ? reject(submissionStatus)
              : resolve(submissionStatus),
          {
            submissionId,
            initialTimestamp: Date.parse(new Date()),
            timeout: TIMEOUT_CART_SUBMISSION_TIME,
          }
        );
      });

      dispatch(cartActionCreators.updateCartSubmission(result));

      return result;
    } catch (error) {
      dispatch(cartActionCreators.updateCartSubmission({ status: CART_SUBMISSION_STATUS.FAILED }));
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
