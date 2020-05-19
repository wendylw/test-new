import { combineReducers } from 'redux';
import { REPORT_BAD_DRIVER_TYPES } from '../types';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import _get from 'lodash/get';

const COMMON_ISSUES_CODES = ['foodWasDamaged', 'riderNeverContactedMe', 'driverWasRude', 'driverAskedMoreMoney'];

const initialState = {
  inputNotes: '',
  selectedCommonIssues: new Set(),
  order: null,
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
  loadOrder: () => async (dispatch, getState) => {
    const receiptNumber = getReceiptNumber(getState());
    const result = await dispatch({
      [FETCH_GRAPHQL]: {
        types: [
          REPORT_BAD_DRIVER_TYPES.FETCH_ORDER_REQUEST,
          REPORT_BAD_DRIVER_TYPES.FETCH_ORDER_SUCCESS,
          REPORT_BAD_DRIVER_TYPES.FETCH_ORDER_FAILURE,
        ],
        endpoint: Url.apiGql('Order'),
        variables: {
          orderId: receiptNumber,
        },
      },
    });

    return result;
  },
};

const inputNotesReducer = (state = initialState.inputNotes, action) => {
  switch (action.type) {
    case REPORT_BAD_DRIVER_TYPES.UPDATE_INPUT_NOTES:
      return action.notes;
    default:
      return state;
  }
};

const selectedCommonIssuesReducer = (state = initialState.selectedCommonIssues, action) => {
  switch (action.type) {
    case REPORT_BAD_DRIVER_TYPES.SET_SELECTED_COMMON_ISSUES:
      return new Set(action.commonIssues);
    case REPORT_BAD_DRIVER_TYPES.ADD_SELECTED_COMMON_ISSUES:
      state.add(action.commonIssue);
      return new Set(state);
    case REPORT_BAD_DRIVER_TYPES.REMOVE_SELECTED_COMMON_ISSUES:
      state.delete(action.commonIssue);
      return new Set(state);
    default:
      return state;
  }
};

const orderReducer = (state = initialState.order, action) => {
  switch (action.type) {
    case REPORT_BAD_DRIVER_TYPES.FETCH_ORDER_SUCCESS:
      return action.responseGql.data.order;
    default:
      return state;
  }
};

export default combineReducers({
  inputNotes: inputNotesReducer,
  selectedCommonIssues: selectedCommonIssuesReducer,
  order: orderReducer,
});

export const getReceiptNumber = state => {
  return Utils.getQueryString('receiptNumber');
};

export const getInputNotes = state => {
  return _get(state.reportBadDriver, 'inputNotes', initialState.inputNotes);
};

export const getSelectedCommonIssues = state => {
  return _get(state.reportBadDriver, 'selectedCommonIssues', initialState.selectedCommonIssues);
};

export const getCommonIssuesCodes = state => {
  return COMMON_ISSUES_CODES;
};

export const getOrderStatus = state => {
  return _get(state.reportBadDriver, 'order.status', '');
};

export const getIsUseStorehubLogistics = state => {
  return _get(state.reportBadDriver, 'order.deliveryInformation.0.useStorehubLogistics', false);
};
