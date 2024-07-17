import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack } from 'connected-react-router';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { getIsWebview, getLoadEInvoiceSubmissionDetailData } from '../../../../../redux/modules/common/selectors';
import { actions as submissionBusinessActions } from '../../../redux/submission';

export const backButtonClicked = createAsyncThunk(
  'eInvoice/business/form/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const mount = createAsyncThunk('eInvoice/business/form/mount', async (isRejected, { dispatch, getState }) => {
  if (!isRejected) {
    return;
  }

  const loadEInvoiceSubmissionDetailData = getLoadEInvoiceSubmissionDetailData(getState());

  const { submissionInfo } = loadEInvoiceSubmissionDetailData;

  dispatch(submissionBusinessActions.stateSet(submissionInfo));
});
