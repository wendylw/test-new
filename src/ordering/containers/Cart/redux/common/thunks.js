import { createAsyncThunk } from '@reduxjs/toolkit';
import { getShoppingCart, getBusinessUTCOffset } from '../../../../redux/modules/app';
import Utils from '../../../../../utils/utils';
import { fetchStockStatus } from './api-request';
import { error as logglyError } from '../../../../../utils/monitoring/loggly';

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
    logglyError('Load stock status error: ', e);

    throw e;
  }
});
