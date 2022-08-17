import { createAsyncThunk } from '@reduxjs/toolkit';
import { hideLocationConfirmModal, showLocationDrawer, clearSelectedProductItemInfo } from '../common/thunks';

export const addAddressButtonClicked = createAsyncThunk(
  'ordering/menu/locationModal/addAddressButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideLocationConfirmModal());
    await dispatch(showLocationDrawer());
  }
);

export const noThanksButtonClicked = createAsyncThunk(
  'ordering/menu/locationModal/noThanksButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(clearSelectedProductItemInfo());
    await dispatch(hideLocationConfirmModal());
  }
);
