import { createSlice } from '@reduxjs/toolkit';
import Utils from '../../../../../../utils/utils';

const initialState = {
  offline: false,
};

export const { actions, reducer } = createSlice({
  name: 'ordering/orderStatus/storeReview',
  initialState,
  reducers: {
    init(state) {
      const offline = Utils.getQueryString('offline');
      state.offline = offline === 'true';
    },
  },
});

export default reducer;
