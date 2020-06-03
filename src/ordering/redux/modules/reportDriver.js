import { createSelector } from 'reselect';
import { REPORT_DRIVER_TYPES } from '../types';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import Constants from '../../../utils/constants';
import Url from '../../../utils/url';
import _get from 'lodash/get';
import i18next from 'i18next';

import { uploadReportDriverPhoto } from '../../../utils/aws-s3';
import { actions as appActions } from './app';

import { getReceiptNumber } from './thankYou';

const { ORDER_STATUS, REPORT_DRIVER_REASON_CODE } = Constants;

export const REPORT_DRIVER_FIELDS = {
  NOTES: 'notes',
  PHOTO: 'photo',
};

export const REPORT_DRIVER_REASONS = [
  {
    code: REPORT_DRIVER_REASON_CODE.FOOD_WAS_DAMAGED,
    fields: [REPORT_DRIVER_FIELDS.NOTES, REPORT_DRIVER_FIELDS.PHOTO],
    i18n_key: 'Reasons_foodWasDamaged',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.DRIVER_WAS_LATE,
    fields: [REPORT_DRIVER_FIELDS.NOTES],
    i18n_key: 'Reasons_driverWasLate',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.DRIVER_WAS_RUDE,
    fields: [REPORT_DRIVER_FIELDS.NOTES],
    i18n_key: 'Reasons_driverWasRude',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.DRIVER_ASKED_MORE_MONEY,
    fields: [REPORT_DRIVER_FIELDS.NOTES],
    i18n_key: 'Reasons_driverAskedMoreMoney',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.OTHERS,
    fields: [REPORT_DRIVER_FIELDS.NOTES],
    i18n_key: 'Reasons_others',
  },
];

export const SUBMIT_STATUS = {
  NOT_SUBMIT: 'NOT_SUBMIT',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
};

export const CAN_REPORT_STATUS_LIST = [ORDER_STATUS.DELIVERED, ORDER_STATUS.PICKED_UP];

const initialState = {
  inputNotes: '',
  selectedReasonCode: null,
  uploadPhoto: {
    url: '',
    file: null, // File Object https://developer.mozilla.org/en-US/docs/Web/API/File
    location: '', // uploaded aws s3 location
  },
  submitStatus: SUBMIT_STATUS.NOT_SUBMIT,
  showPageLoader: true,
};

