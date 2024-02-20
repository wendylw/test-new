import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { alert } from '../../../common/utils/feedback';
import { postUserMembership, getMembershipTiers } from './api-request';

export const joinMembership = createAsyncThunk(
  'app/membership/joinMembership',
  async ({ business, source, consumerId }) => {
    try {
      const result = await postUserMembership({ consumerId, business, source });
      return result;
    } catch (error) {
      alert(i18next.t('UnknownErrorDescription'), {
        title: i18next.t('UnknownErrorTitle'),
      });
      throw error;
    }
  }
);

export const fetchMembershipTierList = createAsyncThunk('app/membership/fetchMembershipTierList', async business => {
  const result = await getMembershipTiers(business);

  return result;
});
