import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';
import { getCookieVariable } from '../../../../../common/utils';
import { mounted } from './thunks';

const initialState = {
  foodCourtId: getCookieVariable('__sh_fc_id'),
  foodCourtTableId: getCookieVariable('__sh_fc_tid'),
  foodCourtStoreList: { status: API_REQUEST_STATUS.PENDING, data: [] },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/foodCourt/common',
  initialState,
  reducers: {},
  extraReducers: {
    [mounted.pending.type]: state => {
      state.foodCourtStoreList.status = API_REQUEST_STATUS.PENDING;
    },
    [mounted.fulfilled.type]: (state, { payload }) => {
      state.foodCourtStoreList.status = API_REQUEST_STATUS.FULFILLED;
      state.foodCourtStoreList.data = payload;
    },
    [mounted.rejected.type]: state => {
      state.foodCourtStoreList.status = API_REQUEST_STATUS.REJECTED;
      state.foodCourtStoreList.data = [];
    },
  },
});

export default reducer;
