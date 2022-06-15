import { createAsyncThunk } from '@reduxjs/toolkit';
import { applyPromotion, removePromotion, applyVoucher, removeVoucher } from './api-request';
import { getPromoId, getPromoCodePayLater } from './selector';
import Utils from '../../../../../utils/utils';

/**
 * Promotion part
 */
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

/**
 * Voucher part
 */
export const applyVoucherPayLater = createAsyncThunk(
  'ordering/promotion/common/applyVoucherPayLater',
  async (_, { getState }) => {
    const state = getState();
    const receiptNumber = Utils.getQueryString('receiptNumber');
    const voucherCode = getPromoCodePayLater(state);
    try {
      const result = await applyVoucher({ receiptNumber, voucherCode });

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
  }
);

export const removeVoucherPayLater = createAsyncThunk('ordering/promotion/common/removeVoucherPayLater', async () => {
  const receiptNumber = Utils.getQueryString('receiptNumber');

  try {
    const result = await removeVoucher({ receiptNumber });

    return result;
  } catch (e) {
    console.error(e);

    throw e;
  }
});
