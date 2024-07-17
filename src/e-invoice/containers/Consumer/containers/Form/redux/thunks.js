import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack } from 'connected-react-router';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import { E_INVOICE_TYPES } from '../../../../../utils/constants';
import { getIsWebview, getLoadEInvoiceSubmissionDetailData } from '../../../../../redux/modules/common/selectors';
import { actions as submissionMalaysianActions } from '../../../redux/submission/malaysian';
import { actions as submissionNonMalaysianActions } from '../../../redux/submission/nonMalaysian';

export const backButtonClicked = createAsyncThunk(
  'eInvoice/consumer/form/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const mount = createAsyncThunk('eInvoice/consumer/form/mount', async (isRejected, { dispatch, getState }) => {
  if (!isRejected) {
    return;
  }

  const loadEInvoiceSubmissionDetailData = getLoadEInvoiceSubmissionDetailData(getState());

  const { type, submissionInfo } = loadEInvoiceSubmissionDetailData;

  switch (type) {
    case E_INVOICE_TYPES.MALAYSIAN:
      dispatch(submissionMalaysianActions.stateSet(submissionInfo));
      break;
    case E_INVOICE_TYPES.NON_MALAYSIAN:
      dispatch(submissionNonMalaysianActions.stateSet(submissionInfo));
      break;
    default:
      break;
  }
});
