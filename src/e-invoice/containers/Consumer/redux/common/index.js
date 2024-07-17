import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const { reducer, actions } = createSlice({
  name: 'eInvoice/consumer/common',
  initialState,
  reducers: {},
  extraReducers: {},
});

export { actions };

export default reducer;
