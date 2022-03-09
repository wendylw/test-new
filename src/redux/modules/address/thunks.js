import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAddressSnapshot, setAddressSnapshot } from './api-request';
import * as NativeMethods from '../../../utils/native-methods';
import Utils from '../../../utils/utils';
import { error } from '../../../utils/monitoring/loggly';

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
      error('ordering.set-address', { message: e });
    }
  }
  return snapshot;
});
