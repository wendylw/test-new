import { createAsyncThunk } from '@reduxjs/toolkit';
import { applyPromotion, removePromotion, applyVoucher, removeVoucher } from './api-request';
import { getSelectedPromoId, getSelectedPromoCode } from '../../../../redux/modules/promotion';
import Utils from '../../../../../utils/utils';

const formatErrorOfApplyPromoOrVoucher = e => ({ name: JSON.stringify(e.extra), code: e.code, message: e.message });

/**
 * Promotion part
 */
export const applyPromo = createAsyncThunk('ordering/promotion/common/applyPromo', async (_, { getState }) => {
  const state = getState();
  const promotionId = getSelectedPromoId(state);
  const receiptNumber = Utils.getQueryString('receiptNumber');
  try {
    const result = await applyPromotion({ receiptNumber, promotionId });

    return result;
  } catch (e) {
    console.error(`Fail to apply promo: ${e.message}`);

    throw formatErrorOfApplyPromoOrVoucher(e);
  }
});

export const removePromo = createAsyncThunk('ordering/promotion/common/removePromotion', async () => {
  const receiptNumber = Utils.getQueryString('receiptNumber');
  try {
    const result = await removePromotion({ receiptNumber });

    return result;
  } catch (e) {
    console.error(`Fail to remove promo: ${e.message}`);

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
    const voucherCode = getSelectedPromoCode(state);
    const receiptNumber = Utils.getQueryString('receiptNumber');
    try {
      const result = await applyVoucher({ receiptNumber, voucherCode });

      return result;
    } catch (e) {
      console.error(`Fail to apply voucher for pay later: ${e}`);

      throw formatErrorOfApplyPromoOrVoucher(e);
    }
  }
);

export const removeVoucherPayLater = createAsyncThunk('ordering/promotion/common/removeVoucherPayLater', async () => {
  const receiptNumber = Utils.getQueryString('receiptNumber');
  try {
    const result = await removeVoucher({ receiptNumber });

    return result;
  } catch (e) {
    console.error(`Fail to remove voucher for pay later: ${e.message}`);

    throw e;
  }
});
