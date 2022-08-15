/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import i18next from 'i18next';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import { alert } from '../../../common/feedback';
import { getBusinessUTCOffset } from '../modules/app';
import { CART_SUBMISSION_STATUS } from './constants';
import { getCartVersion, getCartSource, getCartItems, getCartSubmissionStatus } from './selectors';
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
import logger from '../../../utils/monitoring/logger';

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

      dispatch(cartActionCreators.updateCart(result));

      if (result.version > prevCartVersion) {
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
  logger.log('cart.polling-cart-status', { action: 'start' });
  try {
    const queryCartStatus = () => {
      queryCartAndStatus.timer = setTimeout(async () => {
        await dispatch(loadCartStatus());

        // Loop has been stopped
        if (!queryCartAndStatus.timer) {
          logger.log('cart.polling-cart-status', { action: 'quit-silently' });
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
  clearTimeout(queryCartAndStatus.timer);
  logger.log('cart.polling-cart-status', { action: 'stop' });
  queryCartAndStatus.timer = null;
};

/**
 * @param {variations} [{"variationId", "optionId", "quantity"}]
 */
export const updateCartItems = createAsyncThunk(
  'ordering/app/cart/updateCartItems',
  async ({ productId, comments, quantityChange, variations = [] }, { dispatch, getState }) => {
    const state = getState();
    const businessUTCOffset = getBusinessUTCOffset(state);
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const shippingType = Utils.getApiRequestShippingType();
    const options = { productId, comments, quantityChange, variations: variations || [], shippingType };

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

export const submitCart = createAsyncThunk('ordering/app/cart/submitCart', async (comments, { getState, dispatch }) => {
  const state = getState();
  const businessUTCOffset = getBusinessUTCOffset(state);
  const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
  const version = getCartVersion(state);
  const source = getCartSource(state);
  const cartItems = getCartItems(state) || [];
  const shippingType = Utils.getApiRequestShippingType();
  const options = {
    version,
    source,
    comments,
    selectedItemIds: (cartItems || []).map(cartItem => cartItem.id),
    shippingType,
  };

  if (fulfillDate) {
    options.fulfillDate = fulfillDate;
  }

  try {
    const result = await postCartSubmission(options);

    return result;
  } catch (error) {
    console.error(error);

    // new stock status error code maps to old code
    const NEW_ERROR_CODE_MAPPING = {
      393478: '54012',
    };

    if (NEW_ERROR_CODE_MAPPING[error.code]) {
      dispatch(loadCart());

      const {
        desc: descriptionKey,
        title: titleKey,
        buttonText: buttonTextKey,
        redirectUrl,
      } = Constants.ERROR_CODE_MAP[NEW_ERROR_CODE_MAPPING[error.code]];

      alert(i18next.t(descriptionKey), {
        title: i18next.t(titleKey),
        closeButtonContent: i18next.t(buttonTextKey),
        onClose: () => {
          if (redirectUrl) {
            const h = Utils.getQueryVariable('h');
            const type = Utils.getQueryVariable('type');

            window.location.href = `${window.location.origin}${redirectUrl}?h=${h}&type=${type}`;
          }
        },
      });
    }

    throw error;
  }
});

export const loadCartSubmissionStatus = createAsyncThunk(
  'ordering/app/cart/loadCartSubmissionStatus',
  async (submissionId, { dispatch }) => {
    try {
      const result = await fetchCartSubmissionStatus({ submissionId });

      dispatch(cartActionCreators.updateCartSubmission(result));

      return result;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

export const queryCartSubmissionStatus = submissionId => (dispatch, getState) => {
  logger.log('cart.polling-cart-submission-status', { action: 'start', submissionId });
  const targetTimestamp = Date.parse(new Date()) + TIMEOUT_CART_SUBMISSION_TIME;

  try {
    const pollingCartSubmissionStatus = () => {
      queryCartSubmissionStatus.timer = setTimeout(async () => {
        if (targetTimestamp - Date.parse(new Date()) <= 0) {
          clearTimeout(queryCartSubmissionStatus.timer);
          logger.log('cart.polling-cart-submission-status', { action: 'stop', reason: 'timeout', submissionId });
          dispatch(cartActionCreators.updateCartSubmission({ status: CART_SUBMISSION_STATUS.FAILED }));

          return;
        }

        await dispatch(loadCartSubmissionStatus(submissionId));

        const submissionStatus = getCartSubmissionStatus(getState());

        if (submissionStatus === CART_SUBMISSION_STATUS.COMPLETED) {
          clearTimeout(queryCartSubmissionStatus.timer);
          logger.log('cart.polling-cart-submission-status', { action: 'stop', reason: 'finished', submissionId });
          return;
        }

        pollingCartSubmissionStatus();
      }, CART_SUBMISSION_INTERVAL);
    };

    pollingCartSubmissionStatus();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export const clearQueryCartSubmissionStatus = () => () => {
  if (queryCartSubmissionStatus.timer) {
    clearTimeout(queryCartSubmissionStatus.timer);
    logger.log('cart.polling-cart-submission-status', { action: 'stop', reason: 'unmount' });
  }
};
