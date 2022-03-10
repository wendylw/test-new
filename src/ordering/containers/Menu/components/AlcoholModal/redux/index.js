/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { getUserAlcoholConsent } from './thunks';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';

const initialState = {
  alcoholConsent: {
    data: null,
    showModalVisibility: false,
    confirmNotLegal: false,
    status: null,
    error: null,
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/menu/alcohol',
  initialState,
  reducers: {
    setAlcoholModalVisibility(state, action) {
      state.alcoholConsent.showModalVisibility = action.payload;
    },
    setConfirmNotLegal(state, action) {
      state.alcoholConsent.confirmNotLegal = action.payload;
    },
  },
  extraReducers: {
    [getUserAlcoholConsent.pending.type]: state => {
      state.alcoholConsent.status = API_REQUEST_STATUS.PENDING;
    },
    [getUserAlcoholConsent.fulfilled.type]: (state, { payload }) => {
      state.alcoholConsent.data = payload;
      state.alcoholConsent.status = API_REQUEST_STATUS.FULFILLED;
    },
    [getUserAlcoholConsent.rejected.type]: (state, { error }) => {
      state.alcoholConsent.status = API_REQUEST_STATUS.REJECTED;
      state.alcoholConsent.error = error;
    },
  },
});

export default reducer;

export { actions };
