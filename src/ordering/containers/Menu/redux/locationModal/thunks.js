import { createAsyncThunk } from '@reduxjs/toolkit';
import { hideLocationConfirmModal, showLocationDrawer } from '../common/thunks';

export const addAddressButtonClicked = createAsyncThunk(
  'ordering/menu/locationModal/addAddressButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideLocationConfirmModal());
    dispatch(showLocationDrawer());
  }
);

export const noThanksButtonClicked = createAsyncThunk(
  'ordering/menu/locationModal/noThanksButtonClicked',
  async (_, { dispatch }) => {
    dispatch(hideLocationConfirmModal());
  }
);
