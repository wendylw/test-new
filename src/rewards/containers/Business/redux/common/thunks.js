import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { alert } from '../../../../../common/utils/feedback';
import { getQueryString } from '../../../../../common/utils';
import { postUserMembership } from './api-request';
import { getConsumerId } from '../../../../../redux/modules/user/selectors';
import { fetchCustomerInfo } from '../../../../redux/modules/customer/thunks';

export const loadCustomerInfo = createAsyncThunk(
  'rewards/business/common/loadCustomerInfo',
  async (_, { dispatch }) => {
    const business = getQueryString('business');
    await dispatch(fetchCustomerInfo(business));
  }
);

export const joinMembership = createAsyncThunk(
  'rewards/business/common/joinMembership',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getQueryString('business');
    const source = getQueryString('source');

    try {
      await postUserMembership({ consumerId, business, source });
      await dispatch(loadCustomerInfo());
    } catch (error) {
      alert(i18next.t('UnknownErrorDescription'), {
        title: i18next.t('UnknownErrorTitle'),
      });
      throw error;
    }
  }
);
