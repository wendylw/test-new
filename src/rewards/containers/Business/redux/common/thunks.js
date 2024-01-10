import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { alert } from '../../../../../common/utils/feedback';
import { getQueryString } from '../../../../../common/utils';
import { postUserMembership, postSharingConsumerInfoToMerchant, getBusinessInfo } from './api-request';
import { getConsumerId } from '../../../../../redux/modules/user/selectors';
import { getMerchantBusiness } from '../../../../redux/modules/merchant/selectors';
import { fetchCustomerInfo } from '../../../../redux/modules/customer/thunks';
import Growthbook from '../../../../../utils/growthbook';

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
      const result = await postUserMembership({ consumerId, business, source });
      await dispatch(loadCustomerInfo());
      return result;
    } catch (error) {
      alert(i18next.t('UnknownErrorDescription'), {
        title: i18next.t('UnknownErrorTitle'),
      });
      throw error;
    }
  }
);

export const confirmToShareConsumerInfoRequests = createAsyncThunk(
  'rewards/business/seamlessLoyalty/confirmToShareConsumerInfoRequests',
  async (requestId, { getState }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const result = await postSharingConsumerInfoToMerchant({ requestId, business: merchantBusiness });

    return result;
  }
);

export const fetchBusinessInfo = createAsyncThunk('rewards/business/common/fetchBusinessInfo', async business => {
  const result = await getBusinessInfo(business);
  const { country } = result || {};

  Growthbook.patchAttributes({ country });

  return result;
});
