/* eslint-disable import/no-cycle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import i18next from 'i18next';
import Utils from '../../../../utils/utils';
import Constants from '../../../../utils/constants';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { alert } from '../../../../common/feedback';
import { getBusinessUTCOffset } from '../app';
import { CART_SUBMISSION_STATUS, AVAILABLE_QUERY_CART_STATUS_ROUTES } from './constants';
import { getCartVersion, getCartSource, getCartItems } from './selectors';
import { actions as cartActionCreators } from '.';
import Poller from '../../../../common/utils/poller';
import {
  fetchCart,
  postCartItems,
  deleteCartItemsById,
  deleteCart,
  postCartSubmission,
  fetchCartSubmissionStatus,
  fetchCartStatus,
} from './api-request';
import logger from '../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../utils/monitoring/constants';

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
    logger.error('Ordering_Cart_LoadCartFailed', { message: error?.message });

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

      if (result.version !== prevCartVersion) {
        // WB-5038: The cart version is not always self-increment.
        // To prevent users from placing outdated shopping cart, we should load cart as long as version is changed.
        await dispatch(loadCart());
      }

      return result;
    } catch (error) {
      logger.error('Ordering_Cart_LoadCartStatusFailed', { message: error?.message });

      throw error;
    }
  }
);

// Diff page should use diff poller, otherwise can not stop poller correctly
const CartStatusPollers = {
  pollers: {
    menu: null,
    cart: null,
  },
  // eslint-disable-next-line object-shorthand
  clearPoller: function() {
    const keys = Object.keys(this.pollers);

    keys.forEach(key => {
      if (!this.pollers[key]) {
        return;
      }

      this.pollers[key].stop();
      this.pollers[key] = null;
    });
  },
};
export const queryCartAndStatus = pollerKey => async dispatch => {
  CartStatusPollers.clearPoller();
  logger.log('Ordering_Cart_PollCartStatus', { action: 'start' });

  try {
    CartStatusPollers.pollers[pollerKey] = new Poller({
      fetchData: async () => {
        const { pathname } = window.location;

        // Add a judgment condition. There may be requests that have not been cleared before and are still being polled.
        if (AVAILABLE_QUERY_CART_STATUS_ROUTES.includes(pathname)) {
          await dispatch(loadCartStatus());
        }
      },
      onError: error => {
        CartStatusPollers.pollers[pollerKey].stop();
        logger.log('Ordering_Cart_PollCartStatus', { action: 'stop', error: error?.message });
      },
      interval: CART_VERSION_AND_STATUS_INTERVAL,
    });

    CartStatusPollers.pollers[pollerKey].start();
  } catch (error) {
    logger.error('Ordering_Cart_QueryCartAndStatusFailed', { message: error?.message });

    throw error;
  }
};

export const clearQueryCartStatus = () => () => {
  logger.log('Ordering_Cart_PollCartStatus', { action: 'stop' });
};

/**
 * @param {variations} [{"variationId", "optionId", "quantity"}]
 */
export const updateCartItems = createAsyncThunk(
  'ordering/app/cart/updateCartItems',
  async ({ productId, comments, quantityChange, variations = [], isTakeaway }, { dispatch, getState }) => {
    const state = getState();
    const businessUTCOffset = getBusinessUTCOffset(state);
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const shippingType = Utils.getApiRequestShippingType();
    const options = { productId, comments, quantityChange, variations: variations || [], shippingType, isTakeaway };

    if (fulfillDate) {
      options.fulfillDate = fulfillDate;
    }

    try {
      const result = await postCartItems(options);

      dispatch(cartActionCreators.updateCart(result));

      return result;
    } catch (error) {
      logger.error('Ordering_Cart_UpdateCartItemFailed', { message: error?.message });

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
      logger.error('Ordering_Cart_removeCartItemByIdFailed', { message: error?.message });

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
    logger.error('Ordering_Cart_ClearCartFailed', { message: error?.message });

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
    // new stock status error code maps to old code
    const NEW_ERROR_CODE_MAPPING = {
      393478: '54012',
      393479: '57014',
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
            const h = Utils.getQueryString('h');
            const type = Utils.getQueryString('type');

            window.location.href = `${window.location.origin}${redirectUrl}?h=${h}&type=${type}`;
          }
        },
      });
    }

    throw error;
  }
});

export const queryCartSubmissionStatus = submissionId => async dispatch => {
  try {
    if (!submissionId) {
      throw new Error('pollingCartSubmission submissionId is required');
    }

    dispatch(
      cartActionCreators.loadCartSubmissionStatusUpdated({
        loadCartSubmissionStatus: API_REQUEST_STATUS.PENDING,
      })
    );

    const poller = new Poller({
      fetchData: async () => {
        const result = await fetchCartSubmissionStatus({ submissionId });

        return result;
      },
      onData: async result => {
        await dispatch(
          cartActionCreators.loadCartSubmissionStatusUpdated({
            loadCartSubmissionStatus: API_REQUEST_STATUS.FULFILLED,
          })
        );
        await dispatch(cartActionCreators.updateCartSubmission(result));

        const { status } = result || {};

        if ([CART_SUBMISSION_STATUS.COMPLETED, CART_SUBMISSION_STATUS.FAILED].includes(status)) {
          poller.stop();
        }
      },
      onTimeout: () => {
        dispatch(cartActionCreators.updateCartSubmission({ status: CART_SUBMISSION_STATUS.FAILED }));

        logger.log('Ordering_Cart_PollCartSubmissionStatus', {
          action: 'stop',
          message: 'finished',
          id: submissionId,
        });
      },
      onError: async error => {
        poller.stop();

        await dispatch(
          cartActionCreators.loadCartSubmissionStatusUpdated({
            loadCartSubmissionStatus: API_REQUEST_STATUS.REJECTED,
            error: error?.message,
          })
        );
      },
      timeout: TIMEOUT_CART_SUBMISSION_TIME,
      interval: CART_SUBMISSION_INTERVAL,
    });

    poller.start();
  } catch (error) {
    await dispatch(
      cartActionCreators.loadCartSubmissionStatusUpdated({
        loadCartSubmissionStatus: API_REQUEST_STATUS.REJECTED,
        error: error?.message,
      })
    );

    logger.error(
      'Ordering_Cart_ViewOrderFailed',
      { message: error?.message },
      {
        bizFlow: {
          flow: KEY_EVENTS_FLOWS.PAYMENT,
          step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].VIEW_ORDER,
        },
      }
    );
  }
};

export const clearQueryCartSubmissionStatus = () => async dispatch => {
  await dispatch(cartActionCreators.updateCartSubmission({ status: null }));
  logger.log('Ordering_Cart_PollCartSubmissionStatus', { action: 'stop', message: 'unmount' });
};
