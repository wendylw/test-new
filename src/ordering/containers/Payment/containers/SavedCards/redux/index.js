import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { get } from '../../../../../../utils/api/api-fetch';
import Url from '../../../../../../utils/url';

const thunks = {
  fetchSavedCard: createAsyncThunk('ordering/payments/savedCards/fetchSavedCard', async ({ userId, paymentName }) => {
    return get(Url.API_URLS.GET_SAVED_CARD(userId).url, { queryParams: { provider: paymentName } });
  }),
};

const initialState = {
  selectedPaymentCard: null,
  cardList: [],
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
    [thunks.fetchSavedCard.fulfilled.type]: (state, { payload }) => {
      state.cardList = payload.paymentMethods;
    },
  },
});

export { actions, thunks };

export default reducer;
