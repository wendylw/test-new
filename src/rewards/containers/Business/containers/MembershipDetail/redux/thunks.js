import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPromoList } from './api-request';
import { getConsumerId } from '../../../../../../redux/modules/user/selectors';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';

export const fetchPromoList = createAsyncThunk(
  'rewards/business/memberDetail/fetchPromoList',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const result = await getPromoList({ consumerId, business });

    return result;
  }
);
