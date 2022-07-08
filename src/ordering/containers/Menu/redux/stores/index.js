import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';
import { storeDrawerShown } from './thunks';

const initialState = {
  storeListInfo: {
    data: [],
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/stores',
  initialState,
  extraReducers: {
    [storeDrawerShown.pending.type]: state => {
      state.storeListInfo.status = API_REQUEST_STATUS.PENDING;
      state.storeListInfo.error = null;
    },
    [storeDrawerShown.fulfilled.type]: (state, action) => {
      state.storeListInfo.data = action.payload;
      state.storeListInfo.status = API_REQUEST_STATUS.FULFILLED;
    },
    [storeDrawerShown.rejected.type]: (state, action) => {
      state.storeListInfo.status = API_REQUEST_STATUS.REJECTED;
      state.storeListInfo.error = action.error;
    },
  },
});

export default reducer;
