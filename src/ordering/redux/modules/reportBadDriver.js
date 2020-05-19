import { REPORT_BAD_DRIVER_TYPES } from '../types';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import Constants from '../../../utils/constants';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import _get from 'lodash/get';
import { createSelector } from 'reselect';

import { getOrder } from './thankYou';

const { ORDER_STATUS } = Constants;
const COMMON_ISSUES_CODES = ['foodWasDamaged', 'riderNeverContactedMe', 'driverWasRude', 'driverAskedMoreMoney'];

export const SUBMIT_STATUS = {
  NOT_SUBMIT: 'NOT_SUBMIT',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
};

export const CAN_REPORT_STATUS_LIST = [ORDER_STATUS.DELIVERED, ORDER_STATUS.PICKED_UP];

const initialState = {
  inputNotes: '',
  selectedCommonIssues: new Set(),
  submitStatus: SUBMIT_STATUS.NOT_SUBMIT,
};

export const actions = {
  updateInputNodes: notes => {
    return {
      type: REPORT_BAD_DRIVER_TYPES.UPDATE_INPUT_NOTES,
      notes,
    };
  },
  setSelectedCommonIssues: commonIssues => {
    return {
      type: REPORT_BAD_DRIVER_TYPES.SET_SELECTED_COMMON_ISSUES,
      commonIssues,
    };
  },
  addSelectedCommonIssues: commonIssue => {
    return {
      type: REPORT_BAD_DRIVER_TYPES.ADD_SELECTED_COMMON_ISSUES,
      commonIssue,
    };
  },
  removeSelectedCommonIssues: commonIssue => {
    return {
      type: REPORT_BAD_DRIVER_TYPES.REMOVE_SELECTED_COMMON_ISSUES,
      commonIssue,
    };
  },
  submitReport: () => (dispatch, getState) => {
    const state = getState();
    const inputNotes = getInputNotes(state);
    const selectedCommonIssues = getSelectedCommonIssues(state);
    const receiptNumber = getReceiptNumber(state);

    return dispatch({
      [FETCH_GRAPHQL]: {
        types: [
          REPORT_BAD_DRIVER_TYPES.SUBMIT_REPORT_REQUEST,
          REPORT_BAD_DRIVER_TYPES.SUBMIT_REPORT_SUCCESS,
          REPORT_BAD_DRIVER_TYPES.SUBMIT_REPORT_FAILURE,
        ],
        endpoint: Url.apiGql('CreateFeedBack'),
        variables: {
          reasonCode: Array.from(selectedCommonIssues),
          notes: inputNotes,
          reporterType: 'consumer',
          receiptNumber,
        },
      },
    });
  },
  fetchReport: () => (dispatch, getState) => {
    const state = getState();
    const receiptNumber = getReceiptNumber(state);

    return dispatch({
      [FETCH_GRAPHQL]: {
        types: [
          REPORT_BAD_DRIVER_TYPES.FETCH_REPORT_REQUEST,
          REPORT_BAD_DRIVER_TYPES.FETCH_REPORT_SUCCESS,
          REPORT_BAD_DRIVER_TYPES.FETCH_REPORT_FAILURE,
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
    case REPORT_BAD_DRIVER_TYPES.UPDATE_INPUT_NOTES:
      return {
        ...state,
        inputNotes: action.notes,
      };
    case REPORT_BAD_DRIVER_TYPES.SET_SELECTED_COMMON_ISSUES:
      return {
        ...state,
        commonIssues: action.commonIssues,
      };
    case REPORT_BAD_DRIVER_TYPES.ADD_SELECTED_COMMON_ISSUES:
      state.selectedCommonIssues.add(action.commonIssue);
      return {
        ...state,
        selectedCommonIssues: new Set(state.selectedCommonIssues),
      };
    case REPORT_BAD_DRIVER_TYPES.REMOVE_SELECTED_COMMON_ISSUES:
      state.selectedCommonIssues.delete(action.commonIssue);
      return {
        ...state,
        selectedCommonIssues: new Set(state.selectedCommonIssues),
      };
    case REPORT_BAD_DRIVER_TYPES.SUBMIT_REPORT_REQUEST:
      return {
        ...state,
        submitStatus: SUBMIT_STATUS.IN_PROGRESS,
      };
    case REPORT_BAD_DRIVER_TYPES.SUBMIT_REPORT_SUCCESS:
      return {
        ...state,
        submitStatus: SUBMIT_STATUS.SUBMITTED,
      };
    case REPORT_BAD_DRIVER_TYPES.SUBMIT_REPORT_FAILURE:
      return {
        ...state,
        submitStatus: SUBMIT_STATUS.NOT_SUBMIT,
      };
    case REPORT_BAD_DRIVER_TYPES.FETCH_REPORT_SUCCESS:
      const reportData = _get(action.responseGql, 'data.queryFeedBack', null);
      if (reportData) {
        return {
          ...state,
          inputNotes: reportData.notes,
          selectedCommonIssues: new Set(reportData.reasonCode),
          submitStatus: SUBMIT_STATUS.SUBMITTED,
        };
      } else {
        return state;
      }
    default:
      return state;
  }
};

export default reducer;

export const getReceiptNumber = state => {
  return Utils.getQueryString('receiptNumber');
};

export const getInputNotes = state => {
  return _get(state.reportBadDriver, 'inputNotes', initialState.inputNotes);
};

export const getSelectedCommonIssues = state => {
  return _get(state.reportBadDriver, 'selectedCommonIssues', initialState.selectedCommonIssues);
};

export const getSubmitStatus = state => {
  return _get(state.reportBadDriver, 'submitStatus', initialState.submitStatus);
};

export const getCommonIssuesCodes = state => {
  return COMMON_ISSUES_CODES;
};

export const getOrderStatus = createSelector([getOrder], order => {
  return _get(order, 'status', '');
});

export const getIsUseStorehubLogistics = createSelector([getOrder], order => {
  return _get(order, 'deliveryInformation.0.useStorehubLogistics', false);
});
