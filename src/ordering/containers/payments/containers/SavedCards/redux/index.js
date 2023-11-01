import _first from 'lodash/first';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { get } from '../../../../../../utils/api/api-fetch';
import Url from '../../../../../../utils/url';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';

const thunks = {
  fetchSavedCards: createAsyncThunk('ordering/payments/savedCards/fetchSavedCards', async ({ userId, paymentName }) =>
    get(Url.API_URLS.GET_SAVED_CARD(userId).url, { queryParams: { provider: paymentName } })
  ),
};

const initialState = {
  selectedPaymentCard: null,
  cardList: [],
  loadSavedCardsStatus: false,
};

const { reducer, actions } = createSlice({
  name: 'ordering/payments/savedCards',
  initialState,
  reducers: {
    setPaymentCard: (state, { payload }) => {
      state.selectedPaymentCard = payload;
    },
  },
  extraReducers: {
    [thunks.fetchSavedCards.pending.type]: state => {
      state.loadSavedCardsStatus = API_REQUEST_STATUS.PENDING;
    },
    [thunks.fetchSavedCards.fulfilled.type]: (state, { payload }) => {
      state.cardList = payload.paymentMethods;
      state.selectedPaymentCard = state.selectedPaymentCard || _first(state.cardList);
      state.loadSavedCardsStatus = API_REQUEST_STATUS.FULFILLED;
    },
    [thunks.fetchSavedCards.rejected.type]: state => {
      state.loadSavedCardsStatus = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export { actions, thunks };

export default reducer;
