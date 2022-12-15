import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { get } from '../../../../../../utils/api/api-fetch';
import Url from '../../../../../../utils/url';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import _first from 'lodash/first';
import logger from '../../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../../utils/monitoring/constants';

const thunks = {
  fetchSavedCards: createAsyncThunk('ordering/payments/savedCards/fetchSavedCards', async ({ userId, paymentName }) => {
    try {
      return get(Url.API_URLS.GET_SAVED_CARD(userId).url, { queryParams: { provider: paymentName } });
    } catch (error) {
      logger.error(
        'Ordering_StripeCreditCard_InitializeFailed',
        {
          message: `Failed to drawer credit card UI`,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.CHECKOUT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SelectPaymentMethod,
          },
        }
      );
    }
  }),
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
