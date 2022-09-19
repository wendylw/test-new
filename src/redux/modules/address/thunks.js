import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAddressSnapshot, setAddressSnapshot } from './api-request';
import * as NativeMethods from '../../../utils/native-methods';
import Utils from '../../../utils/utils';
import logger from '../../../utils/monitoring/logger';

export const getAddressInfo = createAsyncThunk('app/address/getAddressInfo', async () => {
  const { addressInfo = null } = await getAddressSnapshot();
  return addressInfo;
});

export const setAddressInfo = createAsyncThunk('app/address/setAddressInfo', async snapshot => {
  // Optimistic update: API post result should be imperceptible to the user.
  setAddressSnapshot(snapshot).catch(() => {});
  if (Utils.isWebview()) {
    try {
      NativeMethods.setAddress(snapshot);
    } catch (e) {
      logger.error('Common_Address_SetAddress', { message: e.message, code: e.code, extra: e.extra });
    }
  }
  return snapshot;
});