export const actions = {
  updateInputNotes: notes => ({
    type: REPORT_DRIVER_TYPES.UPDATE_INPUT_NOTES,
    notes,
  }),
  setUploadPhotoFile: file => {
    return {
      type: REPORT_DRIVER_TYPES.SET_UPLOAD_PHOTO_FILE,
      file,
      url: window.URL.createObjectURL(file),
    };
  },
  removeUploadPhotoFile: () => (dispatch, getState) => {
    const url = getUploadPhotoUrl(getState());

    window.URL.revokeObjectURL(url);

    return dispatch({
      type: REPORT_DRIVER_TYPES.REMOVE_UPLOAD_PHOTO_FILE,
    });
  },
  setUploadPhotoFileLocation: location => ({
    type: REPORT_DRIVER_TYPES.SET_UPLOAD_PHOTO_LOCATION,
    location,
  }),
  selectReasonCode: reasonCode => {
    return {
      type: REPORT_DRIVER_TYPES.SELECT_REASON_CODE,
      reasonCode,
    };
  },
  updateSubmitStatus: submitStatus => ({
    type: REPORT_DRIVER_TYPES.UPDATE_SUBMIT_STATUS,
    submitStatus,
  }),
  submitReport: () => async (dispatch, getState) => {
    const state = getState();
    const selectedReasonFields = getSelectedReasonFields(state);
    const selectedReasonCode = getSelectedReasonCode(state);
    const receiptNumber = getReceiptNumber(state);
    const variables = {
      reasonCode: [selectedReasonCode],
      reporterType: 'consumer',
      receiptNumber,
    };

    dispatch(actions.updateSubmitStatus(SUBMIT_STATUS.IN_PROGRESS));

    if (selectedReasonFields.includes(REPORT_DRIVER_FIELDS.NOTES)) {
      variables.notes = getInputNotes(state).trim();
    }

    if (selectedReasonFields.includes(REPORT_DRIVER_FIELDS.PHOTO)) {
      const file = getUploadPhotoFile(state);
      let location = getUploadPhotoLocation(getState());

      if (!location) {
        try {
          const result = await uploadReportDriverPhoto(file);
          dispatch(actions.setUploadPhotoFileLocation(result.location));
          location = result.location;
        } catch (e) {
          console.error(e);
          dispatch(
            appActions.showError({
              message: i18next.t('ConnectionIssue'),
            })
          );
          dispatch(actions.updateSubmitStatus(SUBMIT_STATUS.NOT_SUBMIT));
          return false;
        }
      }

      variables.image = location;
    }

    const result = await dispatch({
      [FETCH_GRAPHQL]: {
        types: [
          REPORT_DRIVER_TYPES.SUBMIT_REPORT_REQUEST,
          REPORT_DRIVER_TYPES.SUBMIT_REPORT_SUCCESS,
          REPORT_DRIVER_TYPES.SUBMIT_REPORT_FAILURE,
        ],
        endpoint: Url.apiGql('CreateFeedBack'),
        variables,
      },
    });

    if (result.type === REPORT_DRIVER_TYPES.SUBMIT_REPORT_SUCCESS) {
      dispatch(actions.updateSubmitStatus(SUBMIT_STATUS.SUBMITTED));
    } else if (result.type === REPORT_DRIVER_TYPES.SUBMIT_REPORT_FAILURE) {
      dispatch(
        appActions.showError({
          message: i18next.t('ConnectionIssue'),
        })
      );
      dispatch(actions.updateSubmitStatus(SUBMIT_STATUS.NOT_SUBMIT));
    }
  },
  fetchReport: () => (dispatch, getState) => {
    const state = getState();
    const receiptNumber = getReceiptNumber(state);

    return dispatch({
      [FETCH_GRAPHQL]: {
        types: [
          REPORT_DRIVER_TYPES.FETCH_REPORT_REQUEST,
          REPORT_DRIVER_TYPES.FETCH_REPORT_SUCCESS,
          REPORT_DRIVER_TYPES.FETCH_REPORT_FAILURE,
        ],
        endpoint: Url.apiGql('QueryFeedBack'),
        variables: {
          receiptNumber,
        },
      },
    });
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case REPORT_DRIVER_TYPES.UPDATE_INPUT_NOTES:
      return {
        ...state,
        inputNotes: action.notes,
      };
    case REPORT_DRIVER_TYPES.SET_UPLOAD_PHOTO_FILE:
      return {
        ...state,
        uploadPhoto: {
          ...state.uploadPhoto,
          file: action.file,
          url: action.url,
          location: '',
        },
      };
    case REPORT_DRIVER_TYPES.REMOVE_UPLOAD_PHOTO_FILE:
      return {
        ...state,
        uploadPhoto: {
          ...state.uploadPhoto,
          file: null,
          url: '',
          location: '',
        },
      };
    case REPORT_DRIVER_TYPES.SET_UPLOAD_PHOTO_LOCATION:
      return {
        ...state,
        uploadPhoto: {
          ...state.uploadPhoto,
          location: action.location,
        },
      };
    case REPORT_DRIVER_TYPES.SELECT_REASON_CODE:
      return {
        ...state,
        selectedReasonCode: action.reasonCode,
      };
    case REPORT_DRIVER_TYPES.FETCH_REPORT_REQUEST:
      return {
        ...state,
        showPageLoader: true,
      };
    case REPORT_DRIVER_TYPES.UPDATE_SUBMIT_STATUS:
      return {
        ...state,
        submitStatus: action.submitStatus,
      };
    case REPORT_DRIVER_TYPES.FETCH_REPORT_SUCCESS:
      const reportData = _get(action.responseGql, 'data.queryFeedBack', null);
      if (reportData) {
        return {
          ...state,
          submitStatus: SUBMIT_STATUS.SUBMITTED,
          showPageLoader: false,
        };
      } else {
        return {
          ...state,
          submitStatus: SUBMIT_STATUS.NOT_SUBMIT,
          showPageLoader: false,
        };
      }
    case REPORT_DRIVER_TYPES.FETCH_REPORT_FAILURE:
      return {
        ...state,
        showPageLoader: false,
      };
    default:
      return state;
  }
};

export default reducer;

export const getInputNotes = state => {
  return _get(state.reportDriver, 'inputNotes', initialState.inputNotes);
};

export const getSelectedReasonCode = state => {
  return _get(state.reportDriver, 'selectedReasonCode', initialState.selectedReasonCode);
};

export const getSelectedReasonFields = createSelector([getSelectedReasonCode], reasonCode => {
  const reason = REPORT_DRIVER_REASONS.find(reason => {
    return reason.code === reasonCode;
  });
  return _get(reason, 'fields', []);
});

export const getSubmitStatus = state => {
  return _get(state.reportDriver, 'submitStatus', initialState.submitStatus);
};

export const getShowPageLoader = state => {
  return _get(state.reportDriver, 'showPageLoader', initialState.showPageLoader);
};

export const getUploadPhotoFile = state => {
  return _get(state.reportDriver, 'uploadPhoto.file', null);
};

export const getUploadPhotoUrl = state => {
  return _get(state.reportDriver, 'uploadPhoto.url', '');
};

export const getUploadPhotoLocation = state => {
  return _get(state.reportDriver, 'uploadPhoto.location', '');
};
