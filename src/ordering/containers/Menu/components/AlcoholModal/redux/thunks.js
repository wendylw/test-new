import { createAsyncThunk } from '@reduxjs/toolkit';
import * as NativeMethods from '../../../../../../utils/native-methods';
import { getSourceUrlFromSessionStorage, isWebview } from '../../../../../../common/utils';
import { getAlcoholConsent, setAlcoholConsent } from './api-request';

// call when user click “Yes, I am”
export const acceptAlcoholConsent = createAsyncThunk('ordering/menu/alcohol/acceptAlcoholConsent', async () => {
  setAlcoholConsent().catch(() => {});
  return true;
});

// call when user click "No, I am not"
// export const denyAlcoholConsent = createAsyncThunk('ordering/menu/alcohol/denyAlcoholConsent', async () => {});

// call when user click “Got It” on Deny View
export const confirmAlcoholDenied = createAsyncThunk('ordering/menu/alcohol/confirmAlcoholDenied', history => {
  const sourceUrl = getSourceUrlFromSessionStorage();

  if (sourceUrl) {
    window.location.href = sourceUrl;
    return;
  }

  if (isWebview()) {
    NativeMethods.goBack();

    return;
  }

  history.go(-1);
});

export const getUserAlcoholConsent = createAsyncThunk('ordering/menu/alcohol/getUserAlcoholConsent', async () => {
  const { alcoholConsentTime = null } = await getAlcoholConsent();
  return alcoholConsentTime;
});
