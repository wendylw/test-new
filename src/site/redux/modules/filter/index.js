import { createSlice } from '@reduxjs/toolkit';
import {
  loadSearchOptionList,
  loadSelectedOptionList,
  backUpSelectedOptionList,
  resetSelectedOptionList,
  updateCategorySelectStatus,
  updateCategoryOptionSelectStatus,
  resetCategoryAllOptionSelectStatus,
} from './thunks';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import { DEFAULT_SELECTED_OPTION_LIST } from './constants';

const initialState = {
  searchOptionList: {
    data: [],
    status: null,
    error: null,
  },
  selectedOptionList: {
    // Data Structure: { [categoryId]: { options: [optionId] } }
    data: DEFAULT_SELECTED_OPTION_LIST,
    updateDataRequest: {
      status: null,
      error: null,
    },
    loadDataRequest: {
      status: null,
      error: null,
    },
    backUpDataRequest: {
      status: null,
      error: null,
    },
    resetDataRequest: {
      status: null,
      error: null,
    },
  },
};

export const { reducer, actions } = createSlice({
  name: 'site/filter',
  initialState,
  reducers: {},
  extraReducers: {
    [loadSearchOptionList.pending.type]: state => {
      state.searchOptionList.status = API_REQUEST_STATUS.PENDING;
      state.searchOptionList.error = null;
    },
    [loadSearchOptionList.fulfilled.type]: (state, action) => {
      state.searchOptionList.data = action.payload;
      state.searchOptionList.status = API_REQUEST_STATUS.FULFILLED;
      state.searchOptionList.error = null;
    },
    [loadSearchOptionList.rejected.type]: (state, action) => {
      state.searchOptionList.status = API_REQUEST_STATUS.REJECTED;
      state.searchOptionList.error = action.error;
    },
    [loadSelectedOptionList.pending.type]: state => {
      state.selectedOptionList.loadDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.selectedOptionList.loadDataRequest.error = null;
    },
    [loadSelectedOptionList.fulfilled.type]: (state, action) => {
      state.selectedOptionList.data = action.payload;
      state.selectedOptionList.loadDataRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.selectedOptionList.loadDataRequest.error = null;
    },
    [loadSelectedOptionList.rejected.type]: (state, action) => {
      state.selectedOptionList.loadDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.selectedOptionList.loadDataRequest.error = action.error;
    },
    [backUpSelectedOptionList.pending.type]: state => {
      state.selectedOptionList.backUpDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.selectedOptionList.backUpDataRequest.error = null;
    },
    [backUpSelectedOptionList.fulfilled.type]: state => {
      state.selectedOptionList.backUpDataRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.selectedOptionList.backUpDataRequest.error = null;
    },
    [backUpSelectedOptionList.rejected.type]: (state, action) => {
      state.selectedOptionList.backUpDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.selectedOptionList.backUpDataRequest.error = action.error;
    },
    [resetSelectedOptionList.pending.type]: state => {
      state.selectedOptionList.resetDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.selectedOptionList.resetDataRequest.error = null;
    },
    [resetSelectedOptionList.fulfilled.type]: (state, action) => {
      state.selectedOptionList.data = action.payload;
      state.selectedOptionList.resetDataRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.selectedOptionList.resetDataRequest.error = null;
    },
    [resetSelectedOptionList.rejected.type]: (state, action) => {
      state.selectedOptionList.resetDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.selectedOptionList.resetDataRequest.error = action.error;
    },
    [updateCategorySelectStatus.pending.type]: state => {
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.selectedOptionList.updateDataRequest.error = null;
    },
    [updateCategorySelectStatus.fulfilled.type]: (state, action) => {
      state.selectedOptionList.data = action.payload;
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.selectedOptionList.updateDataRequest.error = null;
    },
    [updateCategorySelectStatus.rejected.type]: (state, action) => {
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.selectedOptionList.updateDataRequest.error = action.error;
    },
    [updateCategoryOptionSelectStatus.pending.type]: state => {
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.selectedOptionList.updateDataRequest.error = null;
    },
    [updateCategoryOptionSelectStatus.fulfilled.type]: (state, action) => {
      state.selectedOptionList.data = action.payload;
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.selectedOptionList.updateDataRequest.error = null;
    },
    [updateCategoryOptionSelectStatus.rejected.type]: (state, action) => {
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.selectedOptionList.updateDataRequest.error = action.error;
    },
    [resetCategoryAllOptionSelectStatus.pending.type]: state => {
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.PENDING;
      state.selectedOptionList.updateDataRequest.error = null;
    },
    [resetCategoryAllOptionSelectStatus.fulfilled.type]: (state, action) => {
      state.selectedOptionList.data = action.payload;
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.selectedOptionList.updateDataRequest.error = null;
    },
    [resetCategoryAllOptionSelectStatus.rejected.type]: (state, action) => {
      state.selectedOptionList.updateDataRequest.status = API_REQUEST_STATUS.REJECTED;
      state.selectedOptionList.updateDataRequest.error = action.error;
    },
  },
});

export default reducer;
