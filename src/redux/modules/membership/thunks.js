import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { alert } from '../../../common/utils/feedback';
import { postUserMembership, getMembershipsInfo } from './api-request';

export const joinMembership = createAsyncThunk(
  'app/membership/joinMembership',
  async ({ business, source, consumerId, storeId }) => {
    try {
      const result = await postUserMembership({ consumerId, business, source, storeId });
      return result;
    } catch (error) {
      alert(i18next.t('UnknownErrorDescription'), {
        title: i18next.t('UnknownErrorTitle'),
      });
      throw error;
    }
  }
);

export const fetchMembershipsInfo = createAsyncThunk('app/membership/fetchMembershipsInfo', async business => {
  const result = await getMembershipsInfo(business);

  return result;
});
