import _get from 'lodash/get';
import _trim from 'lodash/trim';
import { createSlice } from '@reduxjs/toolkit';
import { SUBMIT_STATUS } from '../constants';
import { fetchReport, uploadReport, submitReport } from './thunks';
import Utils from '../../../../../../utils/utils';

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

const { reducer, actions } = createSlice({
  name: 'ordering/orderStatus/reportDriver',
  initialState,
  reducers: {
    initialEmail(state, { payload }) {
      const email = _trim(payload);

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
      const email = _trim(state.inputEmail.value);

      state.inputEmail.value = email;
      state.inputEmail.isCompleted = true;
      state.inputEmail.isValid = email.length > 0 ? Utils.checkEmailIsValid(email) : true;
    },
  },
  extraReducers: {
    [fetchReport.pending.type]: state => {
      state.showPageLoader = true;
    },
    [fetchReport.fulfilled.type]: (state, action) => {
      const feedBack = _get(action.payload, 'data.feedBack', null);
      state.showPageLoader = false;
      state.submitStatus = feedBack ? SUBMIT_STATUS.SUBMITTED : SUBMIT_STATUS.NOT_SUBMIT;
    },
    [fetchReport.rejected.type]: state => {
      state.showPageLoader = false;
    },
    [submitReport.pending.type]: state => {
      state.submitStatus = SUBMIT_STATUS.IN_PROGRESS;
    },
    [submitReport.fulfilled.type]: state => {
      state.submitStatus = SUBMIT_STATUS.SUBMITTED;
    },
    [submitReport.rejected.type]: state => {
      state.submitStatus = SUBMIT_STATUS.NOT_SUBMIT;
    },
    [uploadReport.fulfilled.type]: (state, action) => {
      const location = _get(action.payload, 'location', '');
      state.uploadPhoto.location = location;
    },
  },
});

export default reducer;
export { actions };
