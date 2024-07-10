import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack } from 'connected-react-router';
import { goBack as nativeGoBack } from '../../../../utils/native-methods';
import { getIsWebview } from '../../../redux/modules/common/selectors';

export const backButtonClicked = createAsyncThunk(
  'eInvoice/eInvoiceCategory/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);
