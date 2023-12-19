import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../utils/constants';

const initialState = {
  claimPromoRequest: {
    data: null,
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'rewards/business/claimUniquePromo',
  initialState,
  reducers: {},
  extraReducers: {},
});

export default reducer;
