import _omit from 'lodash/omit';
import _isEmpty from 'lodash/isEmpty';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSearchOptionList } from './api-request';
import { getSelectedOptionList } from './selectors';
import { transformSearchOptionList } from './utils';
import { DEFAULT_SELECTED_OPTION_LIST } from './constants';

export const loadSelectedOptionList = createAsyncThunk('site/filter/loadSelectedOptionList', async ({ key }) => {
  const backupData = sessionStorage.getItem(key);

  if (backupData) return JSON.parse(backupData);

  return DEFAULT_SELECTED_OPTION_LIST;
});

export const loadSearchOptionList = createAsyncThunk(
  'site/filter/loadSearchOptionList',
  async ({ key }, { getState, dispatch }) => {
    await dispatch(loadSelectedOptionList({ key }));
    const selectedOptionList = getSelectedOptionList(getState());
    const data = await fetchSearchOptionList();

    return transformSearchOptionList(data, selectedOptionList);
  }
);

export const backUpSelectedOptionList = createAsyncThunk(
  'site/filter/backUpSelectedOptionList',
  async ({ key }, { getState }) => {
    const data = getSelectedOptionList(getState());
    sessionStorage.setItem(key, JSON.stringify(data));
  }
);

export const resetSelectedOptionList = createAsyncThunk('site/filter/resetSelectedOptionList', async ({ key }) => {
  sessionStorage.removeItem(key);

  return DEFAULT_SELECTED_OPTION_LIST;
});

export const toggleCategorySelectStatus = createAsyncThunk(
  'site/filter/toggleCategorySelectStatus',
  async ({ categoryId }, { getState }) => {
    const state = getState();
    const prevData = getSelectedOptionList(state);

    if (prevData[categoryId]) {
      return _omit(prevData, [categoryId]);
    }

    return { ...prevData, [categoryId]: {} };
  }
);

export const updateCategoryOptionSelectStatus = createAsyncThunk(
  'site/filter/updateCategoryOptionSelectStatus',
  async ({ categoryId, optionIds }, { getState }) => {
    const state = getState();
    const prevData = getSelectedOptionList(state);

    // If the selected option list is empty, remove the category from the selected list.
    // This is to prevent the category from being mistakenly selected when the user selects nothing.
    if (_isEmpty(optionIds)) {
      return _omit(prevData, [categoryId]);
    }

    return { ...prevData, [categoryId]: { options: [...optionIds] } };
  }
);

export const resetCategoryAllOptionSelectStatus = createAsyncThunk(
  'site/filter/resetCategoryAllOptionSelectStatus',
  async ({ categoryId }, { getState }) => {
    const state = getState();
    const prevData = getSelectedOptionList(state);

    return _omit(prevData, [categoryId]);
  }
);
