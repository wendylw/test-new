import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  passportNo: '',
  taxIdentificationNo: '',
  phone: '',
  email: '',
  classification: false,
  billingAddress: {
    countryCode: '',
    state: '',
    city: '',
    postCode: '',
    street1: '',
    street2: '',
  },
};

const { reducer, actions } = createSlice({
  name: 'eInvoice/consumer/submission/nonMalaysian',
  initialState,
  reducers: {
    nameUpdated: (state, { payload }) => {
      state.name = payload || '';
    },
    passportNoUpdated: (state, { payload }) => {
      state.passportNo = payload || '';
    },
    taxIdentificationNoUpdated: (state, { payload }) => {
      state.taxIdentificationNo = payload || '';
    },
    phoneUpdated: (state, { payload }) => {
      state.phone = payload || '';
    },
    emailUpdated: (state, { payload }) => {
      state.email = payload || '';
    },
    classificationUpdated: (state, { payload }) => {
      state.classification = payload || '';
    },
    billingAddressUpdated: (state, { payload }) => {
      state.billingAddress = {
        ...initialState.billingAddress,
        ...(payload || {}),
      };
    },
    stateSet: (_, { payload }) => payload,
  },
  extraReducers: {},
});

export { actions };

export default reducer;
