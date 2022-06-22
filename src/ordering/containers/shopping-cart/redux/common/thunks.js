import { createAsyncThunk } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { getShoppingCart, getBusinessUTCOffset } from '../../../../redux/modules/app';
import Utils from '../../../../../utils/utils';
import { fetchStockStatus } from './api-request';
import { error as logError } from '../../../../../utils/monitoring/logger';
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
    logError('Load stock status error: ', e);

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
