import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { get } from '../../../../../utils/api/api-fetch';
import Url from '../../../../../utils/url';

const thunks = {
  fetchSavedCard: createAsyncThunk('FETCH_SAVED_CARD', async ({ userId, paymentName }) => {
    return get(Url.API_URLS.GET_SAVED_CARD(userId).url, { queryParams: { provider: paymentName } });
  }),
};

const initialState = {
  selectedPaymentCard: null,
  cardList: [],
};

const { reducer, actions } = createSlice({
  name: 'ORDERING/PAYMENTS/SAVED_CARDS',
  initialState,
  reducers: {
    setPaymentCard: (state, { payload }) => {
      state.selectedPaymentCard = payload;
    },
  },
  extraReducers: {
    [thunks.fetchSavedCard.fulfilled.type]: (state, { payload }) => {
      state.cardList = payload.paymentMethods;
    },
  },
});

export { actions, thunks };

export default reducer;
