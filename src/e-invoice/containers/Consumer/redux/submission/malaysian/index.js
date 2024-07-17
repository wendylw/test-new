import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  myKadIdentificationNo: '',
  phone: '',
  SSTRegistrationNo: '',
  email: '',
  classification: '',
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
  name: 'eInvoice/consumer/submission/malaysian',
  initialState,
  reducers: {
    nameUpdated: (state, { payload }) => {
      state.name = payload || '';
    },
    myKadIdentificationNoUpdated: (state, { payload }) => {
      state.myKadIdentificationNo = payload || '';
    },
    phoneUpdated: (state, { payload }) => {
      state.phone = payload || '';
    },
    SSTRegistrationNoUpdated: (state, { payload }) => {
      state.SSTRegistrationNo = payload || '';
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
