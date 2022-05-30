import { createAsyncThunk } from '@reduxjs/toolkit';
import { applyPromotion, removePromotion } from './api-request';
import { getPromoId } from './selector';
import Utils from '../../../../../utils/utils';

export const applyPromo = createAsyncThunk('ordering/promotion/common/applyPromo', async (_, { getState }) => {
  const state = getState();
  const receiptNumber = Utils.getQueryString('receiptNumber');
  const promotionId = getPromoId(state);
  try {
    const result = await applyPromotion({ receiptNumber, promotionId });

    return result;
  } catch (e) {
    const addError = {
      name: JSON.stringify(e.extra),
      code: e.code,
      message: e.message,
    };
    console.error(addError);

    throw addError;
  }
});

export const removePromo = createAsyncThunk('ordering/promotion/common/removePromotion', async () => {
  const receiptNumber = Utils.getQueryString('receiptNumber');

  try {
    const result = await removePromotion({ receiptNumber });

    return result;
  } catch (e) {
    console.error(e);

    throw e;
  }
});
