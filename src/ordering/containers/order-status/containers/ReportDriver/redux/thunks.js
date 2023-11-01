import React from 'react';
import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getSelectedReasonCode,
  getInputNotes,
  getUploadPhotoFile,
  getUploadPhotoLocation,
  getInputEmailValue,
  getSelectedReasonNoteField,
  getSelectedReasonPhotoField,
} from './selectors';
import Url from '../../../../../../utils/url';
import { alert } from '../../../../../../common/feedback';
import { getReceiptNumber } from '../../../redux/selector';
import logger from '../../../../../../utils/monitoring/logger';
import * as ApiFetch from '../../../../../../utils/api/api-fetch';
import { uploadReportDriverPhoto } from '../../../../../../utils/aws-s3';

export const uploadReport = createAsyncThunk('ordering/orderStatus/reportDriver/uploadReport', async file => {
  try {
    const result = await uploadReportDriverPhoto(file);
    return result;
  } catch (e) {
    logger.error('Ordering_ReportDriver_UploadPhotoFailed', { message: e.message });

    alert.raw(
      // eslint-disable-next-line react/jsx-filename-extension
      <p className="padding-small text-size-biggest text-weight-bolder">{i18next.t('ConnectionIssue')}</p>
    );

    throw e;
  }
});

export const submitReport = createAsyncThunk(
  'ordering/orderStatus/reportDriver/submitReport',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const selectedReasonNotesField = getSelectedReasonNoteField(state);
    const selectedReasonPhotoField = getSelectedReasonPhotoField(state);
    const selectedReasonCode = getSelectedReasonCode(state);
    const receiptNumber = getReceiptNumber(state);
    const payload = {
      reasonCode: [selectedReasonCode],
      reporterType: 'consumer',
      receiptNumber,
    };

    payload.email = getInputEmailValue(state);

    if (selectedReasonNotesField) {
      payload.notes = getInputNotes(state);
    }

    if (selectedReasonPhotoField) {
      const file = getUploadPhotoFile(state);
      let location = getUploadPhotoLocation(getState());

      if (!location) {
        const result = await dispatch(uploadReport(file, { dispatch })).unwrap();
        location = result.location;
      }

      payload.image = location;
    }

    try {
      await ApiFetch.post(Url.API_URLS.CREATE_FEED_BACK.url, payload);
    } catch (e) {
      logger.error('Ordering_ReportDriver_SubmitFailed', { message: e.message });

      if (e.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        dispatch({ type: 'ordering/orderStatus/reportDriver/submitReportFailure', ...e });
      } else {
        // eslint-disable-next-line react/jsx-filename-extension
        alert.raw(<p className="padding-small text-size-biggest text-weight-bolder">{i18next.t('ConnectionIssue')}</p>);
      }

      throw e;
    }
  }
);

export const fetchReport = createAsyncThunk('ordering/orderStatus/reportDriver/fetchReport', (_, { getState }) => {
  const state = getState();
  const receiptNumber = getReceiptNumber(state);

  return ApiFetch.get(Url.API_URLS.QUERY_FEED_BACK.url, {
    queryParams: {
      receiptNumber,
    },
  });
});
