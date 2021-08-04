import { createAsyncThunk } from '@reduxjs/toolkit';
import { actions as appActions } from '../../../../redux/modules/app';

export const showProductDetail = createAsyncThunk(
  'ordering/home/common/showProductDetail',
  async ({ productId, categoryId }, { dispatch }) => {
    await dispatch(appActions.loadProductDetail(productId));

    return {
      productId,
      categoryId,
    };
  }
);
