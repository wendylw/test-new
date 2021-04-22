import _get from 'lodash/get';
import { initialState } from './index';
import { createSelector } from 'reselect';
import { REPORT_DRIVER_REASONS } from '../constants';

export const getInputNotes = state => {
  return _get(state.orderStatus.reportDriver, 'inputNotes', initialState.inputNotes);
};

export const getSelectedReasonCode = state => {
  return _get(state.orderStatus.reportDriver, 'selectedReasonCode', initialState.selectedReasonCode);
};

export const getSelectedReasonFields = createSelector([getSelectedReasonCode], reasonCode => {
  const reason = REPORT_DRIVER_REASONS.find(reason => {
    return reason.code === reasonCode;
  });
  return _get(reason, 'fields', []);
});

export const getSubmitStatus = state => {
  return _get(state.orderStatus.reportDriver, 'submitStatus', initialState.submitStatus);
};

export const getShowPageLoader = state => {
  return _get(state.orderStatus.reportDriver, 'showPageLoader', initialState.showPageLoader);
};

export const getUploadPhotoFile = state => {
  return _get(state.orderStatus.reportDriver, 'uploadPhoto.file', null);
};

export const getUploadPhotoUrl = state => {
  return _get(state.orderStatus.reportDriver, 'uploadPhoto.url', '');
};

export const getUploadPhotoLocation = state => {
  return _get(state.orderStatus.reportDriver, 'uploadPhoto.location', '');
};
