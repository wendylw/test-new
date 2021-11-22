/* eslint-disable import/no-cycle */
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import Utils from '../../../utils/utils';
import { getBusinessUTCOffset } from '../modules/app';
import { CART_SUBMISSION_STATUS } from './constants';
import { getCartVersion, getCartSource } from './selectors';
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

    dispatch(cartActionCreators.updateCart(result));

    return result;
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

      if (prevCartVersion !== result.version) {
        await dispatch(loadCart());
      }

      return result;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

export const queryCartAndStatus = () => async dispatch => {
  try {
    const queryCartStatus = () => {
      queryCartAndStatus.timer = setTimeout(async () => {
        const { receiptNumber } = await dispatch(loadCartStatus());

        if (receiptNumber) {
          clearTimeout(queryCartAndStatus.timer);

          return;
        }

        queryCartStatus();
      }, CART_VERSION_AND_STATUS_INTERVAL);
    };

    await dispatch(loadCart());
    queryCartStatus();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export const clearQueryCartStatus = () => () => {
  if (queryCartAndStatus.timer) {
    clearTimeout(queryCartAndStatus.timer);
  }
};

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

      dispatch(cartActionCreators.updateCart(result));

      return result;
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

      dispatch(cartActionCreators.updateCart(result));

      return result;
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
  if (timeout >= 0) {
    callback({ status: CART_SUBMISSION_STATUS.FAILED });
    return;
  }

  fetchCartSubmissionStatus({ submissionId }).then(
    submission => {
      if (submission.status && submission.status !== CART_SUBMISSION_STATUS.PENDING) {
        callback(submission);
        return;
      }

      pollingCartSubmissionStatus.timer = setTimeout(
        () =>
          pollingCartSubmissionStatus(callback, {
            submissionId,
            status,
            initialTimestamp,
            timeout: Date.parse(new Date()) - TIMEOUT_CART_SUBMISSION_TIME - initialTimestamp,
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
