import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  businessRegistrationNo: '',
  taxIdentificationNo: '',
  SSTRegistrationNo: '',
  phone: '',
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
  name: 'eInvoice/business/submission',
  initialState,
  reducers: {
    nameUpdated: (state, { payload }) => {
      state.name = payload || '';
    },
    businessRegistrationNoUpdated: (state, { payload }) => {
      state.businessRegistrationNo = payload || '';
    },
    taxIdentificationNoUpdated: (state, { payload }) => {
      state.taxIdentificationNo = payload || '';
    },
    SSTRegistrationNoUpdated: (state, { payload }) => {
      state.SSTRegistrationNo = payload || '';
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
