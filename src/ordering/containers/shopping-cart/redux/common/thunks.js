import { createAsyncThunk } from '@reduxjs/toolkit';
import i18next from 'i18next';
import {
  getShoppingCart,
  getBusinessUTCOffset,
  actions as appActions,
  getIsCartStatusRejected,
} from '../../../../redux/modules/app';
import Utils from '../../../../../utils/utils';
import { fetchStockStatus, applyCashback, unapplyCashback } from './api-request';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';
import { alert } from '../../../../../common/feedback';
import Constants from '../../../../../utils/constants';

const { ERROR_CODE_MAP } = Constants;

export const loadStockStatus = createAsyncThunk('ordering/cart/common/fetchStockStatus', async (_, { getState }) => {
  const businessUTCOffset = getBusinessUTCOffset(getState());
  const { items: cartItems } = getShoppingCart(getState());
  const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
  const shippingType = Utils.getApiRequestShippingType();
  const cartItemIds = cartItems.map(item => item.id);

  try {
    const result = await fetchStockStatus({ fulfillDate: fulfillDate || '', shippingType, cartItemIds });

    return result;
  } catch (e) {
    logger.error(
      'Ordering_Cart_CheckStockStatusFailed',
      {
        message: e?.message,
      },
      {
        bizFlow: {
          flow: KEY_EVENTS_FLOWS.CHECKOUT,
          step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SUBMIT_ORDER,
        },
        errorCategory: e?.name,
      }
    );

    if (e.code && ERROR_CODE_MAP[e.code]) {
      const { desc, title, buttonText, redirectUrl } = ERROR_CODE_MAP[e.code];

      alert(i18next.t(desc), {
        title: i18next.t(title),
        closeButtonContent: i18next.t(buttonText),
        onClose: () => {
          if (redirectUrl) {
            const h = Utils.getQueryVariable('h');
            const type = Utils.getQueryVariable('type');

            window.location.href = `${window.location.origin}${redirectUrl}?h=${h}&type=${type}`;
          }
        },
      });
    }

    throw e;
  }
});

export const reloadBillingByCashback = createAsyncThunk(
  'ordering/cart/common/reloadBillingByCashback',
  async (applyStatus, { dispatch, getState }) => {
    try {
      applyStatus ? await applyCashback() : await unapplyCashback();

      await dispatch(appActions.loadShoppingCart());

      const isShoppingCartRequestFailed = getIsCartStatusRejected(getState());

      if (isShoppingCartRequestFailed) {
        throw new Error('Shopping cart failed to update');
      }
    } catch (e) {
      logger.error('Ordering_ShoppingCart_ReloadBillingByCashbackFailed', { message: e?.message });

      throw e;
    }
  }
);
