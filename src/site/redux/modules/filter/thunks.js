import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSearchOptionList } from './api-request';
import { getCategoryFilterList } from './selectors';
import { transformSearchOptionList } from './utils';

export const loadSearchOptionList = createAsyncThunk('site/common/search/loadSearchOptionList', async ({ key }) => {
  const backupData = sessionStorage.getItem(key);

  if (backupData) return JSON.parse(backupData);

  const data = await fetchSearchOptionList();

  return transformSearchOptionList(data);
});

export const backUpSearchOptionList = createAsyncThunk(
  'site/common/search/backupSearchOptionList',
  async ({ key }, { getState }) => {
    const data = getCategoryFilterList(getState());
    sessionStorage.setItem(key, JSON.stringify(data));
  }
);

export const resetSearchOptionList = createAsyncThunk(
  'site/common/search/clearSearchOptionListBackup',
  async ({ key }, { getState }) => {
    sessionStorage.removeItem(key);

    const data = getCategoryFilterList(getState());

    return transformSearchOptionList(data);
  }
);
