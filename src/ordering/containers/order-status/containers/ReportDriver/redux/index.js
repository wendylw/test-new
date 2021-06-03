import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Url from '../../../../../../utils/url';
import { SUBMIT_STATUS } from '../constants';
import {
  getSelectedReasonCode,
  getInputNotes,
  getUploadPhotoFile,
  getUploadPhotoLocation,
  getInputEmailValue,
  getSelectedReasonNoteField,
  getSelectedReasonPhotoField,
} from './selectors';
import { getReceiptNumber } from '../../../redux/common';
import * as ApiFetch from '../../../../../../utils/api/api-fetch';
import { uploadReportDriverPhoto } from '../../../../../../utils/aws-s3';
import { actions as appActions } from '../../../../../redux/modules/app';
import i18next from 'i18next';
import _get from 'lodash/get';
import Utils from '../../../../../../utils/utils';
import * as loggly from '../../../../../../utils/monitoring/loggly.js';

export const initialState = {
  inputNotes: '',
  selectedReasonCode: null,
  uploadPhoto: {
    url: '',
    file: null, // File Object https://developer.mozilla.org/en-US/docs/Web/API/File
    location: '', // uploaded aws s3 location
  },
  submitStatus: SUBMIT_STATUS.NOT_SUBMIT,
  showPageLoader: true,
  inputEmail: {
    value: '',
    isCompleted: false, // it will be completed when input blur
    isValid: false,
  },
};

export const thunks = {
  submitReport: createAsyncThunk('ordering/orderStatus/reportDriver/submitReport', async (data, thunkAPI) => {
    const { getState, dispatch } = thunkAPI;
    const state = getState();
    const actions = reportDriverSlice.actions;
    const selectedReasonNotesField = getSelectedReasonNoteField(state);
    const selectedReasonPhotoField = getSelectedReasonPhotoField(state);
    const selectedReasonCode = getSelectedReasonCode(state);
    const receiptNumber = getReceiptNumber(state);
    const payload = {
      reasonCode: [selectedReasonCode],
      reporterType: 'consumer',
      receiptNumber,
    };

    dispatch(actions.updateSubmitStatus(SUBMIT_STATUS.IN_PROGRESS));

    payload.email = getInputEmailValue(state);

    if (selectedReasonNotesField) {
      payload.notes = getInputNotes(state);
    }

    if (selectedReasonPhotoField) {
      const file = getUploadPhotoFile(state);
      let location = getUploadPhotoLocation(getState());

      if (!location) {
        try {
          const result = await uploadReportDriverPhoto(file);
          dispatch(actions.setUploadPhotoFileLocation(result.location));
          location = result.location;
        } catch (e) {
          loggly.error('order-status.report-driver.upload-photo-error', { message: e.message });
          dispatch(
            appActions.showMessageModal({
              message: i18next.t('ConnectionIssue'),
            })
          );
          dispatch(actions.updateSubmitStatus(SUBMIT_STATUS.NOT_SUBMIT));
          return false;
        }
      }

      payload.image = location;
    }

    try {
      await ApiFetch.post(Url.API_URLS.CREATE_FEED_BACK.url, payload);
      dispatch(actions.updateSubmitStatus(SUBMIT_STATUS.SUBMITTED));
    } catch (e) {
      dispatch(actions.updateSubmitStatus(SUBMIT_STATUS.NOT_SUBMIT));
      loggly.error('order-status.report-driver.submit-error', { message: e.message });
      if (e.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        dispatch({ type: 'ordering/orderStatus/reportDriver/submitReportFailure', ...e });
      } else {
        dispatch(
          appActions.showMessageModal({
            message: i18next.t('ConnectionIssue'),
          })
        );
      }
    }
  }),
  fetchReport: createAsyncThunk('ordering/orderStatus/reportDriver/fetchReport', (data, thunkAPI) => {
    const { getState } = thunkAPI;
    const state = getState();
    const receiptNumber = getReceiptNumber(state);

    return ApiFetch.get(Url.API_URLS.QUERY_FEED_BACK.url, {
      queryParams: {
        receiptNumber,
      },
    });
  }),
};

export const reportDriverSlice = createSlice({
  name: 'ordering/orderStatus/reportDriver',
  initialState,
  reducers: {
    initialEmail(state, { payload }) {
      const email = payload.trim();

      if (email.length > 0) {
        state.inputEmail.value = email;
        state.inputEmail.isCompleted = true;
        state.inputEmail.isValid = Utils.checkEmailIsValid(email);
      }
    },
    updateInputNotes(state, { payload }) {
      state.inputNotes = payload;
    },
    setUploadPhotoFile(state, { payload: file }) {
      state.uploadPhoto.file = file;
      state.uploadPhoto.url = window.URL.createObjectURL(file);
      state.uploadPhoto.location = '';
    },
    removeUploadPhotoFile(state) {
      window.URL.revokeObjectURL(state.uploadPhoto.url);
      state.uploadPhoto.file = null;
      state.uploadPhoto.url = '';
      state.uploadPhoto.location = '';
    },
    setUploadPhotoFileLocation(state, { payload }) {
      state.uploadPhoto.location = payload;
    },
    selectReasonCode(state, { payload }) {
      state.selectedReasonCode = payload;
    },
    updateSubmitStatus(state, { payload }) {
      state.submitStatus = payload;
    },
    updateInputEmail(state, { payload }) {
      state.inputEmail.value = payload;
      state.inputEmail.isCompleted = false;
      state.inputEmail.isValid = false;
    },
    inputEmailCompleted(state) {
      const email = state.inputEmail.value.trim();

      state.inputEmail.value = email;
      state.inputEmail.isCompleted = true;
      state.inputEmail.isValid = email.length > 0 ? Utils.checkEmailIsValid(email) : true;
    },
  },
  extraReducers: {
    [thunks.fetchReport.pending]: state => {
      state.showPageLoader = true;
    },
    [thunks.fetchReport.fulfilled]: (state, action) => {
      const feedBack = _get(action.payload, 'data.feedBack', null);
      state.showPageLoader = false;
      state.submitStatus = feedBack ? SUBMIT_STATUS.SUBMITTED : SUBMIT_STATUS.NOT_SUBMIT;
    },
    [thunks.fetchReport.rejected]: state => {
      state.showPageLoader = false;
    },
  },
});

export default reportDriverSlice.reducer;

export const { actions, reducer } = reportDriverSlice;
