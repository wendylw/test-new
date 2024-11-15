import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack } from 'connected-react-router';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { getIsWebview } from '../../../../../redux/modules/app';

export const backButtonClicked = createAsyncThunk(
  'rewards/business/uniquePromoDetail/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('My Vouchers & Promos - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
