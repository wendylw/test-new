import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUniquePromoList } from './api-request';
import { getConsumerId } from '../../../../../../redux/modules/user/selectors';
import { getMerchantBusiness } from '../../../../../redux/modules/merchant/selectors';

export const fetchUniquePromoList = createAsyncThunk(
  'rewards/business/memberDetail/fetchPromoList',
  async (_, { getState }) => {
    const state = getState();
    const consumerId = getConsumerId(state);
    const business = getMerchantBusiness(state);
    const result = await getUniquePromoList({ consumerId, business });

    return result;
  }
);
