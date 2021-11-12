import { createAsyncThunk } from '@reduxjs/toolkit';
import { getShoppingCart, getBusinessUTCOffset } from '../../../../redux/modules/app';
import Utils from '../../../../../utils/utils';
import { actions } from '.';
import { fetchStockStatus } from './api-request';
import { error as logglyError } from '../../../../../utils/monitoring/loggly';

const { loadStockStatusPending } = actions;

export const loadStockStatus = createAsyncThunk(
  'ordering/cart/common/fetchStockStatus',
  async (_, { dispatch, getState }) => {
    const businessUTCOffset = getBusinessUTCOffset(getState());
    const { items: cartItems } = getShoppingCart(getState());
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const shippingType = Utils.getApiRequestShippingType();
    const cartItemIds = cartItems.map(item => item.id);

    try {
      dispatch(loadStockStatusPending());

      const result = await fetchStockStatus({ fulfillDate: fulfillDate || '', shippingType, cartItemIds });

      return result;
    } catch (e) {
      logglyError('Load stock status error: ', e);

      throw e;
    }
  }
);
