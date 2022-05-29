import { createSlice } from '@reduxjs/toolkit';
import { loadSearchOptionList, backUpSearchOptionList, resetSearchOptionList } from './thunks';
import { API_REQUEST_STATUS } from '../../../../utils/constants';
import { transformSearchOptionList } from './utils';
import { TYPES, SORT_BY_OPTION_DEFAULT_ID } from './constants';

const initialState = {
  searchOptionList: {
    data: [],
    loadDataStatus: null,
    backUpDataStatus: null,
    resetDataStatus: null,
    loadDataError: null,
    backUpDataError: null,
    resetDataError: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'site/filter',
  initialState,
  reducers: {
    updateCategoryOptionSelectStatus(state, action) {
      const { categoryId, option: selectedOption } = action.payload;
      const { id: optionId, name: optionName } = selectedOption;
      const prevData = state.searchOptionList.data;
      const newData = prevData.map(category => {
        if (category.id === categoryId) {
          if (category.type === TYPES.SINGLE_SELECT) {
            // TODO: This part of the code is tricky and needs to be refactored if the designer comes up with a better idea for the feature.
            return {
              ...category,
              options: category.options.map(option => ({ ...option, selected: option.id === optionId })),
              selected: optionId !== SORT_BY_OPTION_DEFAULT_ID,
              displayInfo: {
                ...category.displayInfo,
                name: `${category.name}${optionId !== SORT_BY_OPTION_DEFAULT_ID ? ` ${optionName}` : ''}`,
              },
            };
          }
        }
        return category;
      });
      state.searchOptionList.data = newData;
    },
    updateCategoryAllOptionSelectStatus(state, action) {
      const { categoryId, options } = action.payload;
      const prevData = state.searchOptionList.data;
      const newData = prevData.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            options,
            selected: options.some(option => option.selected),
          };
        }
        return category;
      });
      state.searchOptionList.data = newData;
    },
    resetCategoryAllOptionSelectStatus(state, action) {
      const { categoryId } = action.payload;
      const prevData = state.searchOptionList.data;
      const newData = prevData.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            options: category.options.map(option => ({ ...option, selected: false })),
            selected: false,
          };
        }
        return category;
      });
      state.searchOptionList.data = newData;
    },
    updateCategorySelectStatus(state, action) {
      const { id } = action.payload;
      const prevData = state.searchOptionList.data;
      const newData = prevData.map(category => {
        if (category.id === id) {
          category.selected = !category.selected;
        }
        return category;
      });
      state.searchOptionList.data = newData;
    },
    resetAllSelectStatus(state) {
      const prevData = state.searchOptionList.data;
      state.searchOptionList.data = transformSearchOptionList(prevData);
    },
  },
  extraReducers: {
    [loadSearchOptionList.pending.type]: state => {
      state.searchOptionList.loadDataStatus = API_REQUEST_STATUS.PENDING;
      state.searchOptionList.loadDataError = null;
    },
    [loadSearchOptionList.fulfilled.type]: (state, action) => {
      state.searchOptionList.data = action.payload;
      state.searchOptionList.loadDataStatus = API_REQUEST_STATUS.FULFILLED;
      state.searchOptionList.loadDataError = null;
    },

    [loadSearchOptionList.rejected.type]: (state, action) => {
      state.searchOptionList.loadDataStatus = API_REQUEST_STATUS.REJECTED;
      state.searchOptionList.loadDataError = action.error;
    },
    [backUpSearchOptionList.pending.type]: state => {
      state.searchOptionList.backUpDataStatus = API_REQUEST_STATUS.PENDING;
      state.searchOptionList.backUpDataError = null;
    },
    [backUpSearchOptionList.fulfilled.type]: state => {
      state.searchOptionList.backUpDataStatus = API_REQUEST_STATUS.FULFILLED;
      state.searchOptionList.backUpDataError = null;
    },
    [backUpSearchOptionList.rejected.type]: state => {
      state.searchOptionList.backUpDataStatus = API_REQUEST_STATUS.REJECTED;
      state.searchOptionList.backUpDataError = null;
    },
    [resetSearchOptionList.pending.type]: state => {
      state.searchOptionList.resetDataStatus = API_REQUEST_STATUS.PENDING;
      state.searchOptionList.resetDataError = null;
    },
    [resetSearchOptionList.fulfilled.type]: (state, action) => {
      state.searchOptionList.data = action.payload;
      state.searchOptionList.resetDataStatus = API_REQUEST_STATUS.FULFILLED;
      state.searchOptionList.resetDataError = null;
    },
    [resetSearchOptionList.rejected.type]: state => {
      state.searchOptionList.resetDataStatus = API_REQUEST_STATUS.REJECTED;
      state.searchOptionList.resetDataError = null;
    },
  },
});

export default reducer;
